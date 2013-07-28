Title: Running older (pre-etch) Debian releases
Date: 2009-11-02 13:16
Author: aperez
Category: Igalia
Tags: debian

This post is quick public information service for everyone using, or
having to deal with old Debian releases. This includes *all* releases
prior to Etch: Woody, Sarge, Potato...

You have probably noticed that you cannot longer use APT to install
packages in your system.  
The package repositories have been moved over to
[archive.debian.org][], so you will need to change your
`/etc/apt/sources.list` accordingly. For Sarge, you would use:

    deb http://archive.debian.org/debian sarge main contrib non-free
    deb http://archive.debian.org/debian-security sarge/updates main contrib non-free

You may even use archived repository of [backports.org][] of Sarge,
adding a line like this:

    deb http://archive.debian.org/backports.org sarge-backports main contrib non-free

This way one can inject some fresh air into an existing Debian setup if
making a full system upgrading is not an option for you.

Have a lot of fun...

  [archive.debian.org]: http://archive.debian.org/
  [backports.org]: http://backports.org
