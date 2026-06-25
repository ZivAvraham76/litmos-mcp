# Litmos MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that wraps the [SAP Litmos](https://www.litmos.com) REST API, exposing Litmos actions as tools that AI agents (Claude Desktop, Cursor, Windsurf, Cline, etc.) can discover and use.

## Architecture

```
AI Agent / MCP Client  →  Litmos MCP Server  →  Litmos REST API
```

## Tools

**Courses**

| Tool | Description |
|---|---|
| `search_courses` | Search courses by name or keyword |
| `get_course` | Get details for a specific course |
| `get_course_details` | Get extended details (description, tags, custom fields) |
| `get_course_modules` | List modules inside a course |
| `get_course_users` | Get all users enrolled in a course |

**Users**

| Tool | Description |
|---|---|
| `search_users` | Search users by name or email |
| `bulk_search_users` | Search multiple users at once in parallel |
| `get_user` | Get profile details for a user |
| `get_user_training` | Get a user's assigned courses and learning paths with progress |
| `assign_course_to_user` | Assign a course to a single user (checks if already assigned first) |
| `bulk_assign_course_to_users` | Assign a course to multiple users (rate-limited automatically) |
| `update_module_progress` | Record a module result for a user (score, completed, note) |
| `bulk_update_module_progress` | Record the same module result for multiple users |
| `bulk_import_users` | Create or update up to ~2000 users and bulk-enroll them into courses |

**Learning Paths**

| Tool | Description |
|---|---|
| `get_learning_path_users` | Get all users enrolled in a learning path |
| `assign_learning_path_to_user` | Assign a learning path to a user |

**ILT Sessions**

| Tool | Description |
|---|---|
| `get_module_sessions` | List ILT sessions for a module |
| `create_session` | Create a new ILT session |
| `register_user_to_session` | Register a single user to an ILT session |
| `bulk_register_users_to_session` | Register up to 25 users to a session in one call |
| `complete_session` | Mark a session complete and record attendance |
| `reset_session_score` | Reset scores for a list of users in a session |

## Installation

### Option 1: Run locally from source

```bash
git clone <repo-url>
cd litmos-mcp
npm install
npm run build
```

### Option 2: Install as global npm package

```bash
npm install -g litmos-mcp
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
LITMOS_API_KEY=your_api_key_here
LITMOS_BASE_URL=https://api.litmoseu.com
```

> **Where to find your API key:** Litmos Admin > Integrations > API > API Key

**Base URL by region:**
- EU: `https://api.litmoseu.com`
- US: `https://api.litmos.com`
- AU: `https://api.litmos.com.au`

## MCP Client Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "litmos": {
      "command": "litmos-mcp",
      "env": {
        "LITMOS_API_KEY": "your_api_key_here",
        "LITMOS_BASE_URL": "https://api.litmoseu.com"
      }
    }
  }
}
```

If running from source instead of a global install:

```json
{
  "mcpServers": {
    "litmos": {
      "command": "node",
      "args": ["C:/Users/you/dev/Litmos_MCP/dist/index.js"],
      "env": {
        "LITMOS_API_KEY": "your_api_key_here",
        "LITMOS_BASE_URL": "https://api.litmoseu.com"
      }
    }
  }
}
```

### Cursor / Windsurf / Cline

Add to your MCP settings file (format varies by client):

```json
{
  "litmos": {
    "command": "litmos-mcp",
    "env": {
      "LITMOS_API_KEY": "your_api_key_here",
      "LITMOS_BASE_URL": "https://api.litmoseu.com"
    }
  }
}
```

## Example Prompts

Once configured, you can ask your AI assistant:

- *"Search for all courses related to cybersecurity"*
- *"Show me the training progress for user ID abc123"*
- *"What modules does the course 'Security Awareness' contain?"*
- *"Assign the GDPR compliance course to user john.doe@company.com"*
- *"List all upcoming ILT sessions for the Leadership module"*
- *"Register Alice Smith to the next available onboarding session"*

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (with tsx, no build step)
npm run dev

# Clean build output
npm run clean
```

## Error Handling

The server maps Litmos API errors to clear messages:

| HTTP Status | Meaning |
|---|---|
| 401/403 | Invalid API key — check `LITMOS_API_KEY` |
| 404 | Resource not found (wrong ID) |
| 400 | Bad request — check input parameters |
| 503 | Rate limit exceeded (100 req/min) — wait and retry |

## Security

- API keys are read from environment variables only — never hardcoded
- TLS is enforced on all Litmos API calls
- All tool inputs are validated with Zod before being sent to the API
- `.env` files are gitignored
