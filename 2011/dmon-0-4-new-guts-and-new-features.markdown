Title: DMon 0.4: New guts & new features
Date: 2011-07-25 11:50
Author: aperez
Tags: dmon, igalia, connectical

Wow, that was a lot of time without me posting anything (five months),
mostly because I am investing most of my spare time after work here in
Finland for socializing. Still, from time to time one has to take a
break, and there is no better way than just staying at home watching [a
good TV series][], or doing some coding on [pet][] [projects][]. The
later means that DMon got some love, and that [version 0.4.1][] is now
available (tarball [here][], mirror [there][]).

**So... What's new?**

Most changes in this release are not user-visible, because I have been
rewriting the insides of DMon to use [libwheel][projects], which enables
some nice features and allowed to reduce the amount of code ([less is
more!][]). Anyway this is a summary of what's new since version 0.3.7:

-   Long command line options are now supported. Parsing and error
    reporting of arguments was improved.
-   It is now possible for `dmon` to read options from text files, by
    passing `--config` (or `-C`) as first command line option, followed
    by a path to a file. File format is dead easy: long command line
    options (without trailing dashes) followed by arguments, one option
    per line, and lines starting with dashes are ignored.
-   Real-time updates on the status of the processes being monitored can
    be written now to a file (which may be a FIFO), using the
    `--write-info` option. This may be useful to integrate `dmon` with
    other tools. The manual page has now a section documenting the
    format of the generated status information.
-   The `drlog` log tool, which supersedes `rotlog`, was added. Use it
    to log to a directory of auto-rotated log files.
-   A multicall binary is now built by default (that is: one binary
    contains all tools, which can be symlinked under different names).
    Separate binaries can still be built by passing `NO_MULTICALL=1` to
    Make.
-   A number of small cleanups and fixes, both in the code and manual
    pages.

**What next?**

Those are some vague ideas of things I would like to implement at some
point:

-   Add support for [control groups][]. This would allow to do nice
    tricks like isolating processes more reliably, killing subprocesses
    spawned by daemons that create new process groups in the wild, finer
    controls on resource usage limits... As this is a Linux-specific
    feature, it will be a compile-time option.
-   Handling of lock files. It may be interesting to have the ability of
    locking some particular file before launching processes. This would
    be mostly useful for tasks that are ran once under control of
    `dmon`.
-   A `start-stop-daemon` compatible replacement that uses DMon under
    the hood. This would allow for easily hooking it in traditional SysV
    init scripts.
-   DInit: This would be a replacement for [init(8)][], which would use
    `dmon` to monitor processes. Why implementing another contender when
    there's already [systemd][], [upstart][] and a [bunch][] of
    [other][] [implementations][]? First of all, I like hacking this
    kind of system-level things so I will be doing it “for fun”; second,
    I would like to focus on making it suitable for embedded devices and
    diskless operation (e.g. cluster nodes or minimal/rescue boot
    images).

**Some final words...**

Sorry, no Debian packages this time, but now that I am using [Arch
Linux][] again there is a package [available at the AUR][].

Also, I will be in Berlin in August, from 5th to 12th... Yes, you
guessed it: I'm attending the Desktop Summit:

![attending the Desktop Summit in Berlin][]

See you around... and happy monitoring!

  [a good TV series]: http://www.thetvdb.com/?tab=series&id=75760&lid=7
  [pet]: https://gitorious.org/dmon
  [projects]: https://gitorious.org/wheel
  [version 0.4.1]: https://gitorious.org/dmon/dmon/trees/v0.4.1
  [here]: http://people.igalia.com/aperez/files/dmon-0.4.1.tar.gz
  [there]: http://furi-ku.org/files/dmon-0.4.1.tar.gz
  [less is more!]: http://en.wikipedia.org/wiki/Minimalism#Minimalist_design
  [control groups]: https://secure.wikimedia.org/wikipedia/en/wiki/Cgroups
  [init(8)]: http://en.wikipedia.org/wiki/Init
  [systemd]: http://freedesktop.org/wiki/Software/systemd/
  [upstart]: http://upstart.ubuntu.com/
  [bunch]: http://smarden.org/runit/
  [other]: http://initng.org/trac
  [implementations]: http://roy.marples.name/projects/openrc
  [Arch Linux]: http://www.archlinux.org/
  [available at the AUR]: http://aur.archlinux.org/packages.php?ID=50553
  [attending the Desktop Summit in Berlin]: https://www.desktopsummit.org/sites/www.desktopsummit.org/files/DS2011banner.png
