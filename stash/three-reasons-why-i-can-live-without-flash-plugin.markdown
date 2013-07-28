Title: Three reasons why I can live without Flash plugin
Date: 2010-08-09 12:24
Author: aperez
Category: Igalia
Tags: bash, cli, multimedia, python

Ahh, [Flash][]: the non-accessible, proprietary, widely used, hated and
loved browser plugin. I have been using 64-bit GNU/Linux distributions
for almost five years, with varying degrees of satisfaction regarding
Flash content. In the beginning, there was no Flash at all, and that was
good. Then came `nspluginwrapper`, which I decided not to use because I
won't install duplicated 32-bit libraries in my system. Finally, at some
point Adobe released a 64-bit alpha release of the thing. It worked but
sometimes it decided it was a good moment to crash. Lately Adobe ceased
to distribute it, arguing it “had security flaws” and that “they are
working in improved 64-bit support”. Whatever that wording could mean,
the fact is that now it is easier than before to stay away from having
the Flash plugin installed. My (personal) selection reasons is:

-   **HTML5.** Most video sites (that's for what Flash is used, isn't
    it?) have now some degree of HTML5 support, including the “big
    ones”: [YouTube][], [DailyMotion][], [Vimeo][]... Just get yourself
    a [modern browser][] and you're ready to go.
-   **Speed**. Flash is slooow. In. Every. Platform. I. Tried. Even
    using the [PlayStation 3][], which has plenty of raw power, the
    browser is sluggish in sites with Flash content.
-   **[youtube-dl][]**. This is a script which will happily download
    videos from some video sites, by the way including YouTube. This is
    the ultimate reason why one can happily live without Flash.

The nicest feature of `youtube-dl` is the `--get-url` flag. You can
directly stream a video with e.g. `mplayer` using a small script like
this one:

    #! /bin/sh
    exec mplayer "$(youtube-dl --get-url "$1")"

Nice, isn't it? ;-)

  [Flash]: http://en.wikipedia.org/wiki/Adobe_Flash
  [YouTube]: http://www.youtube.com/html5
  [DailyMotion]: http://openvideo.dailymotion.com/
  [Vimeo]: http://vimeo.com/blog:268
  [modern browser]: http://live.gnome.org/Epiphany
  [PlayStation 3]: http://en.wikipedia.org/wiki/Playstation_3
  [youtube-dl]: http://bitbucket.org/rg3/youtube-dl/wiki/Home
