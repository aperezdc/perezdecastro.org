bob := $(wildcard 20*/*.bob)
svg := $(patsubst %.bob,%.svg,$(bob))

%.svg: %.bob
	svgbob -o $@ $<

all: css/all.css $(svg)
css/all.css: css/normalize.min.css css/normalize-opentype.css css/fonts.css css/highlight.css css/main.css
	cat $^ | python -mrcssmin -b > $@
