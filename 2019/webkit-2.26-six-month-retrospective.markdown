title: The Road to WebKit 2.26: a Six Month Retrospective
date: 2019-10-28 02:30:00
author: aperez
tags: igalia, webkit, wpe, floss


Now that version 2.26 of both [WPE WebKit][wpewebkit] and
[WebKitGTK][webkitgtk] ports have been out for a few weeks it is an excellent
moment to recap and take a look at what [we][] have achieved during this
development cycle. Let's dive in!

[we]: https://www.igalia.com/technology/browsers

<ol class="toc">
  <li>[New Features](#new-features)
    <ul>
    <li>[Emoji Picker](#emoji-picker)</li>
    <li>[Data Lists](#data-lists)</li>
    <li>[WPE Renderer for WebKitGTK](#wpe-renderer-for-webkitgtk)</li>
    <li>[In-Process DNS Cache](#in-process-dns-cache)</li>
    </ul>
  </li>
  <li>[Security](#security)
    <ul>
    <li>[Subprocess Sandboxing](#subprocess-sandboxing)</li>
    <li>[<abbr title="Process Swap On (cross-site) Navigation">PSON</abbr>](#-abbr-title-process-swap-on-cross-site-navigation-pson-abbr-)</li>
    <li>[<abbr title="HTTP Strict Transport Security">HSTS</abbr>](#-abbr-title-http-strict-transport-security-hsts-abbr-)</li>
   <li>[New WebSockets Implementation](#new-websockets-implementation)</li>
   </ul>
  <li>[Cleanups](#cleanups)</li>
  <li>[Releases, Releases!](#releases-releases-)
    <ul>
    <li>[Buildroot ♥ WebKit](#buildroot-webkit)</li>
    </ul>
  </li>
  <li>[Buildbot Maintenance](#buildbot-maintenance)</li>
  <li>[One More Thing](#one-more-thing)</li>
</ol>

## New Features

### Emoji Picker

The GTK emoji picker has been integrated in WebKitGTK, and can be accessed
with `Ctrl-Shift-;` while typing on input fields.

<figure class="image">
  <video autoplay loop muted playsinline width="472" height="396">
    <source src="/2019/ephy-emoji-picker.webm" type="video/webm">
    Your browser does not support WebM videos
    ([see an animated GIF instead](/2019/ephy-emoji-picker.gif)).
  </video>
  <figcaption>GNOME Web showing the GTK emoji picker.</figcaption>
</figure>

### Data Lists

WebKitGTK now supports the `<datalist>` HTML element ([reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist)),
which can be used to list possible values for an `<input>` field. Form fields
using data lists are rendered as an hybrid between a combo box and a text
entry with type–ahead filtering.

<figure class="image">
  <video autoplay loop muted playsinline width="472" height="396">
    <source src="/2019/ephy-datalist.webm" type="video/webm">
    Your browser does not support WebM videos
    ([see an animated GIF instead](/2019/ephy-datalist.gif)).
  </video>
  <figcaption>GNOME Web showing an `<input>` entry with completion backed by `<datalist>`.</figcaption>
</figure>

### WPE Renderer for WebKitGTK

The GTK port now supports reusing components from WPE. While there are no
user-visible changes, with many <abbr title="Graphics Processing
Unit">GPU</abbr> drivers a more efficient buffer sharing mechanism—which takes
advantage of [DMA-BUF][], if available—is used for accelerated compositing
under Wayland, resulting in better performance.

Packagers can disable this feature at build time passing
`-DUSE_WPE_RENDERER=OFF` to CMake, which could be needed for systems which
cannot provide the needed [libwpe][] and [WPEBackend-fdo][] libraries. It is
recommended to leave this build option enabled, and it might become mandatory
in the future.

[libwpe]: https://github.com/WebPlatformForEmbedded/libwpe
[WPEBackend-fdo]: https://github.com/Igalia/WPEBackend-fdo
[DMA-BUF]: https://lwn.net/Articles/474819/


### In-Process DNS Cache

Running a local DNS caching service avoids doing queries to your Internet
provider’s servers when applications need to resolve the same host names over
and over—something web browsers do! This results in faster browsing, saves
bandwidth, and partially compensates for slow DNS servers. 

[Patrick][tingping] and [Carlos][blog-carlosgc] have [implemented a small
cache][dnscache-patch] inside the Network Process which keeps in memory a
maximum of 400, valid for 60 seconds. Even though it may not seem like much,
this improves page loads because most of the time the resources needed to
render a page are spread across a handful of hosts and their cache entries
will be reused over and over.

<figure class="image">
  <img alt="Promotional image of the “Gone in 60 Seconds” movie." width="478" height="288"
       src="../images/poster-60s.png" srcset="../images/poster-60s@2x.png 2x">
  <figcaption>This image has nothing to do with DNS, except for the
     time entries are kept in the cache.</figcaption>
</figure>

While it is certainly possible to run a full-fledged DNS cache locally (like
[dnsmasq][] or [systemd-resolved][], which many GNU/Linux setups have
configured nowadays), WebKit can be used in all kinds of devices and operating
systems which may not provide such a service. The caching benefits all kinds
of systems, with embedded devices (where running an additional service is
often prohibitive) benefiting the most, and therefore it is always enabled by
default.

[dnsmasq]: http://www.thekelleys.org.uk/dnsmasq/doc.html
[systemd-resolved]: https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html
[tingping]: https://blog.tingping.se/
[dnscache-patch]: https://bugs.webkit.org/show_bug.cgi?id=196094


## Security

Remember [Meltdown and Spectre](https://meltdownattack.com/)? During this
development cycle we worked on mitigations against side channel attacks like
these. They are particularly important for a Web engine, which can download
and execute code from arbitrary servers.

### Subprocess Sandboxing

Both WebKitGTK and WPE WebKit follow a [multi-process
architecture](https://trac.webkit.org/wiki/WebKit2): at least there is the “UI
Process”, an application that embeds `WebKitWebView` widget; the “Web Process”
(`WebKitWebProcess`, `WPEWebProcess`) which performs the actual rendering, and
the “Network Process” (`WebKitNetworkProcess`, `WPENetworkProcess`) which
takes care of fetching content from the network and also manages caches and
storage.

[Patrick Griffis][tingping] has led the effort to add support in WebKit to
isolate the Web Process from the rest of the system, running it with
restricted access to the rest of the system.  This is achieved using [Linux
namespaces](https://en.wikipedia.org/wiki/Linux_namespaces)—the same
underlying building blocks used by containerization technologies like
[LXC](https://linuxcontainers.org/), Kubernetes, or
[Flatpak](https://flatpak.org/). As a matter of fact, we use the same building
blocks as Flatpak: [Bubblewrap](https://github.com/containers/bubblewrap),
[xdg-dbus-proxy](https://github.com/flatpak/xdg-dbus-proxy), and
[libseccomp](https://github.com/seccomp/libseccomp). This not only makes it
more difficult for a website to snoop on other processes' data: it also limits
potential damage to the rest of the system caused by maliciously crafted
content, because the Web Process is where most of which it is parsed and
processed.

This feature is built by default, and using it in applications is [only one
function call away](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitWebContext.html#webkit-web-context-set-sandbox-enabled).

### <abbr title="Process Swap On (cross-site) Navigation">PSON</abbr>

Process Swap On (cross-site) Navigation is a new feature which makes it
harder for websites to steal information from others: rendering of pages from
different sites always takes place in different processes. In practice, each
[security origin](https://wiki.mozilla.org/Security/Origin) uses a different
Web Process (see above) for rendering, and while navigating from one page to
another new processes will be launched or terminated as needed. Chromium's
[Site
Isolation](https://www.chromium.org/Home/chromium-security/site-isolation)
works in a similar way.

<!--
Trying to configure WebKit to use the [single Web process
mode](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitWebContext.html#WEBKIT-PROCESS-MODEL-SHARED-SECONDARY-PROCESS:CAPS)
will do nothing because multiple processes need to be always used due to the
nature of PSON. The corresponding public API has been deprecated accordingly.
-->

Unfortunately, the needed changes  ended up breaking a few important
applications which embed WebKitGTK (like [GNOME
Web](https://wiki.gnome.org/Apps/Web/) or
[Evolution](https://wiki.gnome.org/Apps/Evolution/)) and we had to disable the
feature for the GTK port just before its 2.26.0 release—it is still enabled in
WPE WebKit.

Our plan for the next development cycle is keep the feature disabled by
default, and to provide a way for applications to opt-in. Unfortunately it
cannot be done the other way around because the public WebKitGTK API has
been stable for a long time and we cannot afford breaking backwards
compatibility.

### <abbr title="HTTP Strict Transport Security">HSTS</abbr>

This security mechanism helps protect websites against [protocol downgrade
attacks](https://en.wikipedia.org/wiki/Protocol_downgrade_attack): Web servers
can declare that clients must interact using only secure HTTPS connections,
and never revert to using unencrypted HTTP.

During the last few months [Claudio Saavedra][csaavedra] has completed the
support for [HTTP Strict Transport Security][wiki-hsts] in
[libsoup][libsoup]—our networking backend—and the needed support code in
WebKit. As a result, HSTS support is always enabled.

### New WebSockets Implementation

The WebKit source tree includes a cross-platform [WebSockets][websocket]
implementation that the GTK and WPE ports have been using. While great for new
ports to be able to support the feature, it is far from optimal: we were
duplicating network code because [libsoup][libsoup] *also* implements them.

Now that [<abbr title="HTTP Strict Transport Security">HSTS</abbr>](#hsts)
support is in place, [Claudio][csaavedra] and [Carlos][blog-carlosgc] decided
that it was a good moment to switch libsoup's implementation so WebSockets can
now also benefit from it. This also made possible to provide the
[RFC-7692](https://tools.ietf.org/html/rfc7692) `permessage-deflate` extension,
which enables applications to request compression of message payloads.

To ensure that no regressions would be introduced, Claudio also added support
in libsoup for running the [Autobahn 🛣 test suite](https://github.com/crossbario/autobahn-testsuite),
which resulted in a number of fixes.


## Cleanups

During this release cycle we have deprecated the single Web Process mode, and
trying to enable it [using the
API](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitWebContext.html#webkit-web-context-set-process-model)
is a no-op. The motivation for this is twofold: in the same vein of
[PSON](#-abbr-title-process-swap-on-cross-site-navigation-pson-abbr-) and
[sanboxing](#subprocess-sanboxing), we would rather not allow applications to
make side channel attacks easier; not to mention that the changes needed in
the code to accommodate PSON would make it extremely complicated to keep the
existing API semantics. As this can potentially be trouble for some
applications, we have been [in touch with
packagers](https://mail.gnome.org/archives/distributor-list/2019-October/msg00000.html),
supporting them as best as we can to ensure that the new WebKitGTK versions
can be adopted without regressions.

Another important removal was the support for GTK2 NPAPI browser plug-ins.
Note that NPAPI plug-ins *are still supported*, but if they use GTK they must
use version 3.x—otherwise they will not be loaded. The reason for this is that
GTK2 cannot be used in a program which uses GTK3, and vice versa. To
circumvent this limitation, in previous releases we were building some parts
of the WebKit source code *twice*, each one using a different version of GTK,
resulting in two separate binaries: we have only removed the GTK2 one. This
allowed for a good clean up of the source tree, reduced build times, and
killed one build dependency. With NPAPI support [being sunsetted in all
browsers](https://en.wikipedia.org/wiki/NPAPI#Support/deprecation), the main
reason to keep some degree of support for it is the Flash plug-in. Sadly its
NPAPI version uses GTK2 and it *does not* work starting with WebKitGTK 2.26.0;
on the other hand, it is still possible to run the PPAPI version of Flash
through [FreshPlayerPlugin](https://github.com/i-rinat/freshplayerplugin) if
needed.


## Releases, Releases!

Last March we released [WebKitGTK 2.24][webkitgtk-224] and [WPE WebKit
2.24][wpewebkit-224] in sync, and the same for the current stable, 2.26. As a
matter of fact, most releases since 2.22 have been done in lockstep and this
has been working extremely well.

<figure class="image">
  ![](/images/a-team-plan.png)
  <figcaption>Hannibal Smith, happy about the simultaneous releases.</figcaption>
</figure>

Both ports share many of their components, so it makes sense to stabilize and
prepare them for a new release series at the same time. Many fixes apply to
both ports, and the few that not hardly add noise to the branch. This allows
myself and [Carlos García][blog-carlosgc] to split the effort of [backporting
fixes](https://trac.webkit.org/wiki/WebKitGTK/2.24.x) to the stable branch as
well—though I must admit that Carlos has often done more.


### Buildroot ♥ WebKit

Those using [Buildroot][] to prepare software images for various devices will
be happy to know that packages for the WPE WebKit components have been
imported a while ago into the source tree, and have been available since the
[2019.05
release](http://lists.busybox.net/pipermail/buildroot/2019-June/251548.html).

Two years ago I dusted off the `webkitgtk` package, bringing it up to the most
recent version at the time, keeping up with updates and over time I have been
taking care of some of its dependencies (`libepoxy`, `brotli`, and `woff2`) as
well. Buildroot <abbr title="Long-Term Support">LTS</abbr> releases are now
receiving security updates, too.

Last February I had a great time meeting some of the Buildroot developers
during [FOSDEM](https://archive.fosdem.org/2019/), where we had the chance of
discussing in person how to go about adding WPE WebKit packages to Buildroot.
This ultimately resulted in the addition of packages `libwpe`,
`wpebackend-fdo`, `wpebackend-fdo`, and `cog` to the tree.

My plan is to keep maintaining the Buildroot packages for both WebKit ports. I
have also a few improvements in the pipeline, like enabling the sandboxing
support (see this [patch
set](https://patchwork.ozlabs.org/project/buildroot/list/?series=131783)) and
usage of the WPE renderer in the WebKitGTK package.


[webkitgtk-224]: https://webkitgtk.org/2019/03/13/webkitgtk2.24.0-released.html 
[wpewebkit-224]: https://wpewebkit.org/release/wpewebkit-2.24.0.html
[blog-carlosgc]: https://blogs.igalia.com/carlosgc/
[blog-mcatanzaro]: https://blogs.gnome.org/mcatanzaro/
[WebKitGTK]: https://webkitgtk.org
[WPE WebKit]: https://wpewebkit.org
[Buildroot]: https://buildroot.org


## Buildbot Maintenance

Breaking the Web is not fun, so WebKit needs extensive testing. The source
tree includes tens of thousands of tests which are used to avoid regressions,
and those are ran on every commit using [Buildbot][]. The status can be
checked at [build.webkit.org](https://build.webkit.org).

Additionally, there is *another* set of builders which run *before* a patch
has had the chance of being committed to the repository. The goal is to catch
build failures and certain kinds of programmer errors as early as possible,
ensuring that the source tree is kept “green”—that is: buildable. This is the
<abbr title="Early Warning System">EWS</abbr>, short for [Early Warning
System](https://trac.webkit.org/wiki/EarlyWarningSystem), which trawls
Bugzilla for new—or updated—patches, schedules builds with them applied, and
adds a set of status bubbles in Bugzilla next to them. Igalia also
contributes with EWS builders

<figure class="image">
  <img alt="EWS bot bubbles as shown in Bugzilla" width="358" height="42"
       src="ews-bubbles@1x.png" srcset="ews-bubbles@2x.png 2x">
  <figcaption>For each platform the EWS adds a status bubble after trying a patch.</figcaption>
</figure>

[Since last April][new-ews-ml] there is an ongoing effort to revamp the EWS
infrastructure, which is now using Buildbot as well. [Carlos
López][blog-clopez] has updated our machines recently to [Debian
Buster][deb-buster], then I switched them to the new EWS at
[ews-build.webkit.org](https://ews-build.webkit.org). This is based on
[Buildbot][] as well, which brings niceties in the user interface like being
able to check the status [for the
GTK](https://ews-build.webkit.org/#/builders/4) and [for the WPE WebKit
port](https://ews-build.webkit.org/#/builders/8) conveniently in realtime.
Most importantly, this change has brought the average build time from thirteen
minutes down to eight, making the “upload patch, check EWS build status” cycle
shorter for developers.

Big props to Aakash Jain, who has been championing all the EWS improvements.


[csaavedra]: https://people.gnome.org/~csaavedra/
[Buildbot]: https://buildbot.org
[new-ews-ml]: http://mac-os-forge.2317878.n4.nabble.com/Introducing-brand-new-EWS-td376471.html
[blog-clopez]: http://blog.neutrino.es/
[deb-buster]: https://www.debian.org/News/2019/20190706
[libsoup]: https://gitlab.gnome.org/GNOME/libsoup/
[webkitgtk]: https://webkitgtk.org
[wpewebkit]: https://wpewebkit.org
[wiki-hsts]: https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security
[websocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket

## One More Thing

Finally, I would like to extend our thanks to everybody who has contributed to
WebKit during the 2.26 development cycle, and in particular to the Igalia
Multimedia team, who have been [hard at
work](https://base-art.net/Articles/review-of-the-igalia-multimedia-team-activities-2019h1/)
improving our WebRTC support and the GStreamer back-end 🙇.
