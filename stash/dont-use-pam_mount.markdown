Don't use pam\_mount
====================

date
:   2006-12-13 18:44

author
:   Hario

tags
:   gentoo

It implements rather good idea: mounting volumes in a per-user fashion
when the user is first authenticated, which is a Good Thing™ e.g. for
encrypted home volumes. But do *not* use
[pam\_mount](http://www.flyn.org/projects/pam_mount/), it breaks things
horribly whenever [PAM](http://www.kernel.org/pub/linux/libs/pam/)
(which is used for authenticating users) is updated. Just don't. And it
also makes "sudo" unusable :-(

Free advice: If you *definitely* know that you *do* need it, keep always
a fresh copy of your PAM configuration, the one before installing it.
You may need it in order to boot single-user and restore the default
configuration just in case something got broken. Fortunately I decided
to version-control with [Bzr](http://bazaar-vcs.org) my configuration
files time ago...
