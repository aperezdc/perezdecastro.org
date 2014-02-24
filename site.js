/*
 * site.js
 * Copyright (C) 2013 Adrian Perez <aperez@igalia.com>
 *
 * Distributed under terms of the MIT license.
 */

var F = require("fs");
var V = require("veil").defaults({ keys: "underscore" });
var P = require("path");
var G = require("glob");
var M = require("mustache");
var C = require("fishbone");
var H = require("highlight.js");
var marked = require("marked");

marked.setOptions({
	highlight: function (code, lang) {
		return (lang === undefined) ? code : H.highlight(lang, code).value;
	},
});


var MetadataBase = C({
	metadata: function (name, default_value) {
		var meta = this.getMetadata();
		if (meta === null) {
			meta = this;
		}
		if (name === undefined) {
			return meta;
		} else if (typeof(meta[name]) != "undefined") {
			return meta[name];
		} else if (default_value !== undefined) {
			return default_value;
		} else {
			return null;
		}
	},

	getMetadata: function () {
		return this;
	},
});


var MONTHS = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];


var Page = MetadataBase.extend({

	init: function (site, path) {
		this.site = site;
		this.hidden = false;
		this._tags = null;
		this._date = null;
		this._slug = null;
		this._sidebar = null;
		this._path = P.normalize(P.resolve(path));
		this._suffix = P.extname(this._path);
		this._metadata = null;
	},

	render: function () {
		var template = this.template();

		// Use the own contents as template
		if (template === null)
			template = this.body()

		var render_data = this;
		if (typeof(this.render_data) == "function")
			render_data = this.render_data();

		if (!render_data)
			throw "No data to render";
		return M.render(template, render_data);
	},

	// Override MetadataBase.getMetadata()
	getMetadata: function () {
		if (this._metadata === null) {
			this._metadata = V.parse(F.readFileSync(this._path, { encoding: "utf-8" }));
		}
		return this._metadata;
	},

	getContent: function (format) {
		var vname = "$content_" + format;
		if (!this[vname]) {
			this[vname] = this.site.convert(this._path, format, this);
		}
		return this[vname];
	},

	getDate: function () {
		if (this._date === null) {
			var datestring = this.metadata("date");
			if (datestring) {
				try {
					this._date = new Date(datestring);
				} catch (e) {
					// Do nothing, will pick date from filesystem below.
				}
			}
			if (this._date === null) {
				this._date = F.statSync(this._path).mtime;
			}
		}
		return this._date;
	},

	date: function () {
		var d = this.getDate();
		return (d.getDate() + " " +
				MONTHS[d.getMonth()] + " " +
				d.getFullYear());
	},

	file_rfc822date: function () {
		return F.statSync(this._path).mtime.toISOString();
	},

	slug: function () {
		if (this._slug === null) {
			var basename = this.metadata("slug", P.basename(this._path, this._suffix));
			var reldir = P.dirname(this._path).substring(this.site.basedir.length + 1);
			this._slug = reldir ? reldir + "/" + basename : basename;
		}
		return this._slug;
	},

	tags: function () {
		if (!this._tags) {
			this._tags = [];
			var str = this.metadata("tags");
			if (str) {
				str = str.split(",");
				for (var i = 0; i < str.length; i++) {
					var s = str[i].trim();
					if (s.length) {
						this._tags[this._tags.length] = s;
					}
				}
			}
		}
		return this._tags;
	},

	sidebar: function () {
		if (this._sidebar === null) {
			var sidebar = this.metadata("sidebar");
			if (sidebar) {
				this._sidebar = this.site.getSidebar(sidebar);
			} else {
				this._sidebar = false;
			}
		}
		return this._sidebar;
	},

	author: function () {
		var author = this.metadata("author");
		return author ? author : this.site.author();
	},

	author_email: function () {
		var author_email = this.metadata("author_email");
		return author_email ? author_email : this.site.author_email();
	},

	output_suffix: function () {
		return this.metadata("output_suffix", "html");
	},

	nocomments: function () {
		var val = this.metadata("comments");
		if (val === null || val === undefined)
			return false;
		return val.trim() != "true";
	},

	is_index  : function () { return this.slug() == "index"; },
	content   : function () { return this.getContent("html"); },
	relpath   : function () { return this._path.slice(site.basedir.length + 1); },
	template  : function () { return this.site.getTemplate(this.metadata("layout", "page")); },
	body      : function () { return this.metadata("body"); },
	title     : function () { return this.metadata("title"); },
	subtitle  : function () { return this.metadata("subtitle"); },
	category  : function () { return this.metadata("category"); },
	hide_title: function () { return this.metadata("hide_title"); },
	hide_date : function () { return this.metadata("hide_date"); },
	rfc822date: function () { return this.getDate().toISOString(); },
	baseurl   : function () { return this.site.baseurl(); },
	url       : function () { return this.slug() + "." + this.output_suffix(); },
	fullurl   : function () { return this.baseurl() + "/" + this.url(); },
});
exports.Page = Page;


var Converter = C({
	init: function () {
		this.add("markdown", "html", function (data, extra) { return marked(data); });
		this.add("mustache", "html", function (data, extra) { return M.render(data, extra); });
	},

	add: function (from, to, func) {
		var fname = "$convert_." + from + "_$to_." + to;
		if (typeof(this[fname]) == "function") {
			throw "Converter " + from + "→" + to + " is already defined";
		} else {
			this[fname] = func;
		}
	},

	convert: function (from, to, body, data) {
		var fname = "$convert_" + from + "_$to_." + to;
		if (typeof(this[fname]) == "function") {
			return this[fname](body, data);
		} else {
			throw "Converter " + from + "→" + " not defined";
		}
	},
});


function sortPostsByDate(a, b) {
	return b.getDate().getTime() - a.getDate().getTime();
}
exports.sortPostsByDate = sortPostsByDate;


var Site = MetadataBase.extend({
	init: function (path, draft) {
		this.converter = new Converter();
		this.basedir = P.normalize(P.resolve(path));
		var self = this;
		this.content = {
			tag: function () {
				return self._getTagSortedContent();
			}
		};
		this.draft = (draft === undefined) ? false : draft;
		this._metafile = this.basedir + P.sep + "site.json";
		this._metadata = null;
		this._template_cache = {};
		this._sidebar_cache = {};
		this._build_date = new Date();
		this._loadContent(); // Must be the last thing done
	},

	_loadContent: function () {
		var content = this.metadata("@content");
		if (!content) content = { "pages": ["*.markdown", "*.mustache"] };
		for (var kind in content) {
			var patterns = content[kind];
			this.content[kind] = [];
			for (var i = 0; i < patterns.length; i++) {
				var files = G.sync(patterns[i], { cwd: this.basedir, root: this.basedir, nosort: true });
				if (!files) {
					continue;
				}
				for (var j = 0; j < files.length; j++) {
					var page = new Page(this, files[j]);
					// Filter elements which are to be published in the future.
					page.hidden = (page.getDate() > this._build_date);
					this.content[kind][this.content[kind].length] = page;
				}
				this.content[kind].sort(sortPostsByDate);
			}
		}
	},

	getMetadata: function () {
		if (this._metadata === null) {
			this._metadata = require(this._metafile);
		}
		return this._metadata;
	},

	_getTagSortedContent: function () {
		if (this._per_tag_cache !== undefined)
			return this._per_tag_cache;

		var cache = {};
		for (var kind in this.content) {
			for (var i = 0; i < this.content[kind].length; i++) {
				var page = this.content[kind][i];
				var tags = page.tags();
				for (var j = 0; j < tags.length; j++) {
					var tag = tags[j];
					if (cache[tag] === undefined) {
						cache[tag] = [];
					}
					cache[tag].push(page);
				}
			}
		}

		return this._per_tag_cache = cache;
	},

	getTemplate: function (name) {
		if (name == "-")
			return null;

		var layout = this.metadata("@layout");
		if (!layout)
			throw "No layout templates defined";
		
		var name = layout[name];
		if (!name) name = layout["@default"];
		if (!name) name = "default.mustache";

		if (this._template_cache[name] === undefined) {
			var template_file = P.resolve(this.basedir + P.sep + name);
			var template = F.readFileSync(template_file, { encoding: "utf-8" });
			this._template_cache[name] = template;
		}
		return this._template_cache[name];
	},

	getSidebar: function (relpath) {
		if (this._sidebar_cache[relpath] === undefined) {
			if (F.statSync(this.basedir + "/" + relpath)) {
				this._sidebar_cache[relpath] = new Page(this, relpath);
			} else {
				this._sidebar_cache[relpath] = false;
			}
		}
		return this._sidebar_cache[relpath];
	},

	convert: function (path, to, data) {
		return this.converter.convert(P.extname(path), to, data.body(), data);
	},

	traverse: function (path) {
		if (typeof path == "string") {
			path = path.split(".");
		}
		var current = this;
		for (var i = 0; i < path.length; i++) {
			if (typeof current !== "object") {
				return undefined;
			}
			if (typeof current[path[i]] === "function") {
				current = current[path[i]].apply(current);
			} else {
				current = current[path[i]];
			}
		}
		return current;
	},

	rfc822date: function () {
		return this._build_date.toISOString();
	},

	title: function () { return this.metadata("title"); },
	author: function () { return this.metadata("author"); },
	tagline: function () { return this.metadata("tagline"); },
	baseurl: function () { return this.metadata("baseurl"); },
	navigation: function () { return this.metadata("navigation"); },
	author_email: function () { return this.metadata("author_email"); },
});
exports.Site = Site;

