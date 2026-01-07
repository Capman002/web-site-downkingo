---
title: Development
description: Set up your development environment for DownKingo.
---

# Development

Want to contribute or build DownKingo yourself? Here's everything you need to get started.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Go 1.21+** — [Download Go](https://go.dev/dl/)
- **Bun** — Fast JavaScript runtime ([Install Bun](https://bun.sh/))
- **Wails v2** — Desktop app framework

### Installing Wails

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Verify the installation:

```bash
wails doctor
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/down-kingo/downkingo.git
cd downkingo
```

### 2. Install Frontend Dependencies

```bash
cd frontend && bun install && cd ..
```

### 3. Run in Development Mode

```bash
wails dev
```

This will start the app in development mode with hot-reload enabled.

---

## Project Structure

```
downkingo/
├── internal/              # Backend logic (Go)
│   ├── auth/              # OAuth2 Device Flow
│   ├── downloader/        # Queue manager and yt-dlp wrapper
│   ├── roadmap/           # "Build in Public" integration
│   └── storage/           # SQLite layer
├── frontend/              # UI (React + Tailwind)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page views
│   │   ├── hooks/         # Custom hooks
│   │   └── i18n/          # Translations
│   └── package.json
└── build/                 # Build resources
```

---

## Building for Production

### All Platforms

```bash
wails build
```

### Platform-Specific

```bash
# Windows
wails build -platform windows/amd64

# macOS (Universal Binary)
wails build -platform darwin/universal

# Linux
wails build -platform linux/amd64
```

---

## Development Tips

### Hot Reload

Wails includes hot-reload by default in dev mode. Frontend changes reload instantly, and Go changes trigger a rebuild.

### Debugging

- **Frontend**: Use browser DevTools (F12 in the app window)
- **Backend**: Use standard Go debugging tools or add log statements

### Environment Variables

Create a `.env` file in the root for local configuration:

```env
GITHUB_CLIENT_ID=your_client_id
DOWNKINGO_DEV_MODE=true
```
