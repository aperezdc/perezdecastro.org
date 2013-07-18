Title: Escaping manual package installation woes: Enter our APT repository
Date: 2010-07-26 18:24
Author: aperez
Category: Igalia
Tags: debian, guruplug, navalplan, nginx, openerp, pkg

Lately I [have][] [been][] [packaging][] stuff as ready-to-use `.deb`
packages. But providing just a bunch of links to them and forcing people
to use arcane tools like `dpkg -i` to install software is not very
user-friendly... and it is definitely not sysadmin-friendly either. Due
to those reasons, we decided to roll [our own APT repository][]. This
means that from now on I will stop posting links here, and that you get
a convenient way of installing packages *em* automatically getting
updates.

For the moment there is not a lot of packages are in the APT repository,
because some of the packages' control files were not in a very good
shape and I need to tweak them a bit before [reprepro][] will happily
agree to add them in the repository. The good news is that I am adding
some [ARM EABI][] packages ready to use with the [GuruPlug][].

Instructions for using the repository can be found at
[apt.igalia.com][our own APT repository], as well as the repository PGP
key ([E438FFC5][]), which is signed with my own ([E4C9123B][]).

Have a lot of fun... ;-)

  [have]: http://blogs.igalia.com/aperez/2010/06/and-even-more-packages/
  [been]: http://blogs.igalia.com/aperez/2010/05/do-a-bus-trip-with-openamq/
  [packaging]: http://blogs.igalia.com/aperez/2010/03/packaging-navalplan-and-openerp-5-2-alpha/
  [our own APT repository]: http://apt.igalia.com
  [reprepro]: http://mirrorer.alioth.debian.org/
  [ARM EABI]: http://wiki.debian.org/ArmEabiPort
  [GuruPlug]: http://www.globalscaletechnologies.com/t-guruplugdetails.aspx
  [E438FFC5]: http://apt.igalia.com/apt-igalia.key
  [E4C9123B]: http://pgp.mit.edu:11371/pks/lookup?op=vindex&search=0x91C559DBE4C9123B
