# Litmos MCP

An MCP server that enables Claude Desktop to interact with the Litmos REST API.

## Prerequisites

* Node.js 18+
* Claude Desktop
* A Litmos API Key

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd Litmos_MCP
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

---

## Claude Desktop Configuration

Open:

**Claude Desktop → Settings → Developer → Edit Config**

Add the following configuration:

```json
{
  "mcpServers": {
    "litmos": {
      "command": "node",
      "args": [
        "C:\\Path\\To\\Litmos_MCP\\dist\\index.js"
      ],
      "env": {
        "LITMOS_API_KEY": "<YOUR_API_KEY>",
        "LITMOS_BASE_URL": "https://api.litmoseu.com"
      }
    }
  }
}
```

Replace:

* `C:\\Path\\To\\Litmos_MCP\\dist\\index.js` with the full path to your local project.
* `<YOUR_API_KEY>` with your own Litmos API key.

EU customers:

```
https://api.litmoseu.com
```

US customers:

```
https://api.litmos.com
```

Restart Claude Desktop after saving the configuration.

---

## Example Prompts

* Search for cybersecurity courses.
* Show training progress for [john.doe@company.com](mailto:john.doe@company.com).
* Assign the Code of Ethics course to Jane Smith.
* Register John Doe to the next available ILT session.
* Show all users enrolled in a learning path.

---

## Security

* Never commit or share your API key.
* API credentials are loaded from environment variables only.
