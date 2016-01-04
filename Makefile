all: css/all.css
css/all.css: css/normalize.min.css css/highlight.css css/main.css
	cat $^ | cssmin > $@
