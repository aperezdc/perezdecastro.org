# Personal Adrian's website and generator

This the source code for my personal website. For the moment it is WIP
and in the long term term I plan to import selected content from my
[personal blog](http://hario.wordpress.com) and my [Igalia
blog](http://blogs.igalia.com/aperez), consolidating all the content
in a single place.

## The generator

The website is generated using a small tool I cooked myself which
runs atop of [NodeJS](http://nodejs.org). If you are interested in
using it, the guts are in the [site.js](site.js) and [build](build)
scripts. The following packages are needed:

- `mustache` - for templating.
- `marked` - for rendering Markdown to HTML.
- `glob` - for scanning the file system.
- `veil` - for loading metadata and content from source files.
- `classy.js` - for easier OOP.
- `highlight.js` - for code syntax highlighting.

Content files are MIME-like, with a series of headers, and a body
which conforms the actual content. See under `posts/` for examples.

