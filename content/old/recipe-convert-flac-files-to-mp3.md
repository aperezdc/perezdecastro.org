+++
title = "Recipe: Convert FLAC files to MP3"
date = 2010-06-28
taxonomies.categories = ["igalia"]
taxonomies.tags = ["cli", "gstreamer", "multimedia"]
+++

This is another recipe-alike, self-reminder post. This one converts all
FLAC files in a directory to MP3, which I do hardly now (because I have
OGG-Vorbis support almost [everywhere][]), but is still useful for
some hardware players. Also, note that this properly saves ID3 tags and
song length information (it took me some time to find about `xingmux`,
which is in [gst-plugins-ugly][]):

```bash
for i in *.flac ; do
  gst-launch-0.10 filesrc location="${i}" 
    ! flacdec ! audioconvert ! lame vbr=4 bitrate=224 
    ! xingmux ! id3mux ! filesink location="${i%.flac}.mp3"
done
```

Copy, paste, and you are done! ;)

  [everywhere]: http://en.wikipedia.org/wiki/N900
  [gst-plugins-ugly]: http://www.gstreamer.net/data/doc/gstreamer/head/gst-plugins-ugly-plugins/html
