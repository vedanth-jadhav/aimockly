export interface SupabaseConnectionConfig {
  url: string;
  anonKey: string;
}

export interface TableInfo {
  name: string;
  schema: string;
  rlsEnabled: boolean;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
}

export interface RLSPolicy {
  name: string;
  tableName: string;
  command: string; // SELECT, INSERT, UPDATE, DELETE, ALL
  definition: string;
  roles: string[];
}

export async function createSupabaseClient(config: SupabaseConnectionConfig) {
  // Validate URL format
  if (!config.url.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL. Please use a valid Supabase project URL.');
  }

  // Validate anon key format (JWT)
  if (!config.anonKey.startsWith('eyJ')) {
    throw new Error('Invalid anon key format. Please provide a valid Supabase anon key.');
  }

  return {
    url: config.url,
    anonKey: config.anonKey,
    headers: {
      'apikey': config.anonKey,
      'Authorization': `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
    },
  };
}

export async function fetchTables(config: SupabaseConnectionConfig): Promise<TableInfo[]> {
  const client = await createSupabaseClient(config);

  // Query the information_schema for tables
  const response = await fetch(`${client.url}/rest/v1/rpc/get_tables_info`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    // Fallback: try to infer tables from schema endpoint
    const schemaResponse = await fetch(`${client.url}/rest/v1/`, {
      headers: client.headers,
    });

    if (!schemaResponse.ok) {
      throw new Error('Unable to fetch table information. Please check your credentials.');
    }

    // Parse OpenAPI schema to get table names
    const schema = await schemaResponse.json();
    return parseOpenAPISchema(schema);
  }

  return response.json();
}

function parseOpenAPISchema(schema: Record<string, unknown>): TableInfo[] {
  const tables: TableInfo[] = [];
  const definitions = (schema as { definitions?: Record<string, unknown> }).definitions || {};

  for (const [tableName, tableSchema] of Object.entries(definitions)) {
    if (tableName.startsWith('_')) continue; // Skip internal tables

    const properties = (tableSchema as { properties?: Record<string, { type?: string; format?: string }> }).properties || {};
    const columns: ColumnInfo[] = Object.entries(properties).map(([colName, colDef]) => ({
      name: colName,
      type: colDef.type || 'unknown',
      isNullable: true, // Default assumption
    }));

    tables.push({
      name: tableName,
      schema: 'public',
      rlsEnabled: false, // Will be checked separately
      columns,
    });
  }

  return tables;
}

export async function checkTableAccessibility(
  config: SupabaseConnectionConfig,
  tableName: string
): Promise<{ accessible: boolean; rowCount?: number; error?: string }> {
  const client = await createSupabaseClient(config);

  try {
    const response = await fetch(
      `${client.url}/rest/v1/${tableName}?select=*&limit=1`,
      {
        headers: client.headers,
      }
    );

    if (response.ok) {
      const data = await response.json();

      // Try to get count
      const countResponse = await fetch(
        `${client.url}/rest/v1/${tableName}?select=count`,
        {
          headers: {
            ...client.headers,
            'Prefer': 'count=exact',
          },
        }
      );

      const contentRange = countResponse.headers.get('content-range');
      const rowCount = contentRange ? parseInt(contentRange.split('/')[1]) : undefined;

      return {
        accessible: true,
        rowCount: rowCount || data.length,
      };
    }

    return {
      accessible: false,
      error: 'Table not accessible with anon key',
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
