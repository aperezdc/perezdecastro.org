Unholy D-BUS update
===================

date
:   2006-12-07 02:00

author
:   Hario

tags
:   gentoo

Today I noticed about a new release of
[Thunar](http://thunar.xfce.org/), the file manager I use regularly
(unfortuntely [Enlightenment's](http://www.enlightenment.org/) FM2 is
useable but not quite complete yet). I decided to upgrade and I used the
"emerge -u thunar", which pulled extra new packages for upgrading... and
some of you maybe guessed that
[D-BUS](http://freedesktop.org/wiki/Software_2fdbus) was one of the
selected packages.

The problem with the latest D-BUS is that version 1.x breaks binary
compatibility at the API level with releases of the 0.x series, and this
means that **all** packages depending on it must be rebuild! My
un-speedy G3 iBook spent all the evening rebuilding packages, and it is
**still** compiling stuff...

I sometimes get somewhat annoyed by these kind of things but "emerge" is
for me like a slow "apt-get", but easier and allowing fine tuning of
installed packages. Also, usually configuring things in
[Gentoo](http://www.gentoo.org) is easier, having developer stuff
installed is automatic (I always forget to install "-dev" packages in
other distros and, in fact, having to do that annoys me), having
bleeding-edge [Gnome](http://www.gnome.org) packages is tricial (thanks
to overlays) and the such. That's why I still use Gentoo, and I'm happy
with it ;-)
