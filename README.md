<div align="center">

# 🧠 Google Flow Browser MCP

**Control [Google Flow](https://labs.google/fx/tools/flow) — image & video generation — directly from your AI agent via MCP.**

<p>
  <img src="https://img.shields.io/badge/version-1.1.0-blue?style=flat-square" alt="Version 1.1.0">
  <img src="https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square" alt="Node >= 18">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square" alt="Platforms">
  <img src="https://img.shields.io/badge/MCP-server-8A2BE2?style=flat-square" alt="MCP Server">
  <img src="https://img.shields.io/badge/AI%20Clients-Claude%20%7C%20Cursor%20%7C%20Antigravity%20%7C%20OpenCode-4CAF50?style=flat-square" alt="Supported Clients">
  <img src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square" alt="License MIT">
</p>

<br>

[✨ Features](#-features) •
[🚀 Quick Start](#-quick-start) •
[🤖 Agent Config](#-ai-agent-configuration) •
[🔧 Tools](#-tools) •
[⚙️ Configuration](#️-configuration) •
[🛡️ Safety](#️-safety--ethics) •
[❓ FAQ](#-faq)

<br>

</div>

---

> **🇨🇳 本 MCP 服务允许您的 AI Agent（Claude Desktop、Cursor、Antigravity、OpenCode 等）通过您自己的 Google 账户操控 Google Flow 生成图片与视频，无需 API Key 或共享凭据。**  
> **🇫🇷 Ce serveur MCP permet à votre agent AI d'utiliser Google Flow pour générer des images et des vidéos, via votre propre compte Google et sans partager vos identifiants.**

---

## 📸 What It Does

This MCP server connects your AI agent to **[Google Flow](https://labs.google/fx/tools/flow)** — Google's creative suite for image and video generation. Your agent can:

- 🎨 **Generate images** with Nano Banana Pro, Nano Banana 2, or Imagen 4
- 🎬 **Set up videos & scenes** with characters (safely previews before consuming credits)
- 🧑 **Manage characters** and scenes in your Flow workspace
- 🖼️ **Use Grid Architect** for batch shot generation
- 🔍 **Discover and map** any Flow tool or UI element programmatically
- 🌐 **Multi-language Flow UI** — seamless operation on Chinese (`zh`), English (`en`), and French (`fr`) interfaces

All through your **own Google account** — no API keys, no third-party tokens, no password sharing.

---

## ✨ Features

<table>
<tr>
  <td width="50%">

### 🎯 For AI Agents
  </td>
  <td width="50%">

### 🔒 For Humans & Stability
  </td>
</tr>
<tr>
  <td>

- **15+ MCP tools** ready for creative automation
- **Multi-language Flow UI** (English, 中文, Français)
- **Smart job queue** — strictly prevents parallel conflicts
- **Auto-discover UI** — self-adapts when Flow UI updates
- **Safe & resilient actions** — intelligent button/dropdown detection
- **Stdio-safe JSON-RPC** — logs route to stderr and files
  </td>
  <td>

- **Cross-platform** — 100% native on Windows, macOS, and Linux
- **Profile isolation (`tempDir`)** — runs concurrently without locking your primary daily Chrome (`SingletonLock` free)
- **Auto Chrome & CDP detection** — one-click start or auto-launches Chrome with remote debugging (port 9222)
- **Your account, your data** — never asks for or stores passwords
- **Credit-safe video** — configures parameters without burning paid credits
  </td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| What | Why |
|------|-----|
| **Node.js ≥ 18** | Runtime for the MCP server |
| **Google Chrome** | Required for browser automation |
| **An AI MCP Client** | Claude Desktop, Cursor, Antigravity, OpenCode, Windsurf, etc. |
| **A Google account** | Logged into Chrome with access to Google Flow |

### 1️⃣ Clone & Install

```bash
git clone https://github.com/TMSSS05/google-flow-browser-mcp.git
cd google-flow-browser-mcp
npm install
```

### 2️⃣ Configure your Google Profile

Create your configuration file from the template:

```bash
# Linux / macOS
cp config/flow.config.example.json config/flow.config.json

# Windows (PowerShell)
Copy-Item config\flow.config.example.json config\flow.config.json
```

Edit `config/flow.config.json` with your profile details:

```json
{
  "expectedAccount": "your.email@gmail.com",
  "chromeUserDataDir": "C:\\Users\\yourname\\AppData\\Local\\Google\\Chrome\\User Data",
  "chromePath": "",
  "flowUrl": "https://labs.google/fx/zh/tools/flow",
  "cdpPort": 9222,
  "headless": false
}
```

> 💡 **How to find your Chrome User Data Path:**  
> Open Chrome and navigate to `chrome://version/`. Look at **Profile Path**:
> - **Windows:** `C:\Users\<username>\AppData\Local\Google\Chrome\User Data`
> - **macOS:** `/Users/<username>/Library/Application Support/Google/Chrome`
> - **Linux:** `/home/<username>/.config/google-chrome`
> 
> The server directly uses this `chromeUserDataDir` to preserve your authentic Google login session.

---

### 3️⃣ Start the Server (One-Click Launch)

The startup script checks if Chrome is already active on the CDP port (`9222`). If not, it **automatically launches Chrome** with remote debugging before starting the MCP server.

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-mcp.ps1
```

**Linux / macOS (Bash):**
```bash
chmod +x scripts/*.sh
./scripts/start-mcp.sh
```

**Standalone Browser Launch (Optional):**
If you want to start Chrome separately in the background:
```bash
npm run browser
# or on Windows PowerShell:
powershell -ExecutionPolicy Bypass -File .\scripts\start-browser.ps1
# or on Linux/macOS:
./scripts/start-browser.sh
```

---

### 4️⃣ Verify Connection & Generation

You can verify the connection and test image generation with the included test suites:

**Windows:**
```powershell
# Quick connection check:
npm run test:image

# Generate a test image:
powershell -ExecutionPolicy Bypass -File .\scripts\test-flow-image.ps1 -GenerateImage -Prompt "A serene mountain lake at sunrise, digital art"

# Or using CMD batch:
.\scripts\test-flow-image.bat
```

**Cross-Platform E2E Test:**
```bash
npm test
# runs scripts/test-e2e.mjs (tests connect, account check, status, UI discovery, image generation)
```

**Linux / macOS:**
```bash
./scripts/test-flow-image.sh
```

---

## 🤖 AI Agent Configuration

Add Google Flow Browser MCP to your AI editor or client.

### 🔷 Claude Desktop

Add to `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

**Windows:**
```json
{
  "mcpServers": {
    "google-flow-browser": {
      "command": "powershell",
      "args": [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "C:\\dev\\ai\\mcp\\google-flow-browser-mcp\\scripts\\start-mcp.ps1"
      ]
    }
  }
}
```

**macOS / Linux:**
```json
{
  "mcpServers": {
    "google-flow-browser": {
      "command": "/bin/bash",
      "args": [
        "/path/to/google-flow-browser-mcp/scripts/start-mcp.sh"
      ]
    }
  }
}
```

---

### 🔶 Cursor / Windsurf / VS Code (Roo Code / Cline)

In Cursor Settings (`Features` > `MCP Servers`) or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-flow-browser": {
      "command": "node",
      "args": [
        "c:/dev/ai/mcp/google-flow-browser-mcp/src/index.js"
      ]
    }
  }
}
```
*(Note: When using direct `node src/index.js`, make sure Chrome CDP is launched via `npm run browser` or `scripts/start-browser.ps1`)*

---

### 🟢 Antigravity IDE

In `~/.gemini/antigravity-ide/mcp_config.json` or project MCP config:

```json
{
  "mcpServers": {
    "google-flow-browser": {
      "command": "powershell",
      "args": [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "c:\\dev\\ai\\mcp\\google-flow-browser-mcp\\scripts\\start-mcp.ps1"
      ]
    }
  }
}
```

---

### 🟣 OpenCode

Register in one command:
```bash
./scripts/register-opencode.sh
```
Restart OpenCode after registering.

---

## 🏗️ Architecture & Project Structure

```
google-flow-browser-mcp/
│
├── 📂 config/
│   ├── flow.config.example.json    # Configuration template
│   └── selectors.map.json          # UI selectors map (auto-populated)
│
├── 📂 scripts/
│   ├── start-mcp.ps1               # Windows one-click start (Chrome CDP + MCP)
│   ├── start-mcp.sh                # Linux/macOS one-click start
│   ├── start-browser.ps1           # Windows launch Chrome + CDP
│   ├── start-browser.sh            # Linux/macOS launch Chrome + CDP
│   ├── start-browser.mjs           # Cross-platform Node browser launcher
│   ├── test-flow-image.ps1         # Windows PowerShell test runner
│   ├── test-flow-image.bat         # Windows Batch test runner
│   ├── test-flow-image.sh          # Linux/macOS Bash test runner
│   ├── test-e2e.mjs                # Cross-platform E2E test suite
│   └── register-opencode.sh        # Register in OpenCode config
│
├── 📂 src/
│   ├── index.js                    # MCP server entry point
│   │
│   ├── 📁 browser/                 # Chrome & CDP management
│   │   ├── connect.js              # CDP connection manager & Playwright bridge
│   │   ├── launch-profile.js       # Profile launcher & direct Chrome spawner
│   │   ├── account-check.js        # Verify Google account
│   │   └── safe-actions.js         # Safe click, fill, text detection
│   │
│   ├── 📁 navigation/              # Page & project navigation
│   │   └── project-navigator.js    # Multi-language project creation & navigation
│   │
│   ├── 📁 tools/                   # MCP Tool implementations
│   │   ├── flow-open.js            # Open / navigate to Google Flow
│   │   ├── flow-status.js          # Connection & queue status
│   │   ├── generate-image.js       # Image generation (multi-model, aspect ratios)
│   │   ├── generate-video.js       # Video parameter setup (credit safe)
│   │   ├── download-latest.js      # Download latest generated asset
│   │   ├── create-character.js     # Character creation
│   │   ├── import-character.js     # Import character JSON
│   │   ├── open-characters.js      # List characters
│   │   ├── create-scene.js         # Create video scene
│   │   ├── open-tools-gallery.js   # Open Flow tools gallery
│   │   ├── grid-architect.js       # Batch shot generation
│   │   ├── discover-ui.js          # Auto-map page elements & selectors
│   │   ├── use-flow-tool.js        # Generic tool activator
│   │   └── manage-projects.js      # List and open Flow projects
│   │
│   ├── 📁 queue/                   # Job queue & locking
│   │   └── job-queue.js            # Single-job execution queue
│   │
│   └── 📁 utils/                   # Helpers
│       ├── config.js               # Multi-platform path resolver & config loader
│       ├── logger.js               # Stdio-safe logger (stderr + logfile)
│       ├── errors.js               # Error codes & exceptions
│       ├── file-manager.js         # Asset download & file persistence
│       └── screenshots.js          # Page screenshot utility
│
└── 📂 output/                      # Generated images/videos saved here
```

---

## 🔧 Tools

All tools are organized by function for easy discovery by AI agents.

### 🌐 Connection & Status

| Tool | Description |
|------|-------------|
| `flow_connect` | Launch Chrome, connect CDP, navigate to Google Flow |
| `flow_disconnect` | Close browser and clean up all connections |
| `flow_status` | Full status: connection, Flow loaded, account, queue state |
| `flow_account_check` | Verify logged-in account matches configured email |
| `flow_screenshot` | Capture a screenshot of the current Flow page |

### 🎨 Image Generation

| Tool | Description |
|------|-------------|
| `flow_generate_image` | Generate image with **Nano Banana Pro**, **Nano Banana 2**, or **Imagen 4**. Supports aspect ratios (`16:9`, `1:1`, `9:16`, `4:3`, `3:4`), reference images, and automatic prompt dispatch. |
| `flow_download_latest` | Download the most recently generated file to `output/` directory |

### 🎬 Video Generation

| Tool | Description |
|------|-------------|
| `flow_generate_video` | Set up video generation (Omni Flash, Veo models, custom duration/ratio). ⚠️ **Stops at "ready to generate" — no credit consumed.** |
| `flow_create_scene` | Create a video scene with characters and a text prompt |

### 👤 Characters

| Tool | Description |
|------|-------------|
| `flow_create_character` | Create a new character with name, description, and optional reference images |
| `flow_import_character` | Import a character from a saved JSON file |
| `flow_open_characters` | Open the characters page and list all existing characters |

### 🛠️ Tools & Discovery

| Tool | Description |
|------|-------------|
| `flow_open_tools_gallery` | Open the tools gallery and browse available tools |
| `flow_use_tool` | Open any Flow tool by name with optional parameters |
| `flow_use_grid_architect` | Configure Grid Architect for batch shot generation with theme prompts and visual logic |
| `flow_discover_ui` | Discover and map all interactive elements (buttons, inputs, headings) on any Flow page |

### 📁 Project Management

| Tool | Description |
|------|-------------|
| `flow_list_projects` | List all projects from local registry and live homepage, with auto-synchronization |
| `flow_open_project` | Open a specific project by name (e.g. `the-secret-garden`), ID, or URL |

### 📊 Queue & Monitoring

| Tool | Description |
|------|-------------|
| `flow_queue_status` | Check job queue: active job, pending queue, completed and failed history |

---

## ⚙️ Configuration

Edit `config/flow.config.json` (copy from `config/flow.config.example.json`):

### 🔑 Essential Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `expectedAccount` | `string` | — | Your Google account email ✅ **REQUIRED** |
| `chromeUserDataDir` | `string` | *auto* | Path to Chrome user data directory ✅ **REQUIRED** |
| `chromePath` | `string` | *auto* | Path to Chrome executable (auto-detected on Windows/Mac/Linux if empty) |
| `flowUrl` | `string` | `https://labs.google/fx/zh/tools/flow` | Flow URL (supports `zh`, `en`, `fr` locales) |

### 🔧 Advanced Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `cdpPort` | `number` | `9222` | Chrome DevTools Protocol port |
| `browserMode` | `string` | `"direct-cdp"` | `"direct-cdp"` (recommended) or `"playwright"` |
| `headless` | `boolean` | `false` | Run Chrome in headless mode |
| `locale` | `string` | `"zh"` | UI locale (`"zh"`, `"en"`, `"fr"`) |

### ⏱️ Timing & Polling

| Key | Default | Description |
|-----|---------|-------------|
| `jobTimeoutMs` | `300000` (5 min) | Max job execution time |
| `actionDelayMs` | `800` | Delay between UI actions (anti-detection) |
| `generationPollIntervalMs` | `5000` (5s) | Polling interval for generation progress |
| `maxPollAttempts` | `120` | Max polling attempts before timeout |
| `downloadWaitMs` | `30000` (30s) | Timeout for file download |

### 🎨 Supported Models & Ratios

| Category | Options |
|----------|---------|
| `imageModels` | `Nano Banana Pro`, `Nano Banana 2`, `Imagen 4` |
| `videoModels` | `Omni Flash`, `Veo 3.1 - Lite/Fast/Quality` |
| `ratios` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16` |

---

## 🛡️ Safety & Ethics

This project is built with **safety-first design**:

| ✅ Principle | How it's enforced |
|-------------|-------------------|
| **Your account only** | Uses your own local Chrome profile — never asks for or stores passwords |
| **No credential theft** | Never exports cookies, credentials, or session tokens |
| **No bypass** | Halts cleanly on captcha, authentication walls, or verification challenges |
| **Single-job queue** | Queue serializes operations to prevent parallel execution abuse |
| **Credit-safe video** | Configures prompt and model parameters, then stops before clicking final Generate (0 credits burned) |
| **Stdio protocol integrity** | Stdio logs are routed strictly to `stderr` to ensure MCP JSON-RPC messages are never corrupted |

> ⚠️ **Notice:** This is a browser automation tool. Use it responsibly and in compliance with Google's Terms of Service.

---

## ❓ FAQ

### Getting Started

<details>
<summary><strong>Which Chrome profile should I use?</strong></summary>

Open Chrome and go to `chrome://version/`. The **Profile Path** shows both your user data directory and profile name:
- **Windows:** `C:\Users\you\AppData\Local\Google\Chrome\User Data\Profile 1`  
  `chromeUserDataDir: "C:\\Users\\you\\AppData\\Local\\Google\\Chrome\\User Data"`, `chromeProfile: "Profile 1"`
- **Linux:** `/home/you/.config/google-chrome/Default`  
  `chromeUserDataDir: "/home/you/.config/google-chrome"`, `chromeProfile: "Default"`
- **macOS:** `/Users/you/Library/Application Support/Google/Chrome/Profile 2`  
  `chromeUserDataDir: "/Users/you/Library/Application Support/Google/Chrome"`, `chromeProfile: "Profile 2"`

Choose the profile where you are already signed into your Google account.
</details>

<details>
<summary><strong>Can I keep my everyday Chrome open while using this MCP?</strong></summary>

**Yes!** Chrome normally forbids opening the same profile twice (`SingletonLock`). This project runs Chrome directly against your configured `chromeUserDataDir` (e.g. an isolated directory such as `Chrome_CDP`), so your everyday browsing session will not interfere with or block the MCP automation.
</details>

<details>
<summary><strong>Can I use this without OpenCode?</strong></summary>

**Yes!** Any standard MCP client (Claude Desktop, Cursor, Antigravity IDE, Windsurf, Continue, etc.) works out of the box. Follow the instructions in [🤖 Agent Configuration](#-ai-agent-configuration).
</details>

### Troubleshooting

<details>
<summary><strong>Windows: "Running scripts is disabled on this system" (ExecutionPolicy)</strong></summary>

By default, PowerShell blocks unsigned scripts. Run with bypass flag:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-mcp.ps1
```
Or permanently enable local scripts in PowerShell (Admin):
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
</details>

<details>
<summary><strong>Chrome executable not found</strong></summary>

If Chrome is installed in a non-standard directory, specify `chromePath` in `config/flow.config.json`:
```json
{
  "chromePath": "D:\\Software\\Google\\Chrome\\Application\\chrome.exe"
}
```
</details>

<details>
<summary><strong>CDP port 9222 already in use</strong></summary>

The startup script automatically tests if port 9222 is already running Chrome CDP. If it is, it attaches directly. If another program is occupying the port, change `"cdpPort": 9333` in `config/flow.config.json`.
</details>

<details>
<summary><strong>"Expected account mismatch" error</strong></summary>

Check `expectedAccount` in `config/flow.config.json`. It must match the Google email address currently active in your configured Chrome profile.
</details>

<details>
<summary><strong>Google Flow UI updated / buttons cannot be found</strong></summary>

The project supports English, Chinese, and French selectors. If Google changes button names or UI layout, call the MCP tool `flow_discover_ui` or run `npm run discover`. This will re-scan the active page and update `config/selectors.map.json`.
</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

[MIT](./LICENSE) © TMSSS05

---

<div align="center">
  <sub>Built with ❤️ for AI Agent automation</sub>
  <br>
  <sub>
    <a href="https://github.com/TMSSS05/google-flow-browser-mcp/issues">Report Issue</a> ·
    <a href="https://github.com/TMSSS05/google-flow-browser-mcp/discussions">Discussion</a>
  </sub>
</div>
