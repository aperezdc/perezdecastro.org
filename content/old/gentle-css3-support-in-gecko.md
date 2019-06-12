+++
title = "Gentle CSS3 support in Gecko"
date = 2009-07-02
taxonomies.categories = ["igalia"]
+++

Today I updated [XulRunner][] to version 1.9.1 (with accompanying
updates to Epiphany 2.26.3 and Firefox 3.5), and made a little
experiment which I do everytime a web browser get updated: surf to
[css3.info][] and check whether some CSS3 cool stuff which was
previously unsupported works with the latest release.

This update brought in the following improvements:

-   [Text][] and [box][] shadows, to make the browser generate more
    bling with less tricks.
-   [HSL][] and [HSLA][] color spaces, essential for conveniently
    creating shades of the same colour, by changing the saturation
    and/or lightness.
-   Some new [background][] positioning options.
-   [Multicolumn][] layout. I still do not have a clear idea if I would
    like use this in a web design, but I feel like it will be superb for
    generating printed media.
-   At last: [TrueType fonts loaded from the web][]!
-   Other minor niceties :-D

I find very appealing that browsers are finally getting some of this
implemented, especially drop shadows and fonts loaded from the web, as
they allow designers for crafting very interesting designs while keeping
sites accessible. Especially with web fonts: it will be no longer
necessary to pre-generate titles and the like as bitmaps or generating
them server-side. Something as simple as a good font design can turn a
boring website into something beautiful, so this having feature (for now
in Safari/WebKit and Firefox/Gecko) is *absolutely thrilling*.

Good times for web design are coming... ;-)

  [XulRunner]: http://wiki.mozilla.org/XUL:Xul_Runner
  [css3.info]: http://css3.info
  [Text]: http://www.css3.info/preview/text-shadow/
  [box]: http://
  [HSL]: http://www.css3.info/preview/hsl/
  [HSLA]: http://www.css3.info/preview/hsla/
  [background]: http://www.css3.info/preview/background-origin-and-background-clip/
  [Multicolumn]: http://www.css3.info/preview/multi-column-layout/
  [TrueType fonts loaded from the web]: http://www.css3.info/preview/web-fonts-with-font-face/
