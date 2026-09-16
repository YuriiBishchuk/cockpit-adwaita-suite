(function () {
    "use strict";

    const DEVICE_ICONS = {
        "AMD CPU (Processor)": "🖥️",
        "NVMe SSD (System Storage)": "💾",
        "AMD Radeon GPU (Graphics)": "🎮",
        "Wi-Fi (Wireless Adapter)": "📶"
    };

    function getStatusClass(temp) {
        if (temp < 45) return { text: "status-cool", bar: "bar-cool", label: "Cool" };
        if (temp <= 65) return { text: "status-normal", bar: "bar-normal", label: "Optimal" };
        if (temp <= 80) return { text: "status-warm", bar: "bar-warm", label: "Warm" };
        return { text: "status-hot", bar: "bar-hot", label: "Hot" };
    }

    function getPercentClass(temp) {
        const raw = ((temp - 20) / 75) * 100;
        const clamped = Math.min(100, Math.max(5, raw));
        const bucket = Math.round(clamped / 5) * 5;
        return `pw-${bucket}`;
    }

    function renderQuickCards(sensorsData) {
        const container = document.getElementById("quick-metrics");
        if (!container) return;

        let html = "";
        for (const [device, sensors] of Object.entries(sensorsData)) {
            let mainTemp = null;
            for (const [label, values] of Object.entries(sensors)) {
                if (label === "Adapter") continue;
                for (const [k, v] of Object.entries(values)) {
                    if (k.endsWith("_input")) {
                        mainTemp = v;
                        break;
                    }
                }
                if (mainTemp !== null) break;
            }

            if (mainTemp !== null) {
                const status = getStatusClass(mainTemp);
                const icon = DEVICE_ICONS[device] || "📟";
                const shortName = device.split(" ")[0] + " " + (device.split(" ")[1] || "");
                html += `
                    <div class="metric-card">
                        <div class="metric-info">
                            <h3>${icon} ${shortName}</h3>
                            <div class="metric-value">${mainTemp.toFixed(1)} °C</div>
                        </div>
                        <div class="metric-badge ${status.text}">${status.label}</div>
                    </div>
                `;
            }
        }
        container.innerHTML = html;
    }

    function renderTable(sensorsData) {
        const tbody = document.getElementById("sensors-table-body");
        if (!tbody) return;

        let rows = "";
        for (const [device, sensors] of Object.entries(sensorsData)) {
            const icon = DEVICE_ICONS[device] || "📟";
            
            for (const [sensorLabel, values] of Object.entries(sensors)) {
                if (sensorLabel === "Adapter") continue;

                let temp = null;
                let crit = "--";

                for (const [k, v] of Object.entries(values)) {
                    if (k.endsWith("_input")) temp = v;
                    if (k.endsWith("_crit") || k.endsWith("_max")) {
                        if (v < 150) crit = `${v.toFixed(1)} °C`;
                    }
                }

                if (temp === null) continue;

                const status = getStatusClass(temp);
                const widthClass = getPercentClass(temp);

                rows += `
                    <tr>
                        <td>
                            <div class="device-cell">
                                <span class="device-icon">${icon}</span>
                                <span>${device}</span>
                            </div>
                        </td>
                        <td>
                            <span class="sensor-label">${sensorLabel}</span>
                        </td>
                        <td>
                            <div class="temp-cell-wrapper">
                                <span class="temp-val-text">${temp.toFixed(1)} °C</span>
                                <div class="temp-bar-bg">
                                    <div class="temp-bar-fill ${status.bar} ${widthClass}"></div>
                                </div>
                            </div>
                        </td>
                        <td class="limit-cell">${crit}</td>
                        <td>
                            <span class="status-badge ${status.text}">${status.label}</span>
                        </td>
                    </tr>
                `;
            }
        }

        tbody.innerHTML = rows;
    }

    function fetchSensors() {
        if (typeof cockpit === "undefined" || !cockpit.spawn) {
            console.error("Cockpit API not available");
            return;
        }

        cockpit.spawn(["/home/astellias/.local/bin/sensors", "-j"])
            .done(function (data) {
                try {
                    const parsed = JSON.parse(data);
                    renderQuickCards(parsed);
                    renderTable(parsed);

                    const now = new Date();
                    const timeStr = now.toTimeString().split(" ")[0];
                    const lastUpdated = document.getElementById("last-updated");
                    if (lastUpdated) lastUpdated.textContent = `Updated: ${timeStr}`;
                } catch (e) {
                    console.error("Failed to parse sensors JSON", e);
                }
            })
            .fail(function (err) {
                console.error("Failed to read sensors", err);
                const tbody = document.getElementById("sensors-table-body");
                if (tbody) {
                    tbody.innerHTML = `<tr><td colspan="5" class="error-state">Failed to query sensors: ${err}</td></tr>`;
                }
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        fetchSensors();
        setInterval(fetchSensors, 1000);

        const btnRefresh = document.getElementById("btn-refresh");
        if (btnRefresh) {
            btnRefresh.addEventListener("click", fetchSensors);
        }
    });
})();
