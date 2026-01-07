---
title: Installation
description: Download and install DownKingo on your system.
---

# Installation

DownKingo is available for **Windows**, **macOS**, and **Linux**.

## Download

Visit our [Download Page](/download) to get the latest version for your operating system.

### Windows

1. Download the `.exe` installer
2. Run the installer and follow the prompts
3. Launch DownKingo from your Start Menu

:::tip[Portable Version]
A portable version is also available if you prefer not to install.
:::

### macOS

1. Download the `.dmg` file
2. Open the DMG and drag DownKingo to your Applications folder
3. Launch from Applications

:::caution[Gatekeeper]
On first launch, you may need to right-click and select "Open" to bypass Gatekeeper.
:::

### Linux

#### Debian/Ubuntu (.deb)

```bash
sudo dpkg -i downkingo_*.deb
sudo apt-get install -f  # Install dependencies if needed
```

#### Fedora/RHEL (.rpm)

```bash
sudo rpm -i downkingo_*.rpm
```

#### AppImage

```bash
chmod +x DownKingo_*.AppImage
./DownKingo_*.AppImage
```

---

## System Requirements

| Platform    | Minimum Requirements               |
| ----------- | ---------------------------------- |
| **Windows** | Windows 10/11 (64-bit)             |
| **macOS**   | macOS 11+ (Intel or Apple Silicon) |
| **Linux**   | Modern distro with glibc 2.31+     |

## Bundled Dependencies

DownKingo comes with **FFmpeg** and **yt-dlp** pre-bundled. No additional setup required!

- **FFmpeg** — For video/audio processing and conversion
- **yt-dlp** — For media extraction from 1000+ websites
