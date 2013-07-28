Title: Surrender to Subrender
Date: 2010-04-12 18:54
Author: aperez
Category: Igalia
Tags: python

***Update:** Subrender has now a [Git repository][]. Also note that I
cleaned up the code and now it is in a better shape that the quick
prototype I initially uploaded to this post.*

This is a bit of an announcement of a new tool I am crafting right now
—Subrender—, and a bit of explanation of why I have been messing with
multimedia formats lately (so this post serves as braindump for me as
well :-D)

I have been toying lately with video conversion tools, and made some
scripts to “transmogrify” videos in something that the [vilified
PlayStation 3][] is [able to play][]. With subtitles, and with them
*not* being hardsubbed. My experiments have shown that the only viable
route is to use the deadly [OpenDML][] format, which is no more than old
AVI files with some extra bits in. Then, [XSUB subtitles][] can be muxed
into the video file using `ffmpeg` (which does have [an encoder][]).

Now imagine that you have a copy of some video with subtitles in text
form, like the venerable [SubRip][] or the newer [SubStation Alpha][],
which is extensively used by people doing fansubs of anime series... You
need to render them to XSUB, which is bitmap-based! This is where
Subrender will lend a hand: it renders text-based subtitles to bitmaps.
In its current embrionary form it spits out PNGs, but I plan to provide
direct XSUB output as well.

By the way, I could just use [AVIAddXSubs][], but I had some reasons to
start coding my own tool:

-   AVIAddXSubs is a Windows application with GUI, so it is not possible
    to run it from a script, or use it in conjunction with other tools
    and scripts I use from the command line.
-   AVIAddXSubs is a Windows application, so it needs... Windows. Well,
    it works under [Wine][], but having it installed makes me feel
    guilty ;-)
-   AVIAddXSubs needs funny encodings for input `.srt` files like
    [ANSI][] or [Shift-JIS][]. I would prefer to just have it use UTF-8.
-   I find it nice to learn a bit about multimedia formats, and
    subtitles are easier to start with.
-   Also, this gives me the opportunity of doing some graphics code in
    the rendering part, and to become more confident with [Cairo][].
-   Last, but not least, AVIAddXSubs is not free/open software.

Probably you will be thinking “stop writing, and show up the code”, so
feel free to pick it up [here][]. Using it is straightforward, and it
will generate a bunch of PNG images in your working directory:

     ./subrender input.srt

And now, for the record, this is one frame as rendered by the above
script in its current form:

[![][]][]

I have chosen precisely this example because, even when the rendering
code works well, there are corner cases like this which clearly show
what needs to be improved:

-   More than two lines of text should be supported. Currently, if the
    lines are very long, the second one will not fit inside the frame.
-   Lines sometimes are not well centered: this is because I am only
    taking into account the text width reported by Cairo, and I should
    check bearings.

I prefer to focus now on encoding that as XSUB bitmaps, with the proper
timing information in the generated frames. Once I get it to do that, it
would be a good momento to go back and revisit rendering ;-)

Finally, if the text edges look jagged is because I have disabled
antialiasing in Cairo. This will be needed to ease the conversion to
XSUB bitmaps, because it uses a two-bit palette (just four colors),
because it is guaranteed that only pure white and pure black colors are
in the image.

  [Git repository]: http://gitorious.org/scripts/subrender
  [vilified PlayStation 3]: http://geohotps3.blogspot.com/2010/03/wait-you-are-removing-feature.html
  [able to play]: http://www.deanbg.com/AviAddXSub/index.php
  [OpenDML]: http://en.wikipedia.org/wiki/OpenDML
  [XSUB subtitles]: http://wiki.multimedia.cx/index.php?title=XSUB
  [an encoder]: http://git.ffmpeg.org/?p=ffmpeg;a=blob;f=libavcodec/xsubenc.c
  [SubRip]: http://en.wikipedia.org/wiki/Subrip
  [SubStation Alpha]: http://en.wikipedia.org/wiki/SubStation_Alpha
  [AVIAddXSubs]: http://www.calcitapp.com/AVIAddXSubs.php
  [Wine]: http://www.winehq.org/
  [ANSI]: http://en.wikipedia.org/wiki/Windows-1252
  [Shift-JIS]: http://en.wikipedia.org/wiki/Shiftjis
  [Cairo]: http://www.cairographics.org
  [here]: http://people.igalia.com/aperez/files/subrender.txt
  []: http://blogs.igalia.com/aperez/files/2010/04/subrender-example.png
