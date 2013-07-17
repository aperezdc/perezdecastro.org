/*
 * site.js
 * Copyright (C) 2013 Adrian Perez <aperez@igalia.com>
 *
 * Distributed under terms of the MIT license.
 */

require("./classy");
var F = require("fs");
var V = require("veil");
var P = require("path");
var G = require("glob");
var M = require("mustache");
var H = require("highlight.js");
var marked = require("marked");

marked.setOptions({
	highlight: function (code, lang) {
		return (lang === undefined) ? code : H.highlight(lang, code).value;
	},
});


var RenderMixin = {
	render: function () {
		var template = this.template();
		if (!template)
			throw "No template defined";

		var render_data = this;
		if (typeof(this.render_data) == "function")
			render_data = this.render_data();

		if (!render_data)
			throw "No data to render";
		return M.render(template, render_data);
	}
};

var MetadataMixin = {
	metadata: function (name, default_value) {
		if (this._metadata === null) {
			this._metadata = this.load_metadata();
		}
		if (!name) {
			return this._metadata;
		} else if (typeof(this._metadata[name]) != "undefined") {
			return this._metadata[name];
		} else {
			return default_value;
		}
	}
};

var MetadataJsonMixin = {
	load_metadata: function () {
		if (typeof(this._metafile) != "undefined") {
			return require(this._metafile);
		}
		if (typeof(this.$class.metafile) != "undefined") {
			return require(P.normalize(P.resolve(this.$class.metafile)));
		}
		throw "No metafile defined";
	}
};


var MONTHS = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];


var Page = Class.$extend({
	__include__: [MetadataMixin, RenderMixin],

	__init__: function (site, path) {
		this.site = site;
		this._date = null;
		this._slug = null;
		this._path = P.normalize(P.resolve(path));
		this._suffix = P.extname(this._path);
		this._metadata = null;
	},

	load_metadata: function () {
		return V.parse(F.readFileSync(this._path, { encoding: "utf-8" }));
	},

	get_content: function (format) {
		var vname = "$content_" + format;
		if (!this[vname]) {
			this[vname] = this.site.convert(this._path, format, this);
		}
		return this[vname];
	},

	get_date: function () {
		if (this._date === null) {
			var datestring = this.metadata("date");
			if (datestring) {
				try {
					this._date = new Date(datestring);
				} catch (e) {
					// Do nothing, will pickl date from filesystem below.
				}
			}
			if (this._date === null) {
				this._date = F.statSync(this._path).mtime;
			}
		}
		return this._date;
	},

	date: function () {
		var d = this.get_date();
		return (d.getDate() + " " +
				MONTHS[d.getMonth()] + " " +
				d.getFullYear());
	},

	slug: function () {
		if (this._slug === null) {
			var basename = this.metadata("slug", P.basename(this._path, this._suffix));
			var reldir = P.dirname(this._path).substring(this.site.basedir.length + 1);
			this._slug = reldir ? reldir + "/" + basename : basename;
		}
		return this._slug;
	},

	content   : function () { return this.get_content("html"); },
	relpath   : function () { return this._path.slice(site.basedir.length + 1); },
	template  : function () { return this.site.get_template("page"); },
	body      : function () { return this.metadata("body"); },
	title     : function () { return this.metadata("title"); },
	subtitle  : function () { return this.metadata("subtitle"); },
	navigation: function () { return this.metadata("navigation"); },
	hide_title: function () { return this.metadata("hide_title"); },
});
exports.Page = Page;


var Post = Page.$extend({
	__init__: function (site, path) {
		this.$super(site, path);
		this._tags = null;
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

	template  : function () { return this.site.get_template("post"); },
});
exports.Post = Post;


var Converter = Class.$extend({
	__init__: function () {
		this.add("markdown", "html", function (data, extra) { return marked (data); });
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


var Site = Class.$extend({
	__include__: [MetadataMixin, MetadataJsonMixin],

	__init__: function (path) {
		this.converter = new Converter();
		this.basedir = P.normalize(P.resolve(path));
		this.content = {};
		this._metafile = this.basedir + P.sep + "site.json";
		this._metadata = null;
		this._template_cache = {};
		this._sorted_posts = null;
		this._load_content(); // Must be the last thing done
	},

	_load_content: function () {
		var content = this.metadata("@content");
		if (!content) content = { "Page": ["*.markdown", "*.mustache"] };
		for (var clsname in content) {
			var patterns = content[clsname];
			var cls = exports[clsname];
			if (!cls) continue;

			var items = [];
			for (var i = 0; i < patterns.length; i++) {
				var files = G.sync(patterns[i], { cwd: this.basedir,
					root: this.basedir, nosort: true });
				if (!files) continue;
				for (var j = 0; j < files.length; j++)
					items[items.length] = new cls(this, files[j]);
			}
			if (items.length) {
				this.content[clsname] = items;
			}
		}
	},

	get_template: function (name) {
		var layout = this.metadata("@layout");
		if (!layout)
			throw "No layout templates defined";
		
		var name = layout[name];
		if (!name) name = layout["@default"];
		if (!name) name = "default.mustache";

		if (!this._template_cache[name]) {
			var template_file = P.resolve(this.basedir + P.sep + name);
			var template = F.readFileSync(template_file, { encoding: "utf-8" });
			this._template_cache[name] = template;
		}
		return this._template_cache[name];
	},

	convert: function (path, to, data) {
		return this.converter.convert(P.extname(path), to, data.body(), data);
	},

	get_sorted_posts: function () {
		if (this._sorted_posts === null) {
			this._sorted_posts = [];
			if (this.content["Post"]) {
				for (var i = 0; i < this.content.Post.length; i++) {
					this._sorted_posts[i] = this.content.Post[i];
				}
				this._sorted_posts.sort(function (a, b) {
					return b.get_date().getTime() - a.get_date().getTime();
				});
			}
		}
		return this._sorted_posts;
	},

	posts  : function () { return this.get_sorted_posts(); },
	title  : function () { return this.metadata("title"); },
	tagline: function () { return this.metadata("tagline"); },

});
exports.Site = Site;

