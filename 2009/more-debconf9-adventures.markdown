Title: More DebConf 9 adventures
Date: 2009-08-02 01:40
Author: aperez
Category: Miscellaneous
Tags: debconf

Now it looks like it is time to complete my [previous post about
DebConf 9][], after a tiresome journey back from Cáceres to Coruña the
30th, an [Igalia assembly][] the 31st (the first one ever for me :-D),
and sleeping for more than 14 hours today.

Fortunately I did not need to travel alone, as [Diego][] came with me to
visit Coruña and the journey was more enjoyable than the other way
around. To make the most out of the occasion, we followed an alternative
route via  [Ciudad Rodrigo][] (where we had lunch and bought some red
wine, olive oil, and [Iberian “embutido”][]: chorizo, salchichón and
cured loin), then [Porto][] (where we saw the bridges by Gustave Eiffel
and his disciples), [Valença do Minho][] (where we bought some goods
which are sold in Portugal: salted butter, cheese, coffee, [guava][]
jelly...) and finally we made a longer stop at [Santiago de
Compostela][] in order to see the cathedral and the old town area while
eating a sandwich. It took some time to complete the trip, but was far
funnier that going alone to Cáceres.

But going back on to DebConf 9, here is the rest of my batch of lectures
and events, including summaries of them:

-   [Free travel instead of free beer][]: Very nice presentation of
    photographs from *all* past DebConf and FLOSS related events, by
    Andreas Tille who has attended loads of them! This was a quite
    relaxing event, and the people there made the thing more enjoyable
    by telling the others about anecdotes and funny things about the
    places and the things which happened all along the world in past
    conferences.
-   [Stable/Volatile/Backports ecosystem][]: This was a nice chat trying
    to define how the different Debian repositories should interact
    between each other. I think that the nicer part was including the
    not-so-official [backports.org repositories][], but nothing has been
    said about including [debian-multimedia][]. It is a good thing to be
    coherent with the [DFSG][] and being picky with which packages are
    actually in the main repository, but in my opinion something should
    be done to support *the packages the users want* in some way,
    including debian-multimedia as well.
-   [Qemu for Debian developers][]: Not something which could be
    considered astonishing, but I have learned a couple of nice Qemu
    tricks with this. This was an interesting introduction for people
    wanting to make packages for architectures different than the one
    they are running.
-   [Drowning in bugs][Stable/Volatile/Backports ecosystem]: This was an
    extremely interesting chat about how it would be possible to
    actually get people to do [bug triaging][] in Debian. Some solutions
    were outlined, like having some kind of teams for people to belong
    to, so they get at least some social recognition (e.g. “look, I am
    part of the Debian Foo-Bar Bugsquad” and the like), adding a score
    meter to the BTS like in the [Gnome Bugzilla][] and so on. I think
    that [something][] which
    <span style="text-decoration: line-through">should</span> is being
    cooked right now will help a lot with this.
-   [Libvirt, hypervisor independent virtual machine management][]: I
    heard before about [libvirt][], but have always thought that it
    looked like an unneccessary layer of indirection about [THE
    virtualization technology][] you want to use. The facts are that it
    does not have Linux-vServer support (well, it [might][]) and that
    one gets an interesting feature: remote management of virtual
    machines. Does that feature that pose much differences from using
    SSH to open a remote session? Probably if you use [Qemu][] and/or
    [Xen][], but I do not see the point of having the additional hassle
    of another software layer.
-   [Debian Redesign][]: Agnieszka aka “pixelgirl” proposed a new design
    for some stuff related to Debian, logo, colours, fonts and website.
    Some minor work for boot splash screens and is also there in the
    pack. It was funny to see how people asked questions about the
    openness of the license of the new font used for the logo, when the
    [old one][] has a commercial one... I hope that she does not get
    annoyed too much by the rest of the community, because I also think
    there is a *real* and *urgent* need to give some love to how things
    look in Debian. And having people which has the neccessary knowledge
    to properly design nice things is great, so the community should
    support her.
-   [State of the Bug Tracking System][]: Don Armstrong was making some
    improvements and cleanups to the old `debbugs` big code clean-up,
    and presented to the public one new feature which allows to mirror
    the state of the BTS and run a local copy. This made all the
    audience clap hands like crazy, as this allows for speedier
    operations, especially for searching and filtering in reports.
-   [Introducing DebConf10][]: New York will held the next DebConf,
    which will be also the 10th anniversary of the event. The main venue
    will be at the [Columbia University][] which looks great for such a
    thing. The main issue could be problems for people living in certain
    countries to get a visa so they can travel there the next year, so
    the organizers will be even providing legal advice and support. I
    just hope that this will not make the next edition be a “DebConf
    light” and that people from all around the world is represented the
    next year.
-   [Debian on Network Attached Storage (NAS) devices][]: First of all,
    as most igalians have a NSLU2, I would want to say that Martin has
    already found the perfect and improved replacement for them: the
    [Marvell SheevaPlug][]. It is great to see how well GNU/Linux is
    spreading over to all kinds of devices and architectures. And it is
    even nicer to see how the developers have designed a way for
    seamlessly installing Debian in this kind of devices in such a way
    that an average user could do it without requiring ninja skills.

That's a good selection of the lectures and events I attended to. Of
course there were some more interesting things, like the conference
dinner, the [massive group photo][], giving a [talk][] ([slides
here][]), the odyssey all along Cáceres to find a proper Irish tavern...
The pint of Guinness with [Gunnar][], [Gustavo][] and [Diego][] was one
of the best moments of the conference ;-)

Quick summary: going to DebConf 9 was a rewarding experience, even when I
ended up extremely tired after it. Let's try to attend some more
conferences anytime soon...

  [previous post about DebConf 9]: /aperez/2009/07/1st-day-at-debconf9/
  [Igalia assembly]: http://blogs.igalia.com/agomez/2008/10/22/igalia-is-yours/
  [Diego]: http://blogs.gnome.org/diegoe/
  [Ciudad Rodrigo]: http://en.wikipedia.org/wiki/Ciudad_Rodrigo
  [Iberian “embutido”]: http://en.wikipedia.org/wiki/Embutido
  [Porto]: http://en.wikipedia.org/wiki/Porto
  [Valença do Minho]: http://en.wikipedia.org/wiki/Valen%C3%A7a,_Portugal
  [guava]: http://en.wikipedia.org/wiki/Guava
  [Santiago de Compostela]: http://en.wikipedia.org/wiki/Santiago_de_compostela
  [Free travel instead of free beer]: https://penta.debconf.org/dc9_schedule/events/374.en.html
  [Stable/Volatile/Backports ecosystem]: https://penta.debconf.org/dc9_schedule/events/409.en.html
  [backports.org repositories]: http://backports.org/
  [debian-multimedia]: http://debian-multimedia.org/
  [DFSG]: http://www.debian.org/social_contract#guidelines
  [Qemu for Debian developers]: https://penta.debconf.org/dc9_schedule/events/382.en.html
  [bug triaging]: http://nedbatchelder.com/text/triaging.html
  [Gnome Bugzilla]: http://bugs.gnome.org
  [something]: http://wiki.debian.org/SummerOfCode2007/DebbugsWebUI
  [Libvirt, hypervisor independent virtual machine management]: https://penta.debconf.org/dc9_schedule/events/444.en.html
  [libvirt]: http://libvirt.org/
  [THE virtualization technology]: http://linux-vserver.org/
  [might]: http://www.redhat.com/archives/libvir-list/2008-January/msg00097.html
  [Qemu]: http://www.qemu.org/
  [Xen]: http://www.xen.org/
  [Debian Redesign]: https://penta.debconf.org/dc9_schedule/events/459.en.html
  [old one]: http://wiki.debian.org/DebianLogo
  [State of the Bug Tracking System]: https://penta.debconf.org/dc9_schedule/events/434.en.html
  [Introducing DebConf10]: https://penta.debconf.org/dc9_schedule/events/429.en.html
  [Columbia University]: http://www.columbia.edu/
  [Debian on Network Attached Storage (NAS) devices]: https://penta.debconf.org/dc9_schedule/events/412.en.html
  [Marvell SheevaPlug]: http://www.engadget.com/2009/02/24/marvells-sheevaplug-linux-pc-fits-in-its-power-adapter/
  [massive group photo]: http://www.flickr.com/photos/aigarius/3769719319/
  [talk]: https://penta.debconf.org/dc9_schedule/events/450.en.html
  [slides here]: https://penta.debconf.org/dc9_schedule/attachments/114_slides.pdf
  [Gunnar]: http://gwolf.org/
  [Gustavo]: http://blog.kov.eti.br/
