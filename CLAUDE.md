# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Compile TypeScript → dist/
npm run dev          # Run directly via tsx (no build step)
npm start            # Run compiled output (requires build first)
npm run clean        # Remove dist/
```

No linting or test suite is configured.

## Environment

Create a `.env` file (never commit it):

```
LITMOS_API_KEY=your_api_key
LITMOS_BASE_URL=https://api.litmoseu.com   # EU: api.litmoseu.com | US: api.litmos.com | AU: api.litmos.com.au
LITMOS_SOURCE=optional_source_identifier   # optional
```

## Architecture

This is a stdio-based **MCP server** that exposes the SAP Litmos REST API as AI agent tools. The layers are:

```
AI Agent (Claude Desktop / Cursor / etc.)
    ↓ stdio (JSON-RPC)
src/index.ts          — entry point, creates McpServer + StdioServerTransport
src/server.ts         — registers all 20+ tools with Zod schemas and handlers
src/config.ts         — loads env vars, validates required keys
    ↓
src/tools/            — tool handlers (input validation → API call → formatted TextContent)
  courses.ts          — search_courses, get_course, get_course_modules, get_course_users
  users.ts            — search/get/assign/bulk_import users, update module progress
  learningpaths.ts    — get_learning_path_users, assign_learning_path_to_user
  sessions.ts         — ILT session CRUD, register users, complete + rollcall
    ↓
src/litmos/           — HTTP client layer
  client.ts           — axios instance: adds apikey header, source/format params, maps HTTP errors
  api/courses.ts      — GET/POST to /courses endpoints
  api/users.ts        — GET/POST/PUT to /users, /results/modules, /bulkimports
  api/learningpaths.ts — GET/POST to /learningpaths
  api/sessions.ts     — GET/POST to /sessions, /rollcall, /attended
  types.ts            — TypeScript interfaces (LitmosUser, LitmosCourse, LitmosILTSession, etc.)
src/utils.ts          — rateLimitedBatch: 10 items/batch, 7s delay between batches
```

## Key Design Decisions

**XML vs JSON payloads:** Litmos API requires XML bodies for write operations (course assignment, session registration, rollcall) but returns JSON. The API layer constructs XML strings directly — there is no XML library. When adding new write endpoints, follow the same pattern.

**Rate limiting:** Litmos enforces ~100 req/min. All bulk tools use `rateLimitedBatch` from `utils.ts`. Any new bulk operation must use this utility.

**Error mapping:** `client.ts` intercepts HTTP errors and translates them to human-readable messages (401/403 → auth failed, 503 → rate limit). Do not add per-endpoint error handling; extend the interceptor instead.

**Assignment checks:** `assign_course_to_user` and `assign_learning_path_to_user` check existing assignments before POSTing to avoid duplicate-enrollment errors. New assignment tools should follow this pattern.

**Tool registration:** All tools are registered in `server.ts` using the MCP SDK's `server.tool(name, schema, handler)` pattern with Zod schemas for input validation.

**Distribution:** The package has a `bin` entry (`litmos-mcp → dist/index.js`) and a shebang in `index.ts`, so it can be installed globally via `npm install -g`.
