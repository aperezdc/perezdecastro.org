Title: Light charset detection (mostly CJK)
Date: 2009-07-03 13:32
Author: aperez
Category: Igalia

What happens when you have a pile of text you want to convert to a
*sane* encoding like [UTF-8][] and you do not know which encoding is
being used? In general, you have two options:

-   Trying all possible encodings. This may be more or less difficult
    depending on the language in which the text is written: some
    languages can be written in a number of encodings. For example
    encoding [covering cyrillic characters is a mess][]: Macintosh
    Russian encoding, Windows CP1251, KOI-8 (and several variants of
    it), ISO 8859-5...
-   Asking the author of the text. This may not be feasible at all, as
    you may even happen to not know who the author is :-(

But there is another option: detect it programmatically. This one of the
things that [Enca][] can do for a variety of languages. But, just for a
second, imagine that you want a similar funcionality using a lighther
approach, *and* you are mostly handling Unicode and CJK text
(Chinese-Japanese-Korean) in different encodings, *and* you prefer a
lighter solution than Enca... enter [GChardet][], a wrapper on top of
the [Mozilla encoding detection routines][] (as used e.g. by Firefox)
with a plain C interface designed to blend nicely with code using
[Glib][].

This is a nice hack I did in a couple of hours by adding some
definitions in fake header files, because the detection code is not
totally isolated from the rest of the Mozilla code base. Also, to
provide the C-only API I had to make some subclassing and override a
pair of methods. After that, adding the “G-frienly” API on top was
straightforward. The thing I like most about this solution is that it
can be compiled to a small library of \~120kB in amd64, and the original
Mozilla sources were not touched at all.

Just in case this could be useful for someone else, I have [uploaded it
to Gitorious][GChardet]. Feel free to clone the repository, use it, and
provide feedback. By the way: as this uses Mozilla code, I have set the
license to [MPL][].

  [UTF-8]: http://en.wikipedia.org/wiki/Utf-8
  [covering cyrillic characters is a mess]: http://czyborra.com/charsets/cyrillic.html
  [Enca]: http://freshmeat.net/projects/enca/
  [GChardet]: http://gitorious.org/gchardet
  [Mozilla encoding detection routines]: http://www.mozilla.org/projects/intl/detectorsrc.html
  [Glib]: http://library.gnome.org/devel/glib/
  [MPL]: http://www.mozilla.org/MPL/MPL-1.1.html
