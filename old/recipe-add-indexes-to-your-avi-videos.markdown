Title: Recipe: Add indexes to your AVI videos
Date: 2008-08-06 18:57
Author: aperez
Category: Igalia
Tags: cli, multimedia

Those days I have been using [xvidcap][] to make nice screencasts, and
my `xvidcap` build generates adding indexes to generated AVI files, so
they are not seekable. Fortunately we can (ab)use `mencoder` to add
indexes to them without re-encoding our nice videos. Change to the
directory containing your videos and just cook the following shell
recipe:

```bash
for i in *.avi ; do
   mv "$i" "$i.orig" &&   
  mencoder "$i.orig" -forceidx -oac copy -ovc copy -o "$i" &&   
  rm "$i.orig"
done
```

If you have a lot of video files you can take your time to enjoy a cup
of coffee in the meanwhile. On command completion you will have indexed
(and seekable!) video files.

  [xvidcap]: http://xvidcap.sourceforge.net/
