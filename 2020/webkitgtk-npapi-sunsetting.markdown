title: Sunsetting NPAPI support in WebKitGTK (and WPE)
date: 2020-09-29 00:50:00+0300
author: aperez
tags: igalia, webkit, floss

<ol class="toc">
  <li><a href="#summary">Summary</a></li>
  <li><a href="#what-is-npapi">What is NPAPI?</a></li>
  <li><a href="#what-is-npapi-used-for">What is NPAPI used for?</a></li>
  <li><a href="#why-are-npapi-plug-ins-being-phased-out">Why are NPAPI plug-ins being phased out?</a></li>
  <li><a href="#what-are-other-browsers-doing">What are other browsers doing?</a></li>
  <li><a href="#is-webkitgtk-following-suit">Is WebKitGTK following suit?</a></li>
</ol>

## Summary

Here's a [tl;dr](https://www.urbandictionary.com/define.php?term=tl%3Bdr)
list of bullet points:

* NPAPI is an old mechanism to extend the functionality of a web browser.
  It is time to let it go.
* One year ago, [WebKitGTK 2.26.0](https://www.webkitgtk.org/2019/09/09/webkitgtk2.26.0-released.html)
  [removed
  support](/2019/webkit-2.26-six-month-retrospective.html#cleanups) for NPAPI
  plug-ins which used GTK2, but the rest of plug-ins kept working.
* WebKitGTK 2.30.x will be the last stable series with support for NPAPI
  plug-ins _at all_. Version [2.30.0 was
  released](https://webkitgtk.org/2020/09/11/webkitgtk2.30.0-released.html) a
  couple of weeks ago.
* WebKitGTK 2.32.0, due in March 2021, will be the first *stable* release
  to ship without support for NPAPI plug-ins.
* We have already [removed the relevant
  code](https://trac.webkit.org/changeset/265753/) from the WebKit repository.
* While the WPE WebKit port allowed running windowless NPAPI plug-ins, this
  was never advertised nor supported by us.


## What is NPAPI?

In 1995, Netscape Navigator 2.0 introduced a mechanism to extend the
functionality of the web browser. That was NPAPI, short for _Netscape Plugin
Application Programming Interface_.  NPAPI allowed third parties to add
support for new content types; for example Future Splash (`.spl` files),
which later became Flash (`.swf`).

When a NPAPI plug-in is used to render content, the web browser _carves a
hole_ in the rectangular location where content handled by the plug-in will
be placed, and hands off the rendering responsibility to the plug-in. This
would end up calling call for trouble, as we will see later.


## What is NPAPI used for?

A number of technologies have used NPAPI along the years for different
purposes:

* Displaying of multimedia content using [Flash Player][wp-flash] or the
  [Silverlight][wp-silverlight] plug-ins.
* Running rich [Java™][wp-javaplug] applications in the browser.
* Displaying documents in non-Web formats (PDF, [DjVu][wp-djvu]) inside
  browser windows.
* A number of questionable practices, like <abbr title="Virtual Private
  Network">VPN</abbr> client software using a browser plug‑in for
  configuration.

[wp-silverlight]: https://en.wikipedia.org/wiki/Microsoft_Silverlight
[wp-flash]: https://en.wikipedia.org/wiki/Adobe_Flash_Player
[wp-javaplug]: https://en.wikipedia.org/wiki/Java_virtual_machine#JVM_in_the_web_browser
[wp-djvu]: https://en.wikipedia.org/wiki/DjVu#Role_in_the_software_ecosystem


## Why are NPAPI plug-ins being phased out?

The design of NPAPI  makes the web browser give full responsibility to
plug-ins: the browser has no control whatsoever over what plug-ins do to
display content, which makes it hard to make them participate in styling and
layout. More importantly, plug-ins are compiled, native code over which
browser developers cannot exercise quality control, which resulted in a
history of security incidents, crashes, and browser hangs.

Today, Web browsers' rendering engines can do a better job than plug-ins, more
securely and efficiently. The Web platform is mature and there is no place to
blindly trust third party code to behave well. NPAPI is a 25 years old
technology showing its age—it has served its purpose, but it is no longer
needed.

The last nail in the coffin was [Adobe's 2017 announcement that the Flash
plugin will be discontinued][adobe-flash-eol] in January 2021.

[adobe-flash-eol]: https://www.adobe.com/products/flashplayer/end-of-life.html

## What are other browsers doing?

Glad that you asked! It turns out that all major browsers have plans for
incrementally reducing how much of NPAPI usage they allow, until they
eventually remove it.

### Firefox

Let's take a look at [the Firefox roadmap][ff-plugin-roadmap] first:

<figure class="table">

| Version | Date | Plug-in support changes |
|:-------:|:----:|:------------------------|
| 47 | June 2016 | All plug-ins except Flash need the user to click on the element to activate them. |
| 52 | March 2017 | Only loads the Flash plug‑in by default. |
| 55 | August 2017 | Does not load the Flash plug‑in by default, instead it asks users to choose whether sites may use it. |
| 56 | September 2017 | On top of asking the user, Flash content can only be loaded from `http://` and `https://` URIs; the Android version completely removes plug‑in support. There is still an option to allow always running the Flash plug-in without asking. |
| 69 | September 2019 | The option to allow running the Flash plug-in without asking the user is gone. |
| 85 | January 2021 | Support for plug-ins is gone. |

<figcaption>Table: Firefox NPAPI plug-in roadmap.</figcaption>
</figure>

In conclusion, the Mozilla folks have been slowly [boiling the frog][wp-frog]
for the last four years and will completely remove the support for NPAPI
plug-ins coinciding with the Flash player reaching <abbr
title="End-Of-Life">EOL</abbr> status.

[ff-plugin-roadmap]: https://developer.mozilla.org/en-US/docs/Plugins/Roadmap
[wp-frog]: https://en.wikipedia.org/wiki/Boiling_frog#As_metaphor

### Chromium / Chrome

Here's a timeline of [the Chromium roadmap][cr-plugin-roadmap], merged with
some highlights from their [Flash Roadmap][cr-flash-roadmap]:

<figure class="table">

| Version | Date | Plug-in support changes |
|:-------:|:----:|:------------------------|
| ?  | Mid 2014 | The interface to unblock running plug-ins is made more complicated, to discourage usage. |
| ?  | January 2015 | Plug-ins blocked by default, some popular ones allowed. |
| 42 | April 2015 | Support for plug-ins disabled by default, setting available in `chrome://flags`. |
| 45 | September 2015 | Support for NPAPI plug-ins is removed. |
| 55 | December 2016 | Browser does not advertise Flash support to web content, the user is asked whether to run the plug-in for sites that really need it. |
| 76 | July 2019 | Flash support is disabled by default, can still be enabled with a setting. |
| 88 | January 2021 | Flash support is removed. |

<figcaption>Table: Chromium NPAPI/Flash plug-in roadmap.</figcaption>
</figure>

Note that Chromium continued supporting Flash content even when it already
removed support for NPAPI in 2015: by means of their acute <abbr
title="Not Invented Here">NIH</abbr> syndrome, Google came up with
[PPAPI][wp-ppapi], which replaced NPAPI and which was basically designed
to support Flash and is currently used by Chromium's built-in <abbr
title="Portable Document Format">PDF</abbr> viewer—which will go away
also coinciding with Flash being <abbr title="End-Of-Life">EOL</abbr>,
nevertheless.

[cr-plugin-roadmap]: http://www.chromium.org/developers/npapi-deprecation
[cr-flash-roadmap]: https://sites.google.com/a/chromium.org/dev/flash-roadmap
[wp-ppapi]: https://en.wikipedia.org/wiki/NPAPI#PPAPI

### Safari

On the Apple camp, the story is much easier to tell:

* Their handheld devices—iPhone, iPad, iPod Touch—never supported NPAPI
  plug-ins to begin with. Easy-peasy.
* On desktop, Safari has [required explicit approval][safari-user-interact]
  from the user to allow running plug-ins since June 2016. The Flash plug-in
  has not been preinstalled in Mac OS since 2010, requiring users to manually
  install it.
* NPAPI plug-in support will be [removed from WebKit by the end of
  2020][wk-npapi-removal].

[safari-user-interact]: https://webkit.org/blog/6589/next-steps-for-legacy-plug-ins/
[wk-npapi-removal]: https://lists.webkit.org/pipermail/webkit-dev/2020-January/031013.html


## Is WebKitGTK following suit?

[Yes][wk-gtk-npapi-removal]. In September 2019 WebKitGTK 2.26 removed support
for NPAPI plug-ins which use GTK2. This included Flash, but the PPAPI version
could still be used via [freshplayerplugin][pp-fresh].

In **March 2021**, when the next stable release series is due, **WebKitGTK
2.32 will remove the support for NPAPI plug-ins**. This series will receive
updates until September 2021.

The above gives a full two years since we started restricting which plug-ins
can be loaded before they stop working, which we reckon should be enough. At
the moment of writing this article, the support for plug-ins was [already
gone][wk-npapi-commit] from the WebKit source the GTK and WPE ports.

Yes, you read well, WPE supported NPAPI plug-ins, but in a limited fashion:
only windowless plug-ins worked. In practice, making NPAPI plug-ins work on
Unix-like systems required using the [XEmbed][xembed] protocol to allow them
to place their rendered content overlaid on top of WebKit's, but the WPE port
does not use X11. Provided that we never advertised nor officially supported
the NPAPI support in the WPE port, we do not expect any trouble removing it.

[wk-gtk-npapi-removal]: https://lists.webkit.org/pipermail/webkit-dev/2020-July/031298.html
[pp-fresh]: https://github.com/i-rinat/freshplayerplugin
[wkgtk230]: https://webkitgtk.org/2020/09/11/webkitgtk2.30.0-released.html
[wk-npapi-commit]: https://trac.webkit.org/changeset/265753
[xembed]: https://specifications.freedesktop.org/xembed-spec/xembed-spec-latest.html
