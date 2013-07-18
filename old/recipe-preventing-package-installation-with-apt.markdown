Title: Recipe: Preventing package installation with APT
Date: 2011-02-27 15:39
Author: aperez
Category: Igalia
Tags: apt, debian, pkg

This is a quick Debian recipe, mainly as a note to myself, but that can
be useful to people out there: what if I wanted instruct APT to *never*
install a particular package? This may lead to wonder whether there is a
really sane use case for that, and I can think at least about two:

-   For server setups, to prevent certain packages like the X11 window
    system to be installed.
-   To avoid dependencies on deprecated packages.

The later is my use-case for today: [HAL][] is nowadays deprecated,
being [DeviceKit][] and [udev][] the new shiny stuff that everybody
should use in a [modern GNU/Linux desktop][]. My laptop is running
[Sid][], so ideally there shouldn't be HAL packages in it, should they?

In short, the idea is to pin packages with a lower-than-zero priority.
If packages were already installed, they will not be upgraded by APT.
For packages that are not installed, this will instruct APT to avoid
them as much as possible. This is how my pinning for HAL looks like:

      % cat /etc/apt/preferences.d/nohal
      Package: hal
      Pin: version *
      Pin-Priority: -100

      Package: hal-info
      Pin: version *
      Pin-Priority: -100

      Package: libhal1
      Pin: version *
      Pin-Priority: -100

...and that's it :-D

Anyway, I still prefer [package masking][] or setting `USE="-hal"` in
[Gentoo][], it's cleaner and meaner.

  [HAL]: http://freedesktop.org/wiki/Software/hal
  [DeviceKit]: http://freedesktop.org/wiki/Software/DeviceKit
  [udev]: http://www.kernel.org/pub/linux/utils/kernel/hotplug/udev.html
  [modern GNU/Linux desktop]: http://gnome3.org/
  [Sid]: http://www.debian.org/releases/sid/
  [package masking]: http://www.gentoo.org/doc/en/handbook/handbook-x86.xml?part=3&chap=3#doc_chap3
  [Gentoo]: http://www.gentoo.org
