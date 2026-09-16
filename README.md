# Cockpit Adwaita Suite

Harmonized Modern Linux Desktop Theme (Adwaita / Material Dark) and customized plugins for [Cockpit Project](https://cockpit-project.org/).

Transform your Cockpit web interface into a unified, high-fidelity experience matching modern desktop standards (GNOME Adwaita / Material Dark).

---

## 🎨 What's Included

| Component | Path | Description |
| :--- | :--- | :--- |
| **Global Theme** | `theme/` | Deep graphite `#16161a` & `#202026` palette, blue accent `#3584e4`, rounded elevated cards, Adwaita buttons, custom sidebar styling, and link overrides. |
| **Files (Navigator)** | `navigator/` | Modern file manager with Adwaita theme, dynamic SVG icon engine (folders, drives, formats), responsive sidebar, and fixed alignment. |
| **Sensors** | `sensors/` | System hardware monitor (CPU, GPU, NVMe, fans) themed to Adwaita Dark with glowing temperature bars and telemetry widgets. |

---

## 🚀 Quick Start & Deployment

### 1. One-Line Deployment to Remote Server
Deploy the entire suite to your remote server over SSH:
```bash
./deploy.sh --remote user@your-server-ip
```

### 2. Local Installation
To install on your current machine:
```bash
./deploy.sh
```

### 3. Selective Component Deployment
```bash
./deploy.sh --theme --remote user@your-server-ip       # Only global theme
./deploy.sh --navigator --remote user@your-server-ip   # Only Files (Navigator)
./deploy.sh --sensors --remote user@your-server-ip     # Only Sensors
```

---

## 🛡️ Architecture & Safety

- **Immutable OS Friendly**: Works seamlessly on **openSUSE Leap Micro**, **MicroOS**, **Fedora Silverblue/CoreOS**, and standard Linux.
- **Zero `/usr` Mutation**: Theme overrides live in `/usr/local/share/cockpit/` (writable `rw` Btrfs subvolume) or user-space `~/.local/share/cockpit/`.
- **Clean Updates**: Does not interfere with transactional updates (`transactional-update`), rpm-ostree, or package managers.
- **Instant Rollback**: Removing files or deleting the directory immediately restores the distribution default.

---

## 📁 Repository Structure

```
cockpit-adwaita-suite/
├── deploy.sh              # Unified deployment & sync script
├── README.md              # Documentation
├── theme/
│   └── css-overrides.css  # Global Cockpit Adwaita shell & PatternFly overrides
├── navigator/             # Files manager module (cockpit-navigator)
│   ├── manifest.json
│   ├── index.html
│   ├── style.css
│   └── components/
└── sensors/               # Hardware monitor module (cockpit-sensors)
    ├── manifest.json
    ├── index.html
    ├── app.css
    └── app.js
```

---

## 📜 License
MIT License. Based on [Cockpit Project](https://cockpit-project.org/) and respective upstream plugins (cockpit-navigator, cockpit-sensors).
