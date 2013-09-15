Title: List of articles about systemd
Date: 2012-06-26 20:23
Author: aperez
Tags: gnome, igalia

Even when my personal opinion on [systemd][] is a bit skeptical
regarding some of [its components][], it is undeniable that in the
mid-term the main GNU/Linux distributions will be shipping it (or parts
of it), and with [Fedora having already adopted][], it is just a matter
of time before GNOME (as in “GNOME OS”) starts using it. So, for getting
acquainted with it, I have installed it following the [corresponding
Arch Wiki page][] and started reading documentation. This article is
mainly a compilation to remind myself about where to easily reach the
relevant information, but it may still be useful to the people out there
so I here it goes.

Lennart Poettering (main developer of the thing) has a “systemd for
administrators” series of blog posts (thirteen articles so far):

1.  [Verifying bootup][]
2.  [Which service owns which processes?][]
3.  [How do I convert a SysV init script to a systemd service file?][]
4.  [Killing services][]
5.  [The three levels of “off”][] (*aka* how to disable services)
6.  [Changing roots][] (*aka* chroot()ing services)
7.  [The Blame Game][] (*aka* determining which services are slowing
    down the boot process)
8.  [The new configuration files][] (contains interesting notes for
    third party packages)
9.  [On /etc/sysconfig and /etc/default][] (this is more like an opinion
    column, but interesting nevertheless)
10. [Instantiated services][] (*aka* service templates, like the
    multiple virtual console services)
11. [Converting inetd services][]
12. [Securing your services][] (*aka* how to restrict what services can
    do to harden them)
13. [Log and service status][]
14. [The self-explanatory boot][] (*aka* how unit files —services, etc—
    can provide hints to documentation in them)
15. [Watchdogs][]

[Here][] you can find a list with links to the manual pages and some
more documentation. For newcomers, I would totally recommend reading the
[FAQ][] and the [Tips & Tricks][] pages.

  [systemd]: freedesktop.org/wiki/Software/systemd/
  [its components]: https://docs.google.com/document/pub?id=1IC9yOXj7j6cdLLxWEBAGRL6wl97tFxgjLUEHIX3MSTs
  [Fedora having already adopted]: http://fedoraproject.org/wiki/Systemd
  [corresponding Arch Wiki page]: https://wiki.archlinux.org/index.php/Systemd
  [Verifying bootup]: http://0pointer.de/blog/projects/systemd-for-admins-1.html
  [Which service owns which processes?]: http://0pointer.de/blog/projects/systemd-for-admins-2.html
  [How do I convert a SysV init script to a systemd service file?]: http://0pointer.de/blog/projects/systemd-for-admins-3.html
  [Killing services]: http://0pointer.de/blog/projects/systemd-for-admins-4.html
  [The three levels of “off”]: http://0pointer.de/blog/projects/three-levels-of-off.html
  [Changing roots]: http://0pointer.de/blog/projects/changing-roots
  [The Blame Game]: http://0pointer.de/blog/projects/blame-game.html
  [The new configuration files]: http://0pointer.de/blog/projects/the-new-configuration-files.html
  [On /etc/sysconfig and /etc/default]: http://0pointer.de/blog/projects/on-etc-sysinit.html
  [Instantiated services]: http://0pointer.de/blog/projects/instances.html
  [Converting inetd services]: http://0pointer.de/blog/projects/inetd.html
  [Securing your services]: http://0pointer.de/blog/projects/security.html
  [Log and service status]: http://0pointer.de/blog/projects/systemctl-journal.html
  [The self-explanatory boot]: http://0pointer.de/blog/projects/self-documented-boot.html
  [Watchdogs]: http://0pointer.de/blog/projects/watchdog.html
  [Here]: http://0pointer.de/blog/projects/systemd-docs.html
  [FAQ]: http://www.freedesktop.org/wiki/Software/systemd/FrequentlyAskedQuestions
  [Tips & Tricks]: http://www.freedesktop.org/wiki/Software/systemd/TipsAndTricks
