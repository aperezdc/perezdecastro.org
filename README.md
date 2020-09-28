# Personal Adrian's website and generator

This the source code for [my personal website](https://perezdecastro.org).

## License

- Articles (`*.markdown` files) are distributed under [Creative Commons Attribution-NoDerivs license](http://www.tldrlegal.com/license/creative-commons-attribution-noderivs-%28cc-nd%29).
- Generator code is distributed under the terms of the [MIT license](http://www.tldrlegal.com/license/mit-license).

## The generator

The website is generated using a small tool I cooked myself which
runs atop of [NodeJS](http://nodejs.org). If you are interested in
using it, the guts are in the [site.js](site.js) and [build](build)
scripts. The following packages are needed:

- `mustache` - for templating.
- `marked` - for rendering Markdown to HTML.
- `glob` - for scanning the file system.
- `veil` - for loading metadata and content from source files.
- `highlight.js` - for code syntax highlighting.
- `fishbone` - for easier OOP.

All packages can be installed with `npm install`, using the module list
included in `package.json`.

Content files are MIME-like, with a series of headers, and a body
which conforms the actual content. See under the year-named
directories for examples.

