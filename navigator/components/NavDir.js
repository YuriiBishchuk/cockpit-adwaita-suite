/* 
	Cockpit Files (Navigator) - A Modern Linux Desktop File System Browser for Cockpit.
	CSP-Compliant NavDir Component with IconEngine.
*/

import { NavEntry } from "./NavEntry.js";
import { NavFile, NavFileLink } from "./NavFile.js";
import { NavWindow } from "./NavWindow.js";
import { property_entry_html } from "../functions.js";
import { IconEngine } from "./IconEngine.js";

export class NavDir extends NavEntry {
	/**
	 * 
	 * @param {string|string[]} path 
	 * @param {object} stat 
	 * @param {NavWindow} nav_window_ref 
	 */
	constructor(path, stat, nav_window_ref) {
		super(path, stat, nav_window_ref);
		this.nav_type = "dir";
		this.double_click = false;
		this.apply_visuals(false);
	}

	apply_visuals(isLink = false) {
		const res = IconEngine.resolveDir(this.filename, this.path_str(), isLink);
		this.resolved_icon = res;
		this.dom_element.nav_item_icon.className = `nav-item-icon ${res.iconClass} ${res.colorClass || ''}`;
		if (res.badge) {
			this.dom_element.nav_item_badge.innerText = res.badge;
			this.dom_element.nav_item_badge.className = `nav-item-badge ${res.badgeClass || ''}`;
		} else {
			this.dom_element.nav_item_badge.className = "nav-item-badge d-none";
		}
	}

	/**
	 * 
	 * @param {Event} e 
	 */
	handleEvent(e) {
		switch (e.type) {
			case "click":
				if (this.double_click)
					this.nav_window_ref.cd(this);
				else {
					// single click
					this.double_click = true;
					if (this.timeout)
						clearTimeout(this.timeout);
					this.timeout = setTimeout(() => {
						this.double_click = false;
					}, 500);
				}
				break;
		}
		super.handleEvent(e);
	}

	/**
	 * 
	 * @param {NavWindow} nav_window_ref 
	 * @returns {Promise<NavEntry[]>}
	 */
	get_children(nav_window_ref) {
		return new Promise(async (resolve, reject) => {
			var children = [];
			var proc = cockpit.spawn(
				["/usr/share/cockpit/navigator/scripts/ls.py3", this.path_str()],
				{err:"out", superuser: "try"}
			);
			proc.fail((e, data) => {
				reject(data);
			});
			var data;
			try {
				data = await proc;
			} catch(e) {
				reject(e);
				return;
			}
			var response = JSON.parse(data);
			this.stat = response["."]["stat"];
			var entries = response["children"];
			var filename, path, stat;
			entries.forEach((entry) => {
				filename = entry["filename"];
				path = (this.path.length >= 1 && this.path[0]) ? [...this.path, filename] : [filename];
				stat = entry["stat"];
				switch(stat["mode-str"].charAt(0)) {
					case 'd':
						children.push(new NavDir(path, stat, nav_window_ref));
						break;
					case 'l':
						if(entry["isdir"])
							children.push(new NavDirLink(path, stat, nav_window_ref, entry["link-target"]));
						else
							children.push(new NavFileLink(path, stat, nav_window_ref, entry["link-target"]));
						break;
					default:
						children.push(new NavFile(path, stat, nav_window_ref));
						break;
				}
			});
			resolve(children);
		});
	}

	/**
	 * 
	 * @returns {Promise<void>}
	 */
	rm() {
		return new Promise(async (resolve, reject) => {
			var proc = cockpit.spawn(
				["rmdir", this.path_str()],
				{superuser: "try", err: "out"}
			);
			proc.done((data) => {
				resolve();
			});
			proc.fail(async (e, data) => {
				if (/^rmdir: failed to remove .*: Directory not empty\n?$/.test(data)) {
					if (await this.nav_window_ref.modal_prompt.confirm("WARNING: '" + this.path_str() + "' is not empty.", "Delete recursively? This can NOT be undone.", true)) {
						this.rm_recursive(resolve, reject);
					}
				} else {
					reject(data);
				}
			});
		});
	}

	/**
	 * 
	 * @param {Function} resolve 
	 * @param {Function} reject 
	 */
	rm_recursive(resolve, reject) {
		var proc = cockpit.spawn(
			["rm", "-rf", this.path_str()],
			{superuser: "try", err: "out"}
		);
		proc.done((data) => {
			resolve();
		});
		proc.fail((e, data) => {
			reject(data);
		});
	}
	
	/**
	 * 
	 * @returns {Object}
	 */
	async cephfs_dir_stats() {
		try {
			var proc = await cockpit.spawn(
				["/usr/share/cockpit/navigator/scripts/cephfs-dir-stats.py3", "-j", this.path_str()],
				{err: "ignore"}
			);
			return JSON.parse(proc)[0];
		} catch {
			return null;
		}
	}

	/**
	 * 
	 * @param {string} extra_properties 
	 */
	async show_properties(extra_properties = "") {
		if(!this.hasOwnProperty("ceph_stats"))
			this.ceph_stats = await this.cephfs_dir_stats();
		if (this.ceph_stats !== null) {
			extra_properties +=
				'<div class="vertical-spacer"></div><h2 class="nav-info-column-filename">Ceph Status</h2>';
			extra_properties += property_entry_html(
				"Files",
				this.ceph_stats.hasOwnProperty("files") ? this.ceph_stats.files : "N/A"
			);
			extra_properties += property_entry_html(
				"Directories",
				this.ceph_stats.hasOwnProperty("subdirs") ? this.ceph_stats.subdirs : "N/A"
			);
			extra_properties += property_entry_html(
				"Recursive files",
				this.ceph_stats.hasOwnProperty("rfiles") ? this.ceph_stats.rfiles : "N/A"
			);
			extra_properties += property_entry_html(
				"Recursive directories",
				this.ceph_stats.hasOwnProperty("rsubdirs") ? this.ceph_stats.rsubdirs : "N/A"
			);
			extra_properties += property_entry_html(
				"Total size",
				this.ceph_stats.hasOwnProperty("rbytes") ? this.ceph_stats.rbytes : "N/A"
			);
			extra_properties += property_entry_html(
				"Layout pool",
				this.ceph_stats.hasOwnProperty("layout.pool") ? this.ceph_stats["layout.pool"] : "N/A"
			);
			extra_properties += property_entry_html(
				"Max files",
				this.ceph_stats.hasOwnProperty("max_files") ? this.ceph_stats.max_files : "N/A"
			);
			extra_properties += property_entry_html(
				"Max bytes",
				this.ceph_stats.hasOwnProperty("max_bytes") ? this.ceph_stats.max_bytes : "N/A"
			);
		}
		super.show_properties(extra_properties);
	}

	style_selected() {
		if (this.resolved_icon && this.resolved_icon.iconClass && this.resolved_icon.iconClass.includes("fa-folder")) {
			this.dom_element.nav_item_icon.classList.remove("fa-folder");
			this.dom_element.nav_item_icon.classList.add("fa-folder-open");
		}
		super.style_selected();
	}

	unstyle_selected() {
		if (this.dom_element.nav_item_icon.classList.contains("fa-folder-open")) {
			this.dom_element.nav_item_icon.classList.add("fa-folder");
			this.dom_element.nav_item_icon.classList.remove("fa-folder-open");
		}
		super.unstyle_selected();
	}
}

export class NavDirLink extends NavDir {
	/**
	 * 
	 * @param {string|string[]} path 
	 * @param {object} stat 
	 * @param {NavWindow} nav_window_ref 
	 * @param {string} link_target 
	 */
	constructor(path, stat, nav_window_ref, link_target) {
		super(path, stat, nav_window_ref);
		this.apply_visuals(true);
		
		var link_icon = this.dom_element.nav_item_icon.link_icon = document.createElement("i");
		link_icon.className = "fas fa-link nav-item-symlink-symbol-dir";
		this.dom_element.appendChild(link_icon);
		
		this.double_click = false;
		this.link_target = link_target;
		this.dom_element.title = `${this.filename} → ${link_target}`;
		if (nav_window_ref && nav_window_ref.item_display === "list")
			this.dom_element.nav_item_title.innerHTML += " &#8594; " + this.link_target;
	}

	/**
	 * 
	 * @returns {Promise<void>} 
	 */
	rm() {
		return new Promise((resolve, reject) => {
			var proc = cockpit.spawn(
				["rm", "-f", this.path_str()],
				{superuser: "try", err: "out"}
			);
			proc.done((data) => {
				resolve();
			});
			proc.fail((e, data) => {
				reject(data);
			});
		});
	}

	show_properties() {
		var extra_properties = property_entry_html("Link Target", this.link_target);
		super.show_properties(extra_properties);
	}
}
