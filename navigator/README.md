# 📂 Cockpit Files (Navigator Modern Redesign)

A modern, desktop-class Linux file manager plugin for **Cockpit CMS**, inspired by GNOME Files (Nautilus) and Adwaita / Material Dark aesthetics.

![Platform](https://img.shields.io/badge/Cockpit-300%2B-blue)
![License](https://img.shields.io/badge/License-GPL--3.0-green)
![Design](https://img.shields.io/badge/Theme-Adwaita%20Dark-purple)
![Architecture](https://img.shields.io/badge/Engine-Vanilla%20ES6%20%2B%20CSS-orange)

---

## ✨ Features

* 🎨 **Modern Desktop Aesthetics (Adwaita / Material Dark)**:
  * Sleek graphite cards with rounded corners (`12px`), subtle borders, and smooth hover micro-animations (`translateY(-2px)`).
  * High-contrast, easy-on-the-eyes dark theme designed specifically for modern Cockpit sessions.
  * Clean layout without legacy 45Drives branding or intrusive banners.

* 🧠 **Intelligent `IconEngine`**:
  * **Automatic Semantic Recognition**:
    * ⚡ **SSD / NVMe** (`SSD`, `nvme`, `fast_storage`) ➔ Cyan Lightning badge & icon.
    * 💾 **HDD / Bulk Storage** (`HDD`, `storage`, `backup_storage`) ➔ Amber Hard Drive.
    * 📦 **Containers & Quadlets** (`containers`, `docker`, `podman`, `compose`) ➔ Blue Docker icon.
    * 🧠 **AI & LLM Models** (`models`, `ai`, `llm`, `weights`) ➔ Violet Brain / AI chip.
    * 🗄️ **Databases** (`data`, `databases`, `sqlite`) ➔ Emerald Green Database.
    * 🧪 **Lab & Experiments** (`lab`, `research`, `benchmarks`) ➔ Yellow Flask.
    * 🎬 **Media & Downloads** (`media`, `plex`, `downloads`, `torrents`) ➔ Rose Film & Indigo Download.
    * 💻 **Dev & Configs** (`.git`, `projects`, `.config`) ➔ Git branch & settings icons.
  * **Intelligent File Format Mapping**:
    * Native icons for `.gguf`, `.container`, `.sqlite`, `.tar.gz`, `.sh`, `.py`, `.cs`, `.md`, `.mp4`.

* 🎨 **Interactive Custom Icon & Color Customizer**:
  * Right-click any folder or file ➔ **«Customize Icon & Color»**.
  * Choose from a curated palette of icons and accent colors.
  * Optionally assign a 2–4 character custom badge (e.g. `SSD`, `AI`, `DB`).
  * Customizations are persisted instantly in `localStorage` without altering filesystem metadata.

* 🚀 **Zero Build Pipeline**:
  * Written in modular, native ES6 JavaScript (`components/*.js`) and modern CSS.
  * No Webpack, Vite, or Node compilation required — live updates with an instant browser refresh (`F5`).

---

## 📦 Installation

### Quick Install (User-Space, No Root Required)

```bash
# Clone to your Cockpit plugins folder
mkdir -p ~/.local/share/cockpit
git clone https://github.com/YuriiBishchuk/cockpit-navigator.git ~/.local/share/cockpit/navigator

# Refresh Cockpit in your browser (Ctrl + F5)
```

Cockpit automatically gives precedence to plugins in `~/.local/share/cockpit/` over `/usr/share/cockpit/`.

---

## 🛠️ Architecture

```text
~/.local/share/cockpit/navigator/
├── manifest.json            # Cockpit plugin manifest ("Files")
├── index.html               # Main file manager shell & toolbar
├── style.css                # Adwaita / Material Dark stylesheet
├── main.js                  # App bootstrap & theme manager
├── components/
│   ├── IconEngine.js        # Rule-based & user-override icon resolver
│   ├── NavEntry.js          # Base file/directory entry & badge handler
│   ├── NavDir.js            # Directory navigation & visual mapping
│   ├── NavFile.js           # File inspector & text editor
│   ├── NavContextMenu.js    # Context menu & custom icon modal
│   ├── NavWindow.js         # Core filesystem browser controller
│   ├── ModalPrompt.js       # Modern modal prompts
│   └── FileUpload.js        # File drag-and-drop & uploader
└── fontawesome/             # Embedded FontAwesome 5 icon library
```

---

## 📜 Credits & License

* **Original Author**: [45Drives Cockpit Navigator](https://github.com/45Drives/cockpit-navigator) (GPL-3.0).
* **Modern Redesign & IconEngine**: Yurii Bishchuk & Antigravity Architect.
* Licensed under the **GNU General Public License v3.0**.
