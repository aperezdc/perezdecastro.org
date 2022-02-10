Title: GGTraybar: Simple panel with GNOME global menu
Date: 2010-09-30 17:11
Author: aperez
Category: Igalia
Tags: c, gnome, gtk, openbox, pkg

Lately I have been [doing again][] [some][] [C coding][] so I thought it
was about time to do something I wanted since the first time I knew
about [GNOME Global Menu][]: a very simple, no-frills panel (like
[Fbpanel][], but even simpler) with support for Global Menu. The idea
was to not needing the GNOME panel for having Global Menu when using
[OpenBox][], my window manager of choice.

Judging from what applets I use regularly in the GNOME panel, I
determined that the bare minimum I need is:

-   The Global Menu thing.
-   Desktop pager.
-   System tray. Definitely.
-   A clock, with a calendar pop-up (I use that *a lot*!)

So, that is exactly what [GGTraybar][] (or GGT, short forms of “GNOME
Global Menu Tray bar”) provides. The thing is as simple as possible, so
it is not even configurable at this point, it will always position
itself in the top edge of the screen and use a hardcoded layout which is
comfortable for *me*. I know people likes screenshots, so here we go:

There are a couple additional features throwed in. First one:
by tapping “Alt-F2” a built-in command line will replace the part of the
panel used by the global menu to launch commands from there.
Intentionally, the hotkey is the same as for the GNOME panel run dialog
;-). I had the idea of adding this because I have been using [gmrun][]
for ages so I thought it would be nice to have a launcher in the panel
without needing an external tool. For the moment it does just run
commands, without completion nor history. At some point I would like to
take [GtkEntryCompletion][] for a spin and implement that, though. The
other hidden feature is that changing monitor layout (e.g. via
[RandR][]) will “just work” and the panel will relocate and resize
itself following the geometry of the primary monitor.

Even when I coded this in a hurry (\~10 hours in total) I am pretty
satisfied with the result and it is stable enough to it in a daily
basis. Actually, I am using [DMon][] to launch it, so it gets respawned
when something goes wrong. The fact that it was a quick hack is because
I tried to reuse as much as possible:

-   The Global Menu widget is included, ready-to-use, in
    `libglobalmenu-server.`
-   The sexy pager is a widget included in `libwnck`, and it is the same
    as used by the GNOME panel pager applet.
-   I picked the `EggTrayManager` class from Fbpanel, and fixed it to
    build without deprecated symbols and `-DGSEAL_ENABLE`.
-   [GtkHotkey][] is used for key bindings. It is a nice finding.

What I enjoyed more was adding the multi-monitor support (a breeze
[thanks to GDK][]), and when trying to correctly understand how [partial
struts][] in X work to make window managers not cover the panel with
windows, and how using GDK makes one think (and learn!) about how things
are actually done (for example, having to call
[gtk\_widget\_realize()][partial struts] on windows before setting X
properties on them).

Last, but not least, a quick list (which will serve me as reminder) of
things I would like to improve at some point, in no particular order:

-   Add a “system menu” (likely, to the left of the Global Menu), with
    some system options (restart, suspend, lock screen, etc) and the
    [FreeDesktop menus][].
-   Command line completion.
-   Command line history, and searching over it.
-   Make some stuff configurable, using some command line options could
    do the trick.
-   Option to disable the Global Menu (for people who does not like it)
    and replace it with some other interesting stuff, like e.g. a task
    switcher.
-   Feature *XYZ*. Suggestions welcome!

Did I mention that my laptop battery now lasts a bit longer? :D

  [doing again]: /aperez/2010/07/vfand-a-daemon-to-control-fan-speed-in-vaio-laptops/
  [some]: /aperez/2010/08/dmon-process-monitoring-with-style/
  [C coding]: /aperez/2010/09/some-thoughts-and-code-around-gobject-introspection/
  [GNOME Global Menu]: http://code.google.com/p/gnome2-globalmenu/
  [Fbpanel]: http://fbpanel.sourceforge.net/
  [OpenBox]: http://openbox.org/
  [GGTraybar]: http://gitorious.org/ggtraybar
  []: http://blogs.igalia.com/aperez/files/2010/09/ggt-300x125.png
  [![][]]: http://blogs.igalia.com/aperez/files/2010/09/ggt.png
  [gmrun]: http://github.com/rtyler/gmrun
  [GtkEntryCompletion]: http://library.gnome.org/devel/gtk/stable/GtkEntryCompletion.html
  [RandR]: http://en.wikipedia.org/wiki/RandR
  [DMon]: http://blogs.igalia.com/aperez/2010/08/dmon-process-monitoring-with-style/
  [GtkHotkey]: https://launchpad.net/gtkhotkey
  [thanks to GDK]: http://library.gnome.org/devel/gdk/2.90/multihead.html
  [partial struts]: http://standards.freedesktop.org/wm-spec/wm-spec-latest.html#id2552096
  [FreeDesktop menus]: http://standards.freedesktop.org/menu-spec/latest/
