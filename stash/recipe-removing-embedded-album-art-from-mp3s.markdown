Title: Recipe: Removing embedded album art from MP3s
Date: 2011-11-15 02:01
Author: aperez
Category: Igalia
Tags: cli, multimedia, music, python

**Update:** I made [a Python script][] that will do the same as the
command below, plus it will dump the embedded cover images in those
directories which do not contain a cover image file already. It can
process \~35GB of music in less than 15 seconds. Who said Python is
slow? :-D

This is useful for those situations in which one does not care about
embedded album art in MP3 files. For example, when copying them on
portable audio players it may be good to avoid the extra payload of the
picture so more files can be squeezed in the —probably limited— device
memory. Also, each song from the *same album* has *exactly the same*
picture attached, effectively replicating it and wasting disk space;
therefore one may prefer to store `cover.jpg` file in the same folder
instead. Last but not least, most Open Source media players will ignore
embedded album art, so it is of little use for those of us using
otherwise fine players like [Rhythmbox][].

Thankfully, it is possible to completely remove those embedded album art
images from MP3s in a non-destructive way. To batch-process a music
library one can use the `mid3v2` tool included with the exhaustive and
powerful [Mutagen][] tag editing library:

    find ~/Music -iname '*.mp3' -print0 | xargs -0 mid3v2 --delete-frames=PIC,APIC

By the way, change `~/Music` to whatever the location of you music
library is ;-)

**Additional infos**

-   [Reference of ID3 tag frames.][]
-   ID3v1 tags are evil, `mid3v2 --convert --delete-v1` is your friend
    and will turn then into nice ID3v2 tags.
-   List of Mutagen-supported frames can be obtained with
    `mid3v2 --list-frames`.

  [a Python script]: https://gist.github.com/1368426
  [Rhythmbox]: http://projects.gnome.org/rhythmbox/
  [Mutagen]: http://code.google.com/p/mutagen/
  [Reference of ID3 tag frames.]: http://www.id3.org/id3v2-00
