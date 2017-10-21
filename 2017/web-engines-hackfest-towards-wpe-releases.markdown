title: Web Engines Hackfest, 2017 Edition
date: 2017-10-21 01:30:00
author: aperez
tags: igalia, webkit, wpe, floss, hackfest, webkitgtk, wpe


At the beginning of October I had the wonderful chance of attending the [Web
Engines Hackfest](https://webengineshackfest.org/) in A Coruña, hosted by
[Igalia](https://www.igalia.com). This year we were over 50 participants, which
was great to associate even more faces to IRC nick names, but more importantly
allows hackers working at all the levels of the Web stack to share a common
space for a few days, making it possible to discuss complex topics and figure
out the future of the projects which allow humanity to see pictures of cute
kittens — among many other things.

<figure class="image">
  ![](//perezdecastro.org/2017/web-kitten.jpg)
  <figcaption>Mandatory fluff ([CC-BY-NC](https://www.flickr.com/photos/nwater/6781786068)).</figcaption>
</figure>


During the hackfest I worked mostly on three things:

-   Preparing the code of the WPE WebKit port to start making *preview* releases.

-   A patch set which adds WPE packages to [Buildroot](https://buildroot.org/).

-   Enabling support for the CSS generic system font family.

**Fun trivia:** Most of the [WebKit](https://webkit.org) contributors work from
the United States, so the week of the Web Engines hackfest is probably the only
single moment during the whole year that there is a sizeable peak of activity
in European day times.

<figure class="image">
  ![](//perezdecastro.org/images/glasses-scrolling-reflection.gif)
  <figcaption>Watching repository activity during the hackfest.</figcaption>
</figure>


Towards WPE Releases
--------------------

At Igalia we are making an important investment in the [WPE WebKit
port](http://trac.webkit.org/wiki/WPE), which is specially targeted towards
embedded devices. An important milestone for the project was reached last May
when the [code was moved to main WebKit
repository](https://bugs.webkit.org/show_bug.cgi?id=171110), and has been
receiving the usual stream of improvements and bug fixes. We are now
approaching the moment where we feel that is is ready to start making releases,
which is another major milestone.

Our plan for the WPE is to synchronize with
[WebKitGTK+](https://webkitgtk.org), and produce releases for both in
parallel.  This is important because both ports share a good amount of their
code and base dependencies (GStreamer, GLib, `libsoup`) and our efforts to
stabilize the GTK+ port before each release will benefit the WPE one as well,
and vice versa.  In the coming weeks we will be publishing the first official
tarball starting off the [WebKitGTK+ 2.18.x stable
branch](https://trac.webkit.org/wiki/WebKitGTK/2.18.x).

<figure style="text-align:center">
  ![](//perezdecastro.org/images/wild-webkit-port-appears.png)
  <figcaption>Wild WEBKIT PORT appeared!</figcaption>
</figure>

Syncing the releases for both ports means that:

-   Both stable and unstable releases are done in sync with the [GNOME
    release schedule](https://wiki.gnome.org/ReleasePlanning). Unstable
    releases start at version `X.Y.1`, with `Y` being an odd number.

-   About one month before the release dates, we create a new release branch 
    and from there on we work on stabilizing the code. At least one testing
    release with with version `X.Y.90` will be made. This is also what GNOME
    does, and we will mimic this to avoid confusion for downstream packagers.
 
-   The stable release will have version `X.Y+1.0`. Further maintenance
    releases happen from the release branch as needed. At the same time,
    a new cycle of unstable releases is started based on the code from the
    tip of the repository.

Believe it or not, preparing a codebase for its first releases involves quite
a lot of work, and this is what took most of my coding time during the Web
Engines Hackfest and also the following weeks: from [small
fixes](https://bugs.webkit.org/show_bug.cgi?id=178081) [for build
failures](https://bugs.webkit.org/show_bug.cgi?id=178090) all the way to making
sure that public API headers ([only the correct
ones!](https://bugs.webkit.org/show_bug.cgi?id=178125)) [are
installed](https://bugs.webkit.org/show_bug.cgi?id=176448) [and
usable](https://bugs.webkit.org/show_bug.cgi?id=178104), that applications can
be [properly linked](https://bugs.webkit.org/show_bug.cgi?id=178133), and that
[release tarballs can actually be
created](https://bugs.webkit.org/show_bug.cgi?id=176448). Exhausting? Well, do
not forget that we need to set up a web server to host the tarballs, a small
website, and the documentation. The latter has to be generated (there is still
pending work in this regard), and the whole process of making a release
scripted.

Still with me? Great. Now for a plot twist: we won't be making
proper releases *just yet*.


### APIs, ABIs, and Releases

There is one topic which I did not touch yet: API/ABI stability. Having done
a release implies that the public API and ABI which are part of it are stable,
and they are *not* subject to change.

Right after upstreaming WPE we switched over from the cross-port WebKit2 C API
and added a new, GLib-based API to WPE. It is remarkably similar (if not the
same in many cases) to the API exposed by WebKitGTK+, and this makes us
confident that the new API is higher-level, more ergonomic, and better overall.
At the same time, we would like third party developers to give it a try (which
is easier having releases) while retaining the possibility of getting feedback
and improving the WPE GLib API before setting it on stone (which is not
possible after a release).

It is for this reason that *at least* during the first WPE release cycle we
will make **preview releases**, meaning that **there might be API and ABI
changes** from one release to the next. As usual we will *not* be making
breaking changes in between releases of the same stable series, i.e. code
written for `2.18.0` will continue to build unchanged with any subsequent
`2.18.X` release.


At any rate, we do *not* expect the API to receive big changes because —as
explained above— it mimics the one for WebKitGTK+, which has already proven
itself both powerful enough for complex applications and convenient to use for
the simpler ones. Due to this, I encourage developers to try out WPE as soon
as we have the first preview release fresh out of the oven.


### Packaging for Buildroot

At Igalia we routinely work with embedded devices, and often we make use of
[Buildroot](https://buildroot.org) for cross-compilation. Having actual
releases of WPE will allow us to contribute a set of build definitions for the
WPE WebKit port and its dependencies — something that I have already started
working on.

Lately I have been taking care of keeping the WebKitGTK+ packaging for
Buildroot up-to-date and it has been delightful to work with such a welcoming
community. I am looking forward to having WPE supported there, and to keep
maintaining the build definitions for both. This will allow making use of WPE
with relative ease, while ensuring that Buildroot users will pick our updates
promptly.


Generic System Font
-------------------

Some applications like [<s>GNOME Web</s>
Epiphany](https://wiki.gnome.org/Apps/Web/) use a `WebKitWebView` to display
widget-like controls which try to follow the design of the rest of the desktop.
Unfortunately for GNOME applications this means
[Cantarell](https://en.wikipedia.org/wiki/Cantarell_(typeface) gets hardcoded
in the style sheet —it is the default font after all— and this results in
mismatched fonts when the user has chosen a different font for the interface
(e.g. in [Tweaks](https://wiki.gnome.org/Apps/GnomeTweakTool)). You can see
this in the following screen capture of Epiphany:

<figure class="rollover" style="text-align:center">
  ![](//perezdecastro.org/2017/ephy-cantarell.png)
  ![](//perezdecastro.org/2017/ephy-system-font.png)
  <figcaption>Web using hardcoded Cantarell and (on hover) `-webkit-system-font`.</figcaption>
</figure>

Here I have configured the beautiful [Inter UI](https://rsms.me/inter/) font as
the default for the desktop user interface. Now, if you roll your mouse over
the image, you will see how *much better* it looks to use a consistent font.
This change also affects the list of plugins and applications, error messages,
and in general all the `about:` pages.

If you are running GNOME 3.26, this is [already
fixed](https://bugzilla.gnome.org/show_bug.cgi?id=783489) using `font: menu`
([part of the CSS
spec](https://www.w3.org/TR/2011/REC-CSS2-20110607/fonts.html#font-shorthand)
since ye olde CSS 2.1) — but we can do better: Safari has [had support since
2015](https://webkit.org/blog/3709/using-the-system-font-in-web-content/),
for a generic “system” font family, similar to `sans-serif` or `cursive`:

```css
/* Using the new generic font family (nice!). */
body {
    font-family: -webkit-system-font;
}

/* Using CSS 2.1 font shorthands (not so nice). */
body {
    font: menu;       /* Pick ALL font attributes... */
    font-size: 12pt;  /* ...then reset some of them. */
    font-weight: 400;
}
```

During the hackfest I [implemented the needed moving parts in
WebKitGTK+](https://trac.webkit.org/changeset/222800) by querying the
`GtkSettings::gtk-font-name` property. This can be [used in HTML content shown
in Epiphany as part of the
UI](https://bugzilla.gnome.org/show_bug.cgi?id=789119), and to [make the Web
Inspector use the system font](https://bugs.webkit.org/show_bug.cgi?id=178388)
as well.

<figure class="image">
  <a href="//perezdecastro.org/2017/minibrowser-inspector-cantarell.png">![](/2017/minibrowser-inspector-cantarell-small.png)</a>
  <figcaption>Web Inspector using Cantarell, the default GNOME 3 font
    ([full size](minibrowser-inspector-cantarell.png)).</figcaption>
</figure>

I am convinced that users *do* notice and appreciate attention to detail,
even if they do unconsciously, and therefore it is worthwhile to work on this
kind of improvements.
Plus, as a design enthusiast with a slight case of typographic
<abbr title="Obsessive-Compulsive Disorder">OCD</abbr>, I cannot stop myself
from noticing inconsistent usage of fonts and my mind is now at ease knowing
that opening the Web Inspector won't be such a jarring experience anymore.


Outro
-----

But there's one more thing: On occasion we developers have to debug situations
in which a process is seemingly stuck. One useful technique involves running
the offending process under the control of a debugger (or, in an embedded
device, under `gdbserver` and controlled remotely), interrupting its execution
at intervals, and printing stack traces to try and figure out what is going on.
Unfortunately, in some circumstances running a debugger can be difficult or
impractical. Wouldn't it be grand if it was possible to *interrupt* the process
without needing a debugger and *request* a stack trace? Enter “Out-Of-Band
Stack Traces” ([proof of
concept](https://gist.github.com/aperezdc/30ad0bcca02301312a290cfee5c476e9)):

1.  The process installs a signal handler using
    [sigaction(7)](https://linux.die.net/man/2/sigaction), with the
    `SA_SIGINFO` flag set.

2.  On reception of the signal, the kernel interrupts the process (even if it's
    in an infinite loop), and invokes the signal handler passing an extra
    pointer to an `ucontext_t` value, which contains a snapshot of the execution
    status of the thread *which was in the CPU before the signal handler was
    invoked*. This is true for many platform including Linux and most BSDs.

3.  The signal handler code can get obtain the instruction and stack pointers
    from the `ucontext_t` value, and walk the stack to produce a stack trace
    of the code that was being executed. Jackpot! This is of course
    architecture dependent but not difficult to get right (and well tested)
    for the most common ones like x86 and ARM.

The nice thing about this approach is that the code that obtains the stack
trace is built into the program (no rebuilds needed), and it does *not* even
require to relaunch the process in a debugger — which can be crucial for
analyzing situations which are hard to reproduce, or which do not happen
when running inside a debugger. I am looking forward to have some time to
integrate this properly into WebKitGTK+ and specially WPE, because it will
be most useful in embedded devices.


