title: WPE WebKit 2.24
date: 2019-05-21 21:00:00
author: aperez
tags: igalia, webkit, wpe, floss

While WPE WebKit 2.24 [has now been out for a couple of
months](https://wpewebkit.org/release/wpewebkit-2.24.0.html), it includes over
a year of development effort since our [first official
release](https://wpewebkit.org/release/wpe-2.19-93.html), which means there
is plenty to talk about. Let's dive in!

## API & ABI Stability

The public API for WPE WebKit has been essentially unchanged since the 2.22.x
releases, and we consider it now stable and its version has been set to `1.0`.
The `pkg-config` modules for the main components have been updated accordingly
and are now named `wpe-1.0` (for
[libwpe](https://github.com/WebPlatformForEmbedded/libwpe)),
`wpebackend-fdo-1.0` (the [FDO
backend](https://github.com/Igalia/WPEBackend-fdo)), and `wpe-webkit-1.0` (WPE
WebKit itself).

Our plan for the foreseeable future is to keep the WPE WebKit API
backwards-compatible in the upcoming feature releases. On the other hand,
the ABI *might* change, but will be kept compatible if possible, on a
best-effort basis.

Both API and ABI are always guaranteed to remain compatible inside the same
*stable* release series, and we are trying to follow a strict “no regressions
allowed” policy for patch releases.  We have added [a page in the Web
site](https://wpewebkit.org/release/schedule) which summarizes the WPE WebKit
release schedule and this API/ABI stability guarantee.

This should allow distributors to always ship the latest available point
release in a stable series. This is something we always strongly recommend
because almost always they include fixes for security vulnerabilities.


## Security

Web engines are security-critical software components, on which users rely
every day for visualizing and manipulating sensitive information like personal
data, medical records, or banking information—to name a few. Having regular
releases means that we are able to publish periodical [security
advisories](https://wpewebkit.org/security/) detailing the vulnerabilities
fixed by them.

As WPE WebKit and [WebKitGTK](https://webkitgtk.org) share a number of
components with each other, advisories and the releases containing the
corresponding fixes are published in sync, typically on the same day.

The team takes security seriously, and we are always happy to receive notice
of security bugs. We ask reporters to act responsibly and observe the [WebKit
security policy](https://webkit.org/security-policy/) for guidance.


## Content Filtering

This new feature provides access to the WebKit internal content filtering
engine, also used by [Safari content
blockers](https://webkit.org/blog/3476/content-blockers-first-look/). The
implementation is quite interesting: filtering rule sets are written as JSON
documents, which are parsed and compiled to a compact bytecode representation,
and a tiny virtual machine which executes it for every resource load. This way
deciding whether a resource load should be blocked adds very little overhead,
at the cost of a (potentially) slow initial compilation. To give you an idea:
converting the popular [EasyList](https://easylist.to/) rules to JSON results
in a ~15 MiB file that can take up to three seconds to compile on ARM
processors typically used in embedded devices.

In order to penalize application startup as little as possible, the new APIs
are fully asynchronous and compilation is offloaded to a worker thread. On top
of that, compiled rule sets are cached on disk to be reused across different
runs of the same application (see
[WebKitUserContentFilterStore](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitUserContentFilterStore.html)
for details). Last but not least, the compiled bytecode is mapped on memory
and shared among all the processes which need it: a browser with many tabs
opened will practically use the same amount of memory for content filtering
than one with a single Web page loaded. The implementation is shared by the
GTK and WPE WebKit ports.

I had been interested in implementing support for content filtering even
before the WPE WebKit port existed, with the goal of replacing the ad blocker
in [GNOME Web](https://wiki.gnome.org/Apps/Web/). Some of the code had been
laying around in a branch since the 2016 edition of the [Web Engines
Hackfest](https://webengineshackfest.org/), it moved from my old laptop to the
current one, and I worked on it on-and-off while the
[different](https://bugs.webkit.org/show_bug.cgi?id=192714)
[patches](https://bugs.webkit.org/show_bug.cgi?id=192855)
[needed](https://bugs.webkit.org/show_bug.cgi?id=193622) to [make
it](https://bugs.webkit.org/show_bug.cgi?id=167941)
[work](https://bugs.webkit.org/show_bug.cgi?id=154553) slowly landed in the
WebKit repository—one of the patches went through as many as seventeen
revisions! At the moment I am *still* working on replacing the ad blocker in
Web—on my free time—which I expect will be ready for GNOME 3.34.


## It's All Text!

No matter how much the has evolved over the years, almost every Web site out
there still *needs* textual content. This is one department where 2.24.x shines:
text rendering.

[Carlos García](https://blogs.igalia.com/carlosgc/) has been our typography
hero during the development cycle: he single-handedly implemented support for
[variable fonts](https://typographica.org/on-typography/variable-fonts/)
([demo](https://v-fonts.com/)), fixed our support for composite emoji (like
🧟‍♀️, composed of the glyphs “woman” and “zombie”), and improved the
typeface selection algorithm to prefer coloured fonts for emoji.
Additionally, many other subtle issues have been fixed, and the latest two
patch releases include important fixes for text rendering.

<em>**Tip**: WPE WebKit uses locally installed fonts as fallback.
You may want to install at least one coloured font like
[Twemoji](https://github.com/eosrei/twemoji-color-font), which will
ensure emoji glyphs can always be displayed.</em>


## API Ergonomics

GLib 2.44 added a nifty feature [back in
2015](https://blogs.gnome.org/desrt/2015/01/30/g_autoptr/): automatic cleanup
of variables when they go out of scope using `g_auto`, `g_autofree`, and
`g_autoptr`.

We have added the needed bits in the headers to allow their usage with the
types from the WPE WebKit API. This enables developers to write code less
likely to introduce accidental memory leaks because they do not need to
remember freeing resources manually:

```c
WebKitWebView* create_view (void)
{
    g_autoptr(WebKitWebContext) ctx = webkit_web_context_new ();
    /*
     * Configure "ctx" to your liking here. At the end of the scope (this
     * function), a g_object_unref(ctx) call will be automatically done.
     */
    return webkit_web_view_new_with_context (ctx);
}
```

Note that this does not change the API (nor the ABI). You will need to
build your applications with GCC or Clang to make use of this feature.


## “Featurism” and “Embeddability”

Look at that, I just coined two new “technobabble” terms!

There are many other improvements which are shipping *right now* in WPE
WebKit. The following list highlights the main user and developer visible
features that can be found in the 2.24.x versions:

- A new `GObject` based API for JavaScriptCore.
- A fairly complete [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver)
  implementation. There is a [patch for supporting WPE WebKit in
  Selenium](https://github.com/SeleniumHQ/selenium/pull/6375)
  pending to be integrated. Feel free to vote 👍 for it to be merged.
- [WPEQt](https://base-art.net/Articles/introducing-wpeqt-a-wpe-api-for-qt5/),
  which provides an idiomatic API similar to that of
  [QWebView](https://doc.qt.io/qt-5/qml-qtwebview-webview.html) and
  allows embedding WPE WebKit as a widget in Qt/QML applications.
- Support for the JPEG2000 image format. Michael Catanzaro has written
  about the reasoning behind this in [his write-up about WebKitGTK
  2.24](https://blogs.gnome.org/mcatanzaro/2019/03/27/epiphany-3-32-and-webkitgtk-2-24/).
- Allow configuring the background of the `WebKitWebView` widget. Translucent
  backgrounds work as expected, which allows for novel applications like
  [overlaying Web content on top of video streams](https://base-art.net/Articles/web-overlay-in-gstreamer-with-wpewebkit/).
- An opt-in 16bpp rendering mode, which can be faster in some cases—remember
  to measure and profile in your target hardware! For now this only works with
  the RGB565 pixel format, which is the most common one used in embedded
  devices where 24bpp and 32bpp modes are not available.
- Support for [hole-punching using external media players](https://blogs.igalia.com/magomez/2019/02/26/hole-punching-in-wpe/).
  Note that at the moment there is no public API for this and you will need
  to patch the WPE WebKit code to plug your playback engine.

Despite all the improvements and features, still the main focus of WPE WebKit
is providing an *embeddable* Web engine. Fear not: new features either are
opt-in (e.g. 16bpp rendering), or disabled by default and add no overhead
unless enabled (WebDriver, background color), or have no measurable impact at
all (`g_autoptr`). Not to mention that many features can be even disabled at
build time, bringing to the table smaller binaries and runtime footprint—but
that would be a topic for another day.
