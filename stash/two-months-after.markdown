Title: Two months after...
Date: 2009-09-25 12:10
Author: aperez
Category: Igalia

Two months have passed after my last post, and things here have been
quieter than usual *in this blog*, but the world kept moving in the
meanwhile so there are some things to tell, and some other that have
already been told. Probably the most exciting thing for me and my [work
mates][] was the announcement of the shiny [Nokia N900][]. I have
resisted the temptation then, because [a lot][] [of things][] [have
already][] [been said][] about it. We systems administrators are usually
in the shadows, but even so it is a delight working as backing support
for people who does big things.

There were a couple of releases this week what are a great example of
why Igalia reached its eighth year, and we are still [rockin' in the
free world][]:

-   [Hildon 2.2.0][], the user interface toolkit used in Maemo. No words
    are needed to explain [how awesome][] is this!
-   Also, some of my work mates are fine-tuning [MAFW][] after bringing
    it to life in order to provide multimedia coolness to Maemo, and
    (who knows!) maybe the desktop as well. Of course all built on top
    of the lovely [GStreamer][] libraries.
-   [GNOME 2.28][], which includes the hard work from a lot of work in
    form all around the world, and a revamped Epiphany web browser which
    uses [WebKitGTK+][] as the rendering engine. This means that some of
    my colleguaes have been [killing kitties][] and their [hard work][]
    will be deployed in every GNOME install!
-   [Frogr 0.1][], a tool which carries out out the simple (but
    important) task of uploading pictures to Flickr, and it is doing a
    fine task for me right now.
-   In the operating systems ground, [Haiku][] [R1 Alpha 1 has been
    released][]. This may sound like “some other hobbyist operating
    system”, but it is a lot more than that: it is a new life for the
    mighty [BeOS][] R5, which  took eight years to to bring from the
    dead. I have played a bit with the live CD: the experience is great,
    although somw rough edges still exist, but I would say that Haiku
    contains lots of superb work and I am eager to install it in some
    real hardware.

But more changes apart from software releases happened: in a more
personal note, I am now using [Fedora 11][] in a daily basis at my
laptop. Initially I wanted to try out [Foresight][], because the
[Conary][] package manager looks like an interesting piece of software,
but unfortunately the installer does not have support for LUKS-encrypted
volumes in the installer, and I did not want to bootstrap it manually.
Interestingly enough, Fedora *does* have such support using the same
Anaconda installer. I did not like Fedora back in version 6, but I must
admit that the community did an impressive improvement (at least
comparing version 6 to version 11!) and I am very happy with my current
setup. I am even considering Fedora 11 for installing it on my brand new
PlayStation 3: I bought one of the old “fat” models, because the new
“slim” ones do not officially support installing third-party operating
systems.

Finally, a quick note to finish this “I am alive” post: I am glad that
we have decided to push [Linux-vServer][] in our servers, because we are
getting some interesting benefits thanks to it, being the main one the
ability to easily clone a running machine and use the clone for testing
purposes before applying changes in the production environment. Also, we
are now able of easily provide sandboxed environments in which users
have almost-full administrative privileges without having to worry about
other services being affected in case something goes wrong. And we are
getting those niceties with a minimal overhead (\~1.5%) in terms of
kernel CPU usage. As we are moving services which were previously run on
physical machines into virtual machines, we are saving power and
contributing to the environment while providing a better service and
support to our staff :-D

  [work mates]: http://planet.igalia.com
  [Nokia N900]: http://maemo.nokia.com/n900/
  [a lot]: http://www.joaquimrocha.com/2009/08/27/the-first-maemo-powered-phone/
  [of things]: http://blogs.igalia.com/berto/2009/08/27/n900-a-great-milestone-for-the-free-software-community/
  [have already]: http://blogs.igalia.com/jasuarez/2009/08/27/nokia-n900-released/
  [been said]: http://www.gnome.org/~csaavedra/news-2009-08.html#D27
  [rockin' in the free world]: http://www.youtube.com/watch?v=3WZ0UmfGvUA
  [Hildon 2.2.0]: http://gitorious.org/hildon/hildon/commit/1c7a2f76f9d348388210ab0c880de5624eff52cd
  [how awesome]: http://www.youtube.com/watch?v=IHa3AoNdglY
  [MAFW]: https://garage.maemo.org/projects/mafw/
  [GStreamer]: http://gstreamer.freedesktop.org/
  [GNOME 2.28]: http://library.gnome.org/misc/release-notes/2.28/
  [WebKitGTK+]: http://webkitgtk.org
  [killing kitties]: http://static.squidoo.com/resize/squidoo_images/-1/draft_lens2278160module12474251photo_1226015948domo-kitten.jpg
  [hard work]: http://blogs.gnome.org/xan/2009/09/08/the-show-so-far/
  [Frogr 0.1]: http://blogs.igalia.com/mario/2009/06/05/frogr-flickr-remote-organizer-for-gnome/
  [Haiku]: http://www.haiku-os.org
  [R1 Alpha 1 has been released]: http://www.haiku-os.org/news/2009-09-13_haiku_project_announces_availability_haiku_r1alpha_1
  [BeOS]: http://en.wikipedia.org/wiki/BeOS
  [Fedora 11]: http://fedoraproject.org/
  [Foresight]: http://www.foresightlinux.org/
  [Conary]: http://wiki.rpath.com/wiki/Conary
  [Linux-vServer]: http://linux-vserver.org
