# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mockly is a security scanner and interactive tutor built with Next.js 14 (App Router), Convex for backend/database, and Google Gemini AI for intelligent tutoring and fix generation.

## Commands

- **Development (full stack):** `npm run dev` - runs frontend and Convex backend in parallel
- **Frontend only:** `npm run dev:frontend`
- **Backend only:** `npm run dev:backend`
- **Build:** `npm run build` - deploys Convex and builds Next.js
- **Lint:** `npm run lint`

## Architecture

### Tech Stack
- **Frontend:** Next.js 14 App Router, Tailwind CSS, Framer Motion, Radix UI
- **Backend:** Convex (serverless functions + real-time database)
- **AI:** Google Generative AI (Gemini) for tutoring and fix generation
- **Auth:** Convex Auth (@convex-dev/auth)

### Key Directories
- `app/` - Next.js routes: `/scan`, `/results/[scanId]`, `/tutor/[issueId]`, `/dashboard`, `/auth`
- `app/api/` - API routes for AI fix generation and webhooks
- `convex/` - Backend schema and functions (users, projects, scans, issues)
- `components/` - UI split by domain (`scanner/`, `tutor/`, `auth/`, `mocky/`) plus shared `ui/`
- `lib/scanner/` - Security scanner implementation
- `lib/ai/` - Gemini AI integration

### Data Flow
1. User submits code via `/scan` page
2. Scanner in `lib/scanner/` analyzes code for security issues
3. Results stored in Convex, displayed at `/results/[scanId]`
4. Users can access interactive tutor at `/tutor/[issueId]` for AI-powered explanations
5. AI fix generation available via `/api` endpoints
