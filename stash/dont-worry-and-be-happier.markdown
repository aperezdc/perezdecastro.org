Title: Don't worry (and be happier!)
Date: 2008-08-27 17:49
Author: aperez
Category: Igalia
Tags: kvm

After upgrading KVM, today I was greeted by it with the following
message:

    vmport: unknown command 13

Do not worry about it, [KVM is not going nuts][] and it is still using
your virtualization extensions. That's why one wants to have a recent
64-bit machine. For the rest of stuff, my old (32-bit) iBook was even
better. If you do not believe me, just try to build a big C++
application with less than 2GB of RAM and GCC 4... and enjoy watching
the [OOM killer][] act.

In short: things are nicer after a week of holidays, warning are still
just warnings and Bash can be moulded nearly to whatever task one may
want :D

  [KVM is not going nuts]: http://kerneltrap.org/mailarchive/linux-kvm/2008/8/23/3054964
  [OOM killer]: http://linux-mm.org/OOM_Killer
