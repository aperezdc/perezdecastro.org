title: Web Engines Hackfest 2018 → FOSDEM 2019
date: 2019-01-27 23:45
author: aperez
tags: igalia

The last quarter of 2018 has been a quite hectic one, and every time I had
some spare time after the [Web Engines
Hackfest](https://webengineshackfest.org/2018/) the prospective of sitting
down to write some thoughts about it seemed dreadful. Christmas went by
already &mdash;two *full* weeks of holidays, practically without touching a
computer&mdash; and suddenly I found myself booking tickets to this year's
[FOSDEM](https://fosdem.org/2019/) and it just hit me: it is about time to
get back blogging!


## FOSDEM

There is not much that I would want to add about
[FOSDEM](https://fosdem.org/2019/), an event which I have attended [a
number](/2013/back-from-fosdem-2013-edition.html) [of
times](/2012/fosdem-2012.html) [before](/2011/alive-fosdem.html) (and some
others about which I have not even blogged). This is an event I always look
forward to, and the one single reason that keeps me coming back is
**recharging my batteries**.

This may seem contradictory because the event includes hundreds of talks and
workshops tucked in just two days. Don't get me wrong, the event is
*physically* tiresome, but there are always tons of new and exciting topics to
learn about and many Free/Libre Software communities being represented, which
means that there is a contagious vibe of enthusiasm which makes me go back
home with the will to keep doing *more*.

Last but not least, FOSDEM is one of these rare events in which I get to meet
many people who are dear to me &mdash; in some cases spontaneously, even
without knowing we all would be attending. See you in Brussels!


## Web Engines Hackfest

Like on previous years, the [Web Engines
Hackfest](https://webengineshackfest.org/2018) has been hosted by
[Igalia](https://igalia.com), in the lovely city of A Coruña. Every year the
number of participants has been increasing, and we hit the mark of 70 people
in this edition.


### Are We GTK+4 Yet?

This time I was looking forward to figuring out how to bring
[WebKitGTK+](https://webkitgtk.org/) into the future, and in particular to
GTK+4. We had a productive discussion with Benjamin Otte which helped a great
deal to understand how the GTK+ scene graph works, and how to approach the
migration to the new version of the toolkit in an incremental way. And he
happens to be a fan of [Factorio](https://www.factorio.com), too!

In its current incarnation the `WebKitWebView` widget needs to use
[Cairo](https://www.cairographics.org/) as the final step to draw its
contents, because that is how widgets work, while widgets in GTK+4 populate
[nodes](https://developer.gnome.org/gsk4/unstable/GskRenderNode.html) of a
[scene graph](https://en.wikipedia.org/wiki/Scene_graph) with the contents
they need to display. The “good” news is that it is possible to [populate a
render node using a Cairo
surface](https://developer.gnome.org/gtk4/unstable/GtkSnapshot.html#gtk-snapshot-append-cairo),
which will allow us to keep the current painting code. While it would be more
optimal to avoid Cairo altogether and let WebKit paint using the <abbr
title="Graphics Processing Unit">GPU</abbr> on [textures that the scene graph
would consume
directly](https://blog.gtk.org/2018/03/16/textures-and-paintables/), I expect
this to make the initial bringup more approachable, and allow building
WebKitGTK+ both for GTK+3 *and* GTK+4 from the same code base. There *will* be
room for improvements, but at least we expect performance to be on par with
the current WebKitGTK+ releases running on GTK+3.

<figure class="image">
  ![](gtk-wk-sg.svg)
  <figcaption>An ideal future: paint Web contnt in th GPU, feed textures to GTK+.</figcaption>
</figure>

While not needing to modify our existing rendering pipeline should help, and
probably just having the `WebKitWebView` display *something* on GTK+4 should
not take that much effort, the migration will still be a major undertaking
involving some major changes like switching input event handling to use
[GtkEventController](https://developer.gnome.org/gtk4/stable/GtkEventController.html),
and it will not be precisely a walk in the park.

As of this writing, we are not (yet) actively working on supporting GTK+4, but
rest assured that it will eventually happen. There are other ideas we have on
the table to provide a working Web content rendering widget for GTK+4, but
that will a the topic for another day.


### The <abbr title="Media Source Extensions">MSE</abbr> Rush

At some point people decided that it would be a good idea to allow Web content
to play videos, and thus the `<video>` and `<audio>` tags were born. All was
good and swell until people wanted playback to adapt to different types of
network connections and multiple screen resolutions (phones, tablets,
<del>cathode ray tubes</del>, cinema projectors...). The “solution” is to
serve video and audio in multiple small chunks of varying qualities, which are
then chosen, downloaded, and stitched together while the content is being
played back. Sci-fi? No: [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API).

A few days before the hackfest it came to our attention that a [popular video
site](https://youtube.com) stopped working with
[WebKitGTK+](https://webkitgtk.org) and [WPE WebKit](https://wpewebkit.org) in
some cases. The culprit: The site started requiring MSE in some cases, our MSE
implementation was disabled by default, and when enabled it showed a number of
bugs which made it hardly possible to watch an entire video in one go.

During many of the days of the Web Engines Hackfest a few of us worked
tirelessly into the wee hours to [make MSE work well
enough](https://blogs.gnome.org/mcatanzaro/2018/11/02/webkitgtk-2-22-2-and-2-22-3-media-source-extensions-and-youtube/).
We managed to crank out no less than two WebKitGTK+ releases (and one
for WPE WebKit) which fixed most of the rough edges, making it possible to
have MSE enabled and working.


### And What Else?

To be completely honest, shipping the releases with a working <abbr
title="Media Source Extensions">MSE</abbr> implementation made the hackfest
pass in a blur and I cannot remember much else other than having a great time
meeting everybody, and fascinating conversations &mdash; many of them
around a table sharing good food. And that is already good motivation to
attend again next year 😉
