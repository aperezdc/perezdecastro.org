Title: Recipe: Convert FLAC files to OGG Vorbis
Date: 2010-05-19 17:05
Author: aperez
Category: Igalia
Tags: cli, gstreamer, multimedia

As with previous “recipe” posts, this one is for me to remember in the
future how to convert all [FLAC][] files in a directory to
OGG-[Vorbis][] easily. The main motivation between this is making some
lighter files to drop them in a [Nokia N900][] (at last, I have a device
that [can][] play them!) and save some disk space.

The recipe uses GStreamer's `gst-launch` command:

```bash
for i in *.flac ; do
  gst-launch-0.10 filesrc location="${i}" 
    ! flacdec ! audioconvert ! vorbisenc quality=0.5 
    ! oggmux ! filesink location="${i%.flac}.ogg"
done
```

So, just copy-and-paste the recipe above as needed :-D

  [FLAC]: http://en.wikipedia.org/wiki/Flac
  [Vorbis]: http://en.wikipedia.org/wiki/Vorbis
  [Nokia N900]: http://maemo.nokia.com/n900/
  [can]: https://garage.maemo.org/projects/ogg
