/* 
	Cockpit Files (Navigator) — Modern IconEngine Module
	Provides intelligent context-aware icon & color resolution for folders and files,
	with full user custom overrides persisted in localStorage without inline styles.
*/

export class IconEngine {
	static STORAGE_KEY = "navigator-custom-icons";

	static FOLDER_RULES = [
		// High Priority Storage & Drives
		{ regex: /^(ssd|nvme|fast_storage|fast)$/i, icon: "fas fa-bolt", colorClass: "icon-cyan", badgeClass: "badge-cyan", badge: "SSD", name: "Fast SSD" },
		{ regex: /^(hdd|storage|backup_storage|backups?)$/i, icon: "fas fa-hdd", colorClass: "icon-amber", badgeClass: "badge-amber", badge: "HDD", name: "Bulk Storage / HDD" },
		
		// Infrastructure & Virtualization
		{ regex: /^(containers?|docker|podman|compose)$/i, icon: "fab fa-docker", colorClass: "icon-sky", badgeClass: "badge-sky", badge: "POD", name: "Containers" },
		{ regex: /^(nginx|proxy|ssl|certs?|letsencrypt)$/i, icon: "fas fa-shield-alt", colorClass: "icon-green", badgeClass: "badge-green", badge: "SSL", name: "Security & Proxy" },
		{ regex: /^(pihole|dns)$/i, icon: "fas fa-network-wired", colorClass: "icon-rose", badgeClass: "badge-rose", badge: "DNS", name: "Network & DNS" },
		
		// AI & Data
		{ regex: /^(models?|ai|llm|weights?|checkpoints?)$/i, icon: "fas fa-brain", colorClass: "icon-violet", badgeClass: "badge-violet", badge: "AI", name: "AI Models" },
		{ regex: /^(data|databases?|db|sqlite)$/i, icon: "fas fa-database", colorClass: "icon-emerald", badgeClass: "badge-emerald", badge: "DB", name: "Databases" },
		{ regex: /^(lab|experiments?|benchmarks?|research)$/i, icon: "fas fa-flask", colorClass: "icon-yellow", badgeClass: "badge-yellow", badge: "LAB", name: "Lab & Experiments" },
		
		// Media & Automation
		{ regex: /^(media|movies?|films?|series|tv|shows?|plex)$/i, icon: "fas fa-film", colorClass: "icon-rose", badgeClass: "badge-rose", badge: "MEDIA", name: "Media" },
		{ regex: /^(downloads?|torrents?|incomplete)$/i, icon: "fas fa-download", colorClass: "icon-indigo", badgeClass: "badge-indigo", badge: "DL", name: "Downloads" },
		{ regex: /^(music|audio|podcasts?)$/i, icon: "fas fa-music", colorClass: "icon-purple", badgeClass: "badge-purple", badge: "AUDIO", name: "Audio" },
		{ regex: /^(pictures?|photos?|images?|screenshots?)$/i, icon: "fas fa-camera", colorClass: "icon-cyan", badgeClass: "badge-cyan", badge: "IMG", name: "Pictures" },
		{ regex: /^(videos?|recordings?)$/i, icon: "fas fa-video", colorClass: "icon-rose", badgeClass: "badge-rose", badge: "VID", name: "Videos" },
		{ regex: /^(documents?|docs?|notes?)$/i, icon: "fas fa-folder-open", colorClass: "icon-blue", badgeClass: "badge-blue", badge: "DOC", name: "Documents" },
		{ regex: /^(projects?|repos?|work|src)$/i, icon: "fas fa-code-branch", colorClass: "icon-purple", badgeClass: "badge-purple", badge: "DEV", name: "Projects" },
		{ regex: /^(scripts?|bin)$/i, icon: "fas fa-terminal", colorClass: "icon-green", badgeClass: "badge-green", badge: "CLI", name: "Scripts" },
		{ regex: /^\.git$/i, icon: "fab fa-git-alt", colorClass: "icon-amber", badgeClass: "badge-amber", badge: "GIT", name: "Git Repo" },
		{ regex: /^(node_modules|\.venv|venv|env|\.cache|cache)$/i, icon: "fas fa-boxes", colorClass: "icon-slate", badgeClass: "badge-slate", badge: "PKG", name: "Dependencies" },
		{ regex: /^\.config$/i, icon: "fas fa-cogs", colorClass: "icon-slate", badgeClass: "badge-slate", badge: "CFG", name: "Configuration" },
	];

	static FILE_RULES = [
		// AI Models
		{ ext: /\.(gguf|bin|safetensors|pt|pth|onnx)$/i, icon: "fas fa-microchip", colorClass: "icon-violet", name: "AI Model Weights" },
		
		// Containers & Cloud
		{ ext: /\.(container|network|volume|image|kube|pod)$/i, icon: "fab fa-docker", colorClass: "icon-sky", name: "Quadlet / Container" },
		
		// Databases
		{ ext: /\.(sqlite|sqlite3|db|db3|sql)$/i, icon: "fas fa-database", colorClass: "icon-emerald", name: "Database File" },
		
		// Archives & Packages
		{ ext: /\.(tar\.gz|tar\.xz|tar\.bz2|tar\.zst|tar|gz|zip|7z|rar|iso|rpm|deb)$/i, icon: "fas fa-file-archive", colorClass: "icon-amber", name: "Archive" },
		
		// Code & Scripts
		{ ext: /\.(sh|bash|zsh)$/i, icon: "fas fa-terminal", colorClass: "icon-green", name: "Shell Script" },
		{ ext: /\.(py|pyw)$/i, icon: "fab fa-python", colorClass: "icon-sky", name: "Python Script" },
		{ ext: /\.(js|mjs|cjs|ts)$/i, icon: "fab fa-js", colorClass: "icon-yellow", name: "JavaScript/TypeScript" },
		{ ext: /\.(cs|fs|vb)$/i, icon: "fas fa-code", colorClass: "icon-purple", name: ".NET Source" },
		{ ext: /\.(json|toml|yaml|yml|conf|cfg|ini|env)$/i, icon: "fas fa-file-code", colorClass: "icon-slate", name: "Config / Data" },
		{ ext: /\.(service|timer|mount|path|socket)$/i, icon: "fas fa-cog", colorClass: "icon-cyan", name: "Systemd Unit" },
		
		// Documents & Media
		{ ext: /\.(md|markdown|txt|rtf|pdf|log)$/i, icon: "fas fa-file-alt", colorClass: "icon-blue", name: "Document / Text" },
		{ ext: /\.(mp4|mkv|avi|mov|webm)$/i, icon: "fas fa-file-video", colorClass: "icon-rose", name: "Video" },
		{ ext: /\.(mp3|flac|wav|ogg|m4a)$/i, icon: "fas fa-file-audio", colorClass: "icon-purple", name: "Audio" },
		{ ext: /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i, icon: "fas fa-file-image", colorClass: "icon-cyan", name: "Image" }
	];

	static PALETTE_ICONS = [
		{ id: "fas fa-folder", label: "Folder (Default)" },
		{ id: "fas fa-bolt", label: "Lightning (SSD)" },
		{ id: "fas fa-hdd", label: "Hard Drive (HDD)" },
		{ id: "fab fa-docker", label: "Docker / Podman" },
		{ id: "fas fa-cubes", label: "Cubes / Services" },
		{ id: "fas fa-brain", label: "Brain / AI" },
		{ id: "fas fa-robot", label: "Robot" },
		{ id: "fas fa-microchip", label: "Chip / Hardware" },
		{ id: "fas fa-database", label: "Database" },
		{ id: "fas fa-server", label: "Server" },
		{ id: "fas fa-flask", label: "Flask / Lab" },
		{ id: "fas fa-film", label: "Film / Media" },
		{ id: "fas fa-download", label: "Download" },
		{ id: "fas fa-shield-alt", label: "Shield / Security" },
		{ id: "fas fa-network-wired", label: "Network / DNS" },
		{ id: "fas fa-code-branch", label: "Git / Branch" },
		{ id: "fas fa-terminal", label: "Terminal / CLI" },
		{ id: "fas fa-cogs", label: "Settings / Config" },
		{ id: "fas fa-layer-group", label: "Layers / Stack" },
		{ id: "fas fa-archive", label: "Archive / Backup" },
		{ id: "fas fa-music", label: "Music" },
		{ id: "fas fa-camera", label: "Camera" },
		{ id: "fas fa-star", label: "Star / Favorite" }
	];

	static PALETTE_COLORS = [
		{ id: "cyan", class: "icon-cyan", dotClass: "dot-cyan", badgeClass: "badge-cyan", label: "Cyan" },
		{ id: "sky", class: "icon-sky", dotClass: "dot-sky", badgeClass: "badge-sky", label: "Sky Blue" },
		{ id: "blue", class: "icon-blue", dotClass: "dot-blue", badgeClass: "badge-blue", label: "Adwaita Blue" },
		{ id: "indigo", class: "icon-indigo", dotClass: "dot-indigo", badgeClass: "badge-indigo", label: "Indigo" },
		{ id: "purple", class: "icon-purple", dotClass: "dot-purple", badgeClass: "badge-purple", label: "Purple" },
		{ id: "violet", class: "icon-violet", dotClass: "dot-violet", badgeClass: "badge-violet", label: "Neon Violet" },
		{ id: "rose", class: "icon-rose", dotClass: "dot-rose", badgeClass: "badge-rose", label: "Rose / Red" },
		{ id: "amber", class: "icon-amber", dotClass: "dot-amber", badgeClass: "badge-amber", label: "Amber / Orange" },
		{ id: "yellow", class: "icon-yellow", dotClass: "dot-yellow", badgeClass: "badge-yellow", label: "Yellow" },
		{ id: "emerald", class: "icon-emerald", dotClass: "dot-emerald", badgeClass: "badge-emerald", label: "Emerald Green" },
		{ id: "green", class: "icon-green", dotClass: "dot-green", badgeClass: "badge-green", label: "Bright Green" },
		{ id: "slate", class: "icon-slate", dotClass: "dot-slate", badgeClass: "badge-slate", label: "Slate / Neutral" }
	];

	/**
	 * Get stored custom overrides map
	 * @returns {Record<string, { icon: string, colorClass: string, badgeClass?: string, badge?: string }>}
	 */
	static getCustomOverrides() {
		try {
			const data = localStorage.getItem(IconEngine.STORAGE_KEY);
			return data ? JSON.parse(data) : {};
		} catch (e) {
			console.error("Failed to parse custom icons from localStorage:", e);
			return {};
		}
	}

	/**
	 * Save custom override for path
	 */
	static setCustomOverride(pathStr, icon, colorClass, badge = "") {
		try {
			const map = IconEngine.getCustomOverrides();
			const badgeClass = colorClass ? colorClass.replace("icon-", "badge-") : "badge-sky";
			map[pathStr] = { icon, colorClass, badgeClass, badge };
			localStorage.setItem(IconEngine.STORAGE_KEY, JSON.stringify(map));
		} catch (e) {
			console.error("Failed to save custom icon to localStorage:", e);
		}
	}

	/**
	 * Remove custom override for path
	 */
	static removeCustomOverride(pathStr) {
		try {
			const map = IconEngine.getCustomOverrides();
			if (map[pathStr]) {
				delete map[pathStr];
				localStorage.setItem(IconEngine.STORAGE_KEY, JSON.stringify(map));
			}
		} catch (e) {
			console.error("Failed to remove custom icon from localStorage:", e);
		}
	}

	/**
	 * Resolve folder visual styles
	 */
	static resolveDir(filename, pathStr, isLink = false) {
		const overrides = IconEngine.getCustomOverrides();
		if (overrides[pathStr]) {
			return {
				iconClass: overrides[pathStr].icon,
				colorClass: overrides[pathStr].colorClass || "icon-sky",
				badgeClass: overrides[pathStr].badgeClass || "badge-sky",
				badge: overrides[pathStr].badge || (isLink ? "LINK" : ""),
				isCustom: true
			};
		}

		for (const rule of IconEngine.FOLDER_RULES) {
			if (rule.regex.test(filename)) {
				return {
					iconClass: rule.icon,
					colorClass: rule.colorClass,
					badgeClass: rule.badgeClass,
					badge: isLink ? `${rule.badge} ↗` : rule.badge,
					isCustom: false
				};
			}
		}

		return {
			iconClass: isLink ? "fas fa-folder" : "fas fa-folder",
			colorClass: isLink ? "icon-indigo" : "icon-slate",
			badgeClass: isLink ? "badge-indigo" : "",
			badge: isLink ? "LINK" : "",
			isCustom: false
		};
	}

	/**
	 * Resolve file visual styles
	 */
	static resolveFile(filename, pathStr, isLink = false) {
		const overrides = IconEngine.getCustomOverrides();
		if (overrides[pathStr]) {
			return {
				iconClass: overrides[pathStr].icon,
				colorClass: overrides[pathStr].colorClass || "icon-slate",
				badgeClass: overrides[pathStr].badgeClass || "badge-slate",
				badge: overrides[pathStr].badge || (isLink ? "LINK" : ""),
				isCustom: true
			};
		}

		for (const rule of IconEngine.FILE_RULES) {
			if (rule.ext.test(filename)) {
				return {
					iconClass: rule.icon,
					colorClass: rule.colorClass,
					badgeClass: "badge-slate",
					badge: isLink ? "LINK" : "",
					isCustom: false
				};
			}
		}

		return {
			iconClass: "fas fa-file",
			colorClass: "icon-slate",
			badgeClass: "badge-slate",
			badge: isLink ? "LINK" : "",
			isCustom: false
		};
	}
}
