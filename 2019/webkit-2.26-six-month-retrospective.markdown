title: The Road to WebKit 2.26: a Six Month Retrospective
date: 2019-10-01 14:00:00
author: aperez
tags: igalia, webkit, wpe, floss


Now that version 2.26 of both the [WPE WebKit][wpewebkit] and
[WebKitGTK][webkitgtk] ports have been out for a few weeks it is an excellent
moment to recap and take a look at what we have achieved during this
development cycle. Let's dive in!
 
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

Patrick Griffis has led the effort to add support in WebKit to isolate the Web
Process and Network Process from the rest of the system, and running them with
restricted access to the rest of the system. This is achieved using [Linux
namespaces](https://en.wikipedia.org/wiki/Linux_namespaces)—the same
underlying building blocks used by containerization technologies like
[LXC](https://linuxcontainers.org/), Kubernetes, or
[Flatpak](https://flatpak.org/). As a matter of fact, we use the same building
blocks as Flatpak: [Bubblewrap](https://github.com/containers/bubblewrap),
[xdg-dbus-proxy](https://github.com/flatpak/xdg-dbus-proxy), and
[libseccomp](https://github.com/seccomp/libseccomp).

This feature is built by default, and using it in applications is [only one
function call away](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitWebContext.html#webkit-web-context-set-sandbox-enabled).

### <abbr title="Process Switch On (cross-site) Navigation">PSON</abbr>

Process Switch On (cross-site) Navigation is a new feature which makes it it
harder for websites to steal information from others: rendering of pages from
different sites always takes place in different processes. In practice, each
[security origin](https://wiki.mozilla.org/Security/Origin) uses a different
Web Process (see above) for rendering, and while navigating from one page to
another new processes will be launched or terminated as needed. Chromium's
[Site
Isolation](https://www.chromium.org/Home/chromium-security/site-isolation)
works in a similar way.

Trying to configure WebKit to use the [single Web process
mode](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitWebContext.html#WEBKIT-PROCESS-MODEL-SHARED-SECONDARY-PROCESS:CAPS)
will do nothing because multiple processes need to be always used due to
the nature of PSON. The corresponding public API has been deprecated
accordingly.

Unfortunately, the changes needed ended up breaking a few important
applications which embed WebKitGTK (like
[Evolution](https://wiki.gnome.org/Apps/Evolution/)) and we had to disable
the feature for the GTK port—it is still enabled in WPE WebKit. Our plan
is to re-enable it for the GTK port during the next development cycle.

### <abbr title="HTTP Strict Transport Security">HSTS</abbr>

This security mechanism helps protect websites against [protocol downgrade
attacks](https://en.wikipedia.org/wiki/Protocol_downgrade_attack): Web servers
can declare that clients must interact using only secure HTTPS connections,
and never revert to using unencrypted HTTP.

During the last few months [Claudio Saavedra][csaavedra] has completed the
support for [HTTP Strict Transport Security][wiki-hsts] in
[libsoup][libsoup]—our networking backend—and the needed support code in
WebKit. HSTS support is always enabled.

### New WebSockets Implementation

The WebKit source tree includes a cross-platform [WebSockets][websocket]
implementation that the GTK and WPE ports have been using. While great for new
ports to be able to support the feature, it is far from optimal: we were
duplicating network code because [libsoup][libsoup] *also* implements them.

Now that [<abbr title="HTTP Strict Transport Security">HSTS</abbr>](#hsts)
support was added, [Claudio][csaavedra] and [Carlos][blog-carlosgc] decided
that it was a good moment to switch libsoup's implementation so WebSockets can
now also benefit from it. This also made it possible to provide the
[RFC-7692](https://tools.ietf.org/html/rfc7692) `permessage-deflate` extension,
which allows applications to request compression of message payloads.

To ensure that no regressions would be introduced, Claudio also added support
in libsoup for running the [Autobahn 🛣 test suite](https://github.com/crossbario/autobahn-testsuite),
which resulted in in a number of fixes.


## Releases, Releases!

This March we released [WebKitGTK 2.24][webkitgtk-224] and [WPE WebKit
2.24][wpewebkit-224] in sync, and the same for the current stable, 2.26. As a
matter of fact, most releases since 2.22 have been done in lockstep
and this has been working extremely well.

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

Improved emoji support, content filters, variable fonts, support for JPEG2000
images, mouse gestures, better WebDriver support… the list of new and improved
features in the current 2.24 stable releases is astounding. I recommend
reading [Michael][blog-mcatanzaro]'s
[writeup focused on WebKitGTK](https://blogs.gnome.org/mcatanzaro/2019/03/27/epiphany-3-32-and-webkitgtk-2-24/)
and [my follow-up article](/2019/wpe-webkit-2.24.html) which complements it
from the point of view of the WPE WebKit port.


[webkitgtk-224]: https://webkitgtk.org/2019/03/13/webkitgtk2.24.0-released.html 
[wpewebkit-224]: https://wpewebkit.org/release/wpewebkit-2.24.0.html
[blog-carlosgc]: https://blogs.igalia.com/carlosgc/
[blog-mcatanzaro]: https://blogs.gnome.org/mcatanzaro/
[WebKitGTK]: https://webkitgtk.org
[WPE WebKit]: https://wpewebkit.org


## Buildbot Maintenance

Breaking the Web is not fun, so WebKit needs extensive testing. The source
tree includes tens of thousands of tests which are used to avoid regressions,
and those are run on every commit using [Buildbot][]. The status can be
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
       src="ews-bubles.png" srcset="ews-bubbles@2x.png 2x">
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
