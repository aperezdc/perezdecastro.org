all: css/all.css
css/all.css: css/normalize.min.css css/normalize-opentype.css css/fonts.css css/highlight.css css/main.css
	cat $^ | cssmin > $@
