Title: The GNOME, the OS and the OSTree
Date: 2012-06-15 04:59
Author: aperez
Category: GNOME
Tags: gnome, ostree

Traditionally, [GNOME][] has been defined —and seen— as a project aiming
to produce a desktop environment made of Free Software. Maybe you have
read (or heard) the term “GNOME OS” lately, which started to pop out
[here][] and [there][] a while ago, but still it may sound a lot like
vaporware... far from that, it is being shaped up in this very moment,
and [GNOME 3][] is just the tip of the iceberg.

But isn't making an entire operating system a lot more of work than just
caring about the user experience? Yes. Kinda. Depends on how one does
it. Fortunately there are a number of components already available: for
example nobody has to take care about writing a [kernel][] or the base
[graphics][] [infrastructure][]—but adopting them instead, assembling a
minimal host system on top of which the rest of the GNOME platform can
be run and developed. Add some grease —a process to install the system—,
some polish —a process to upgrade it— and some duct tape —a developer
story— and then the thing will be ready to crank it up. This is
precisely what [OSTree][] is about.

## OSTree

<figure class="image">
  ![Trees: a new home for (the) GNOME](http://farm5.staticflickr.com/4007/4653657177_22d946ef40.jpg)

  <figcaption>
  Trees: a new home for (the) GNOME (Creative-Commons [image by Alan
  Moote](http://www.flickr.com/photos/parabyte/4653657177/))
  </figcaption>
</figure>

A while ago [Colin Walters][] started to implement Hacktree, later
renamed to OSTree, with the aim to cover the inner guts of system
deployment —installation, upgrades— and development. The basic idea is
to have multiple, complete, bootable file system trees, with the
possibility of chosing among them at boot time and versioning the
contents in a repository. Roughly, operations then are carried away this
way:

-   A new system installation consists in cloning a remote repository
    and checking out a tree that contains the latest release of the
    system.
-   An upgrade consists in pulling contents from the remote repository,
    checking out a new tree and rebooting into it. Note that the old
    tree can be kept around and be used as fallback when something fails
    in the new one.

If the above sounds a bit like the [Git][] version control system, it is
because OSTree draws quite some inspiration and ideas from it.

As a nice consequence of allowing multiple file system trees, developers
automatically get some extras for free:

-   They may want to check out a tree containing additional aids
    targeted to them and use it for development.
-   It would be possible to ensure that all developers work on top of
    the same set of platform components.
-   Also, a developer may chose to check out a particular revision of
    the system tree, to ease reproduce bugs in a controlled environment.

But developers deserve even more than that, isn't it? Why not revamping
the venerable [JHBuild][] into something that knows how to interact with
OSTree? Such a thing exists, and it's called [ostbuild][].

## Making a mark in the world

Some of us at Igalia think that OSTree has a very good potential to
become an integral part of a GNOME system in a not-so-far future, so why
not helping out to try to make that happen a bit earlier? It is [not
ready for prime time yet][], hence the investment we are doing devoting
hacking time in OSTree. Expect more posts about it later on ;-)

  [GNOME]: http://www.gnome.org
  [here]: http://blogs.gnome.org/mccann/2010/08/01/shell-yes/
  [there]: http://ploum.net/post/what-if-ubuntu-were-right
  [GNOME 3]: http://www.gnome.org/gnome-3/
  [kernel]: http://www.kernel.org
  [graphics]: http://www.x.org
  [infrastructure]: http://wayland.freedesktop.org/
  [OSTree]: http://live.gnome.org/OSTree
  [Colin Walters]: http://blog.verbum.org
  [Git]: http://git-scm.com/
  [JHBuild]: https://live.gnome.org/Jhbuild
  [ostbuild]: https://live.gnome.org/OSTree/Ostbuild
  [not ready for prime time yet]: https://mail.gnome.org/archives/ostree-list/2012-April/msg00000.html
