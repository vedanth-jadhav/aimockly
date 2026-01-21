import { SupabaseConnectionConfig, fetchTables, checkTableAccessibility, TableInfo } from './supabase-client';

export interface SecurityIssue {
  type: 'rls_missing' | 'rls_permissive' | 'public_table' | 'sensitive_data';
  severity: 'critical' | 'warning' | 'info';
  tableName: string;
  title: string;
  description: string;
  technicalDetails?: string;
  suggestedFix?: string;
}

export interface ScanResult {
  healthScore: number;
  tablesScanned: number;
  issues: SecurityIssue[];
  tables: TableInfo[];
}

// Sensitive column patterns that might contain private data
const SENSITIVE_PATTERNS = [
  { pattern: /password/i, severity: 'critical' as const, reason: 'password data' },
  { pattern: /secret/i, severity: 'critical' as const, reason: 'secret data' },
  { pattern: /token/i, severity: 'critical' as const, reason: 'authentication tokens' },
  { pattern: /api[_-]?key/i, severity: 'critical' as const, reason: 'API keys' },
  { pattern: /ssn|social[_-]?security/i, severity: 'critical' as const, reason: 'social security numbers' },
  { pattern: /credit[_-]?card|card[_-]?number/i, severity: 'critical' as const, reason: 'credit card data' },
  { pattern: /email/i, severity: 'warning' as const, reason: 'email addresses' },
  { pattern: /phone/i, severity: 'warning' as const, reason: 'phone numbers' },
  { pattern: /address/i, severity: 'info' as const, reason: 'address information' },
  { pattern: /birth[_-]?date|dob/i, severity: 'info' as const, reason: 'birth date information' },
];

// Patterns that indicate overly permissive RLS policies
const PERMISSIVE_PATTERNS = [
  { pattern: /\btrue\b/i, reason: 'Policy always evaluates to true' },
  { pattern: /1\s*=\s*1/, reason: 'Policy uses 1=1 pattern (always true)' },
  { pattern: /'\w+'\s*=\s*'\w+'/, reason: 'Policy uses string comparison that always matches' },
  { pattern: /public\s*=\s*true/i, reason: 'Policy explicitly allows public access' },
];

export async function runSecurityScan(config: SupabaseConnectionConfig): Promise<ScanResult> {
  const issues: SecurityIssue[] = [];
  let tables: TableInfo[] = [];

  try {
    // Fetch all tables
    tables = await fetchTables(config);
  } catch (error) {
    // If we can't fetch tables, try common table names
    tables = await probeCommonTables(config);
  }

  // Check each table for security issues
  for (const table of tables) {
    // Check if table is publicly accessible
    const accessibility = await checkTableAccessibility(config, table.name);

    if (accessibility.accessible) {
      // Table is accessible with just anon key - potential issue
      issues.push({
        type: 'public_table',
        severity: 'warning',
        tableName: table.name,
        title: `Table "${table.name}" is publicly accessible`,
        description: `Anyone with your project URL and anon key can read data from this table. ${
          accessibility.rowCount !== undefined
            ? `Currently contains ${accessibility.rowCount} row${accessibility.rowCount !== 1 ? 's' : ''}.`
            : ''
        }`,
        technicalDetails: 'Table accessible via REST API without additional authentication',
        suggestedFix: `-- Enable RLS on the table\nALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n-- Add a policy (example: only authenticated users)\nCREATE POLICY "Enable read for authenticated users only"\nON ${table.name}\nFOR SELECT\nTO authenticated\nUSING (true);`,
      });

      // Check for sensitive columns in publicly accessible tables
      const sensitiveColumns = findSensitiveColumns(table.columns);
      for (const sensitive of sensitiveColumns) {
        issues.push({
          type: 'sensitive_data',
          severity: sensitive.severity,
          tableName: table.name,
          title: `Sensitive data exposed: ${sensitive.columnName}`,
          description: `The column "${sensitive.columnName}" in table "${table.name}" appears to contain ${sensitive.reason}. This data is currently accessible to anyone.`,
          technicalDetails: `Column "${sensitive.columnName}" matches pattern for ${sensitive.reason}`,
          suggestedFix: `-- Restrict access to sensitive columns\nCREATE POLICY "Hide sensitive data"\nON ${table.name}\nFOR SELECT\nUSING (\n  -- Only allow users to see their own data\n  auth.uid() = user_id\n);`,
        });
      }
    }

    // Check for tables that look like they should be protected
    if (isLikelySensitiveTable(table.name) && accessibility.accessible) {
      const existingIssue = issues.find(
        i => i.tableName === table.name && i.type === 'public_table'
      );
      if (existingIssue) {
        existingIssue.severity = 'critical';
        existingIssue.title = `Critical: "${table.name}" table is publicly accessible`;
      }
    }
  }

  // Calculate health score
  const healthScore = calculateHealthScore(issues, tables.length);

  return {
    healthScore,
    tablesScanned: tables.length,
    issues,
    tables,
  };
}

function findSensitiveColumns(columns: { name: string; type: string }[]): Array<{
  columnName: string;
  severity: 'critical' | 'warning' | 'info';
  reason: string;
}> {
  const sensitive: Array<{
    columnName: string;
    severity: 'critical' | 'warning' | 'info';
    reason: string;
  }> = [];

  for (const column of columns) {
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.pattern.test(column.name)) {
        sensitive.push({
          columnName: column.name,
          severity: pattern.severity,
          reason: pattern.reason,
        });
        break; // Only report once per column
      }
    }
  }

  return sensitive;
}

function isLikelySensitiveTable(tableName: string): boolean {
  const sensitiveTablePatterns = [
    /^users?$/i,
    /^accounts?$/i,
    /^profiles?$/i,
    /^customers?$/i,
    /^members?$/i,
    /^admins?$/i,
    /^auth/i,
    /^sessions?$/i,
    /^tokens?$/i,
    /^payments?$/i,
    /^orders?$/i,
    /^transactions?$/i,
    /^invoices?$/i,
    /^subscriptions?$/i,
  ];

  return sensitiveTablePatterns.some(pattern => pattern.test(tableName));
}

async function probeCommonTables(config: SupabaseConnectionConfig): Promise<TableInfo[]> {
  const commonTableNames = [
    'users', 'profiles', 'accounts', 'posts', 'comments', 'products',
    'orders', 'customers', 'items', 'messages', 'notifications',
    'settings', 'files', 'images', 'documents', 'categories',
  ];

  const foundTables: TableInfo[] = [];

  for (const tableName of commonTableNames) {
    try {
      const accessibility = await checkTableAccessibility(config, tableName);
      if (accessibility.accessible) {
        foundTables.push({
          name: tableName,
          schema: 'public',
          rlsEnabled: false,
          columns: [],
        });
      }
    } catch {
      // Table doesn't exist or not accessible, skip
    }
  }

  return foundTables;
}

function calculateHealthScore(issues: SecurityIssue[], tableCount: number): number {
  if (tableCount === 0) return 100;

  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 3;
        break;
    }
  }

  // Bonus for having some tables not exposed
  const publicTables = issues.filter(i => i.type === 'public_table').length;
  if (publicTables < tableCount) {
    score += Math.min(10, (tableCount - publicTables) * 2);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function checkPolicyForVulnerabilities(policyDefinition: string): {
  isVulnerable: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  for (const pattern of PERMISSIVE_PATTERNS) {
    if (pattern.pattern.test(policyDefinition)) {
      reasons.push(pattern.reason);
    }
  }

  return {
    isVulnerable: reasons.length > 0,
    reasons,
  };
}
