Title: Reminder: ffmpeg tolerance to bitrate/fps combinations
Date: 2009-02-04 14:44
Author: aperez
Category: Igalia
Tags: cli, ffmpeg

Today I hitted a [known issue][] of the [ffmpeg][] program (also known
as “the Swiss Army knife of media editing”): the *tolerance* setting,
which is controlled by the `-bt` switch *must* be higher than the value
of the *bitrate divided by the frames per second*. In short:

      tolerante > bitrate / fps

I wonder why the heck the setting is not automatically adjusted...

  [known issue]: http://lists.mplayerhq.hu/pipermail/ffmpeg-devel/2008-February/041492.html
  [ffmpeg]: http://ffmpeg.org/
