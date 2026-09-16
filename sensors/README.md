# Cockpit Sensors (Material Dark Redesign)

A modern, ultra-fast, and compact hardware sensor monitoring dashboard for [Cockpit](https://cockpit-project.org/) (tested on Cockpit 364+ / openSUSE Leap & MicroOS / Fedora / RHEL).

## ✨ Features
- **Material Dark Design:** Pixel-perfect match with Cockpit dark theme, zero visual bloat.
- **CPU Priority:** Automatically sorts CPU (AMD Ryzen / Intel Core) to the very top.
- **Detailed Diagnostics:** Live metrics for NVMe SSD (Controller, NAND Flash), GPU, and Wi-Fi adapters.
- **CSP Compliant:** 100% compliant with Cockpit's strict Content Security Policy (no inline styles or eval).
- **Zero Heavy Dependencies:** Replaces bulky old React bundles with a native, zero-dependency lightweight telemetry reader.

## 🚀 Quick Install
```bash
git clone https://github.com/YuriiBishchuk/cockpit-sensors.git
cd cockpit-sensors
./install.sh
```
