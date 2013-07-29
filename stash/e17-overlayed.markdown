E17 overlayed!
==============

date
:   2007-02-15 13:22

author
:   Hario

tags
:   floss, gentoo

The last week I was somewhat surprised because
[Enlightenment](http://www.enlightenment.org) 0.17 dissapeared from the
Portage tree. After some digging, I found the answer: now the ebuilds
reside in [their own
overlay](http://overlays.gentoo.org/dev/vapier/wiki/enlightenment). If
you want to continue using E17, Layman will do the thing:

`# layman -a enlightenment`

If you are using [Paludis](http://paludis.pioto.org/) like me, you may
prefer adding the following into a file like
`/etc/paludis/repositories/e17.conf` (tune up things for your
installation, if needed):

`location = ${ROOT}/var/paludis/repositories/e17`

sync = svn+http://overlays.gentoo.org/svn/dev/vapier/enlightenment

format = ebuild

names\_cache = \${location}/.cache/names

write\_cache = /var/cache/paludis/metadata

Then just do a sync and you will be done.

Enjoy!
