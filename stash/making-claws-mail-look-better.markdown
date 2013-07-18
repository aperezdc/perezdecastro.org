Title: Making Claws-Mail look better
Date: 2009-07-08 12:01
Author: aperez
Category: Igalia
Tags: patch

Those of you who use [Claws-Mail][] in a daily basis *and* like to
tune-up how your [Gnome][] desktop looks by means of the [fine themes][]
which are available for it, for sure have noticed the weird, ugly
2-pixel spacing between toolbars and the window border. This not only
unpleasant to see, but totally breaks some dark themes (e.g. [Dust][]).
The bad news: the padding is hardwired in the Claws source code. The
good news: there is a [small patch I made][] which will make your day
happier :-D

**Update:** The patch has been already [included in the Claws-Mail
repository][]. Thanks you guys!

  [Claws-Mail]: http://www.claws-mail.org/
  [Gnome]: http://www.gnome.org
  [fine themes]: http://art.gnome.org
  [Dust]: http://gnome-look.org/content/show.php/Ubuntu+Dust?content=88790
  [small patch I made]: http://blogs.igalia.com/aperez/files/2009/07/toolbar-padding.patch
  [included in the Claws-Mail repository]: http://scm.dotsrc.org/viewvc.cgi/claws-mail/claws/src/toolbar.c?revision=1.43.2.110&view=markup&pathrev=gtk2
