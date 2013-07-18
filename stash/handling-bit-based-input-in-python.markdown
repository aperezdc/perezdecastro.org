Title: Handling bit-based input in Python
Date: 2010-04-26 04:05
Author: aperez
Category: Igalia
Tags: python

What [started as a toy script to handle rendering subtitles][] is
getting me to make some interesting data handling in [everyone's
favourite language][]. As a first step to better understand the [XSUB][]
subtitle format, I decided to add support for loading a XSUB stream and
rendering each frame to a PNG.

XSUB uses a funny RLE encoding, where the length of each run is encoded
as a *n*-bit unsigned integer, where *n* is variable, followed by two
bits which are an index into a 4-colour palette. Usually data is read
one byte at a time, and data is aligned to byte boundaries, so there is
nothing to help with this kind of unaligned data in the Python standard
library.

My solution was to add a [BitStream][] class to my `sublib.util`
package, which handles reading an input stream in a bit-by-bit fashion.
It can be used this way:

    from sublib.util import BitStream
    bs = BitStream(file("/dev/urandom", "r"))
    print hex(bs.get_bits(4))
    print hex(bs.get_bits(7))
    print hex(bs.peek_bits(3))
    print hex(bs.get_bits(12))

(The example is somewhat pointless, but you can get the point — pun
intended.)

And now, what I need to do is proper XSUB frame decoding, because my
current results are not very good. Just judge by yourself:

[![][]][]

Once I get to the point where I can render XSUB frames, next steps are:

1.  Add write support to `BitStream`
2.  Write the code to encode XSUB frames
3.  Improve the rendering code so no big blank areas are left in frames,
    and use the placement fields of subtitle frames to position the
    subtitle frame on the screen.

Once that is done, Subrender will (hopefully) be useable :-D

  [started as a toy script to handle rendering subtitles]: http://blogs.igalia.com/aperez/2010/04/surrender-to-subrender/
  [everyone's favourite language]: http://www.python.org
  [XSUB]: http://wiki.multimedia.cx/index.php?title=XSUB
  [BitStream]: http://gitorious.org/scripts/subrender/blobs/master/sublib/util.py#line82
  []: http://blogs.igalia.com/aperez/files/2010/04/out.png
