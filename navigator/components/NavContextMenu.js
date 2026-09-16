/* 
	Cockpit Files (Navigator) - A Modern Linux Desktop File System Browser for Cockpit.
	CSP-Compliant NavContextMenu Component with Icon Customizer.
*/

import { NavEntry } from "./NavEntry.js";
import { NavFile, NavFileLink } from "./NavFile.js";
import { NavDir, NavDirLink } from "./NavDir.js";
import { NavDownloader } from "./NavDownloader.js";
import { IconEngine } from "./IconEngine.js";

export class NavContextMenu {
	/**
	 * 
	 * @param {string} id 
	 */
	constructor(id, nav_window_ref) {
		this.dom_element = document.getElementById(id);
		this.nav_window_ref = nav_window_ref;
		this.menu_options = {};
		document.documentElement.addEventListener("click", (event) => {
			if (event.target !== this.dom_element)
				this.hide();
		});
		
		var functions = [
			["new_dir", '<div><i class="fas fa-folder-plus"></i></div>'],
			["new_file", '<div><i class="fas fa-file-medical"></i></div>'],
			["new_link", '<div><i class="fas fa-link nav-icon-decorated"><i class="fas fa-plus nav-icon-decoration"></i></i></div>'],
			["cut", '<div><i class="fas fa-cut"></i></div>'],
			["copy", '<div><i class="fas fa-copy"></i></div>'],
			["paste", '<div><i class="fas fa-paste"></i></div>'],
			["rename", '<div><i class="fas fa-i-cursor"></i></div>'],
			["custom_icon", '<div><i class="fas fa-palette"></i></div>'],
			["delete", '<div><i class="fas fa-trash-alt"></i></div>'],
			["download", '<div><i class="fas fa-download"></i></div>'],
			["properties", '<div><i class="fas fa-sliders-h"></i></div>']
		];
		for (let func of functions) {
			var elem = document.createElement("div");
			var name_list = func[0].split("_");
			name_list.forEach((word, index) => {name_list[index] = word.charAt(0).toUpperCase() + word.slice(1)});
			var label = name_list.join(" ");
			if (func[0] === "custom_icon")
				label = "Customize Icon & Color";
			elem.innerHTML = func[1] + label;
			elem.addEventListener("click", (e) => {this[func[0]].bind(this, e).apply()});
			elem.classList.add("nav-context-menu-item")
			elem.id = "nav-context-menu-" + func[0];
			this.dom_element.appendChild(elem);
			this.menu_options[func[0]] = elem;
		}
	}

	new_dir(e) {
		this.nav_window_ref.mkdir();
	}

	new_file(e) {
		this.nav_window_ref.touch();
	}

	new_link(e) {
		var default_target = "";
		if (this.nav_window_ref.selected_entries.size <= 1 && this.target !== this.nav_window_ref.pwd())
			default_target = this.target.filename;
		this.nav_window_ref.ln(default_target);
	}

	cut(e) {
		this.nav_window_ref.cut();
	}

	copy(e) {
		this.nav_window_ref.copy();
	}

	paste(e) {
		this.nav_window_ref.paste();
	}

	async rename(e) {
		this.hide();
		if (this.target.is_dangerous_path()) {
			await this.nav_window_ref.modal_prompt.alert(
				"Cannot rename system-critical paths.",
				"If you think you need to, use the terminal."
			);
		} else {
			this.target.show_edit(this.target.dom_element.nav_item_title);
		}
		e.stopPropagation();
	}

	async custom_icon(e) {
		this.hide();
		const target = this.target;
		if (!target) return;
		const pathStr = target.path_str();
		const overrides = IconEngine.getCustomOverrides();
		const current = overrides[pathStr] || (target instanceof NavDir ? IconEngine.resolveDir(target.filename, pathStr, target instanceof NavDirLink) : IconEngine.resolveFile(target.filename, pathStr, target instanceof NavFileLink));

		let selectedIcon = current.iconClass || current.icon || (target instanceof NavDir ? "fas fa-folder" : "fas fa-file");
		let selectedColorClass = current.colorClass || "icon-sky";
		let selectedBadgeClass = current.badgeClass || "badge-sky";
		let currentBadge = current.badge || "";

		const modalBackdrop = document.createElement("div");
		modalBackdrop.className = "modal custom-icon-modal-backdrop";

		const dialog = document.createElement("div");
		dialog.className = "modal-dialog custom-icon-dialog";

		const content = document.createElement("div");
		content.className = "modal-content custom-icon-content";

		// Header
		const header = document.createElement("div");
		header.className = "modal-header custom-icon-header";
		header.innerHTML = `
			<h4 class="custom-icon-title">
				<i class="fas fa-palette icon-blue"></i>
				Customize: <span>${target.filename}</span>
			</h4>
		`;

		// Body
		const body = document.createElement("div");
		body.className = "modal-body custom-icon-body";

		// Preview Box
		const previewBox = document.createElement("div");
		previewBox.className = "custom-icon-preview-box";

		const previewIcon = document.createElement("i");
		previewIcon.className = `custom-icon-preview-icon ${selectedIcon} ${selectedColorClass}`;

		const previewBadge = document.createElement("span");
		previewBadge.className = `nav-item-badge custom-icon-preview-badge ${selectedBadgeClass} ${currentBadge ? "" : "d-none"}`;
		previewBadge.innerText = currentBadge;

		const previewTitle = document.createElement("span");
		previewTitle.className = "custom-icon-preview-title";
		previewTitle.innerText = target.filename;

		previewBox.appendChild(previewIcon);
		previewBox.appendChild(previewBadge);
		previewBox.appendChild(previewTitle);
		body.appendChild(previewBox);

		// Colors
		const colorLabel = document.createElement("div");
		colorLabel.className = "custom-icon-section-label";
		colorLabel.innerText = "Accent Color:";
		body.appendChild(colorLabel);

		const colorsContainer = document.createElement("div");
		colorsContainer.className = "custom-icon-colors-container";

		IconEngine.PALETTE_COLORS.forEach(c => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = `custom-icon-color-dot ${c.dotClass} ${selectedColorClass === c.class ? "active" : ""}`;
			dot.title = c.label;
			dot.onclick = () => {
				selectedColorClass = c.class;
				selectedBadgeClass = c.badgeClass;
				previewIcon.className = `custom-icon-preview-icon ${selectedIcon} ${selectedColorClass}`;
				previewBadge.className = `nav-item-badge custom-icon-preview-badge ${selectedBadgeClass} ${previewBadge.innerText ? "" : "d-none"}`;
				colorsContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
				dot.classList.add("active");
			};
			colorsContainer.appendChild(dot);
		});
		body.appendChild(colorsContainer);

		// Icons
		const iconLabel = document.createElement("div");
		iconLabel.className = "custom-icon-section-label";
		iconLabel.innerText = "Icon Picker:";
		body.appendChild(iconLabel);

		const iconsContainer = document.createElement("div");
		iconsContainer.className = "custom-icon-icons-container";

		IconEngine.PALETTE_ICONS.forEach(item => {
			const iconBtn = document.createElement("button");
			iconBtn.type = "button";
			iconBtn.className = `custom-icon-btn ${selectedIcon === item.id ? "active" : ""}`;
			iconBtn.title = item.label;
			iconBtn.innerHTML = `<i class="${item.id}"></i>`;
			iconBtn.onclick = () => {
				selectedIcon = item.id;
				previewIcon.className = `custom-icon-preview-icon ${selectedIcon} ${selectedColorClass}`;
				iconsContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
				iconBtn.classList.add("active");
			};
			iconsContainer.appendChild(iconBtn);
		});
		body.appendChild(iconsContainer);

		// Badge
		const badgeLabel = document.createElement("div");
		badgeLabel.className = "custom-icon-section-label";
		badgeLabel.innerText = "Custom Badge Text (Optional, max 4 chars):";
		body.appendChild(badgeLabel);

		const badgeInput = document.createElement("input");
		badgeInput.type = "text";
		badgeInput.maxLength = 4;
		badgeInput.value = currentBadge;
		badgeInput.placeholder = "e.g. SSD, AI, DB";
		badgeInput.className = "custom-icon-badge-input";
		badgeInput.oninput = () => {
			const val = badgeInput.value.trim().toUpperCase();
			previewBadge.innerText = val;
			if (val) {
				previewBadge.classList.remove("d-none");
			} else {
				previewBadge.classList.add("d-none");
			}
		};
		body.appendChild(badgeInput);

		// Footer Buttons
		const footer = document.createElement("div");
		footer.className = "modal-footer custom-icon-footer";

		const resetBtn = document.createElement("button");
		resetBtn.type = "button";
		resetBtn.innerText = "Reset to Default";
		resetBtn.className = "pf-c-button pf-m-link";
		resetBtn.onclick = () => {
			IconEngine.removeCustomOverride(pathStr);
			document.body.removeChild(modalBackdrop);
			if (typeof target.apply_visuals === "function") target.apply_visuals();
			this.nav_window_ref.refresh();
		};

		const rightBtnGroup = document.createElement("div");
		rightBtnGroup.className = "flex-row";

		const cancelBtn = document.createElement("button");
		cancelBtn.type = "button";
		cancelBtn.innerText = "Cancel";
		cancelBtn.className = "pf-c-button pf-m-secondary";
		cancelBtn.onclick = () => document.body.removeChild(modalBackdrop);

		const spacer = document.createElement("div");
		spacer.className = "horizontal-spacer";

		const saveBtn = document.createElement("button");
		saveBtn.type = "button";
		saveBtn.innerText = "Save Icon";
		saveBtn.className = "pf-c-button pf-m-primary";
		saveBtn.onclick = () => {
			IconEngine.setCustomOverride(pathStr, selectedIcon, selectedColorClass, badgeInput.value.trim().toUpperCase());
			document.body.removeChild(modalBackdrop);
			if (typeof target.apply_visuals === "function") target.apply_visuals();
			this.nav_window_ref.refresh();
		};

		rightBtnGroup.appendChild(cancelBtn);
		rightBtnGroup.appendChild(spacer);
		rightBtnGroup.appendChild(saveBtn);
		footer.appendChild(resetBtn);
		footer.appendChild(rightBtnGroup);

		content.appendChild(header);
		content.appendChild(body);
		content.appendChild(footer);
		dialog.appendChild(content);
		modalBackdrop.appendChild(dialog);
		document.body.appendChild(modalBackdrop);
	}

	zip_for_download() {
		return new Promise((resolve, reject) => {
			var cmd = [
				"/usr/share/cockpit/navigator/scripts/zip-for-download.py3",
				this.nav_window_ref.pwd().path_str()
			];
			for (let entry of this.nav_window_ref.selected_entries) {
				cmd.push(entry.path_str());
			}
			var proc = cockpit.spawn(cmd, {superuser: "try", err: "out"});
			proc.fail((e, data) => {
				reject(JSON.parse(data));
			});
			proc.done((data) => {
				resolve(JSON.parse(data));
			});
		});
	}

	async download() {
		this.hide();
		if (this.nav_window_ref.selected_entries.size === 1 && !this.target.stat["isdir"]) {
			new NavDownloader(this.target);
		} else {
			this.nav_window_ref.start_load();
			var zip_file;
			try {
				zip_file = await this.zip_for_download();
			} catch(e) {
				this.nav_window_ref.modal_prompt.alert(e);
				this.nav_window_ref.stop_load();
				return;
			}
			var dl = new NavDownloader(new NavFile(zip_file, {size: 0}, this.nav_window_ref));
			dl.on_finish(() => {
				cockpit.spawn(["rm", "-f", zip_file]);
			});
			this.nav_window_ref.stop_load();
		}
	}

	properties(e) {
		this.hide();
		this.nav_window_ref.show_properties();
	}

	delete(e) {
		this.nav_window_ref.delete_selected();
	}

	show(event, target) {
		if (this.nav_window_ref.selected_entries.has(target)) {
			if (event.ctrlKey)
				this.nav_window_ref.set_selected(target, event.shiftKey, event.ctrlKey);
		} else {
			this.nav_window_ref.set_selected(target, false, false);
		}
		for (let option of Object.keys(this.menu_options)) {
			this.menu_options[option].className = "nav-context-menu-item d-flex";
		}
		if (this.nav_window_ref.none_selected()) {
			this.menu_options["copy"].className = "nav-context-menu-item d-none";
			this.menu_options["cut"].className = "nav-context-menu-item d-none";
			this.menu_options["delete"].className = "nav-context-menu-item d-none";
			this.menu_options["download"].className = "nav-context-menu-item d-none";
			if (this.menu_options["custom_icon"])
				this.menu_options["custom_icon"].className = "nav-context-menu-item d-none";
		}
		if (this.nav_window_ref.selected_entries.size > 1) {
			this.menu_options["rename"].className = "nav-context-menu-item d-none";
			if (this.menu_options["custom_icon"])
				this.menu_options["custom_icon"].className = "nav-context-menu-item d-none";
		} else {
			if (target instanceof NavDirLink || target instanceof NavFileLink)
				this.menu_options["download"].className = "nav-context-menu-item d-none";
		}
		if (!this.nav_window_ref.clip_board.length)
			this.menu_options["paste"].className = "nav-context-menu-item d-none";
		this.target = target;
		this.dom_element.style.display = "inline";
		this.dom_element.style.left = event.clientX + "px";
		var height = this.dom_element.getBoundingClientRect().height;
		var max_height = window.innerHeight;
		if (event.clientY > max_height - height) {
			this.dom_element.style.top = event.clientY - height + "px";
		} else {
			this.dom_element.style.top = event.clientY + "px";
		}
	}

	hide() {
		this.dom_element.style.display = "none";
	}

	hide_paste() {
		this.menu_options["paste"].className = "nav-context-menu-item d-none";
	}
}
