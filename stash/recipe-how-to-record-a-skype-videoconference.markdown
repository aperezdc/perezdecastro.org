Title: Recipe: How to record a Skype videoconference
Date: 2008-09-02 14:05
Author: aperez
Category: Igalia

This recipe could also be entitled “How to realize that Linux audio can
be improved”, or even better “2008: A sound odyssey”. [One][] of my
colleagues at work needed to record audio *and* video out of [Skype][]
conferences under GNU/Linux. Getting to record the desktop is not as
hard as one could think, thanks to utilities like [RecordMyDesktop][]
(or even [other][] available [options][]). The hard part has to do with
sound. Period.

Today the recipe comes with a rant, but let's find out how to record
audio first (tested with Ubuntu 8.04). You will need to:

1.  Install packages:
    -   libjack-dev
    -   libasound2-dev
    -   jackd
    -   make

2.  Manually build the [ALSA][] plugins package (Ubuntu [does not
    include the JACK plugin][]). Grab `alsa-plugins-X.Y.Z.tar.bz2` and
    do:

         cd alsa-plugins-*
         ./configure --prefix=/usr
         make
         cp jack/.libs/libasound_module_pcm_jack.so /usr/lib/alsa-lib

3.  Edit (or create) `~/.asoundrc` and make sure it has the following
    contents:

        pcm.!default {
            type plug
            slave { pcm "jack" }
        }

        pcm.jack {
            type jack
            playback_ports {
                0 alsa_pcm:playback_1
                1 alsa_pcm:playback_2
            }
            capture_ports {
                0 alsa_pcm:capture_1
                1 alsa_pcm:capture_2
            }
        }

        ctl.mixer0 {
            type hw
            card 0
        }

4.  Run the JACK daemon *with monitoring enabled*:

        jackd -d alsa -d hw:0,0 -r 44100 -S -m

5.  Launch Skype, open the options screen and select `jack` as input
    *and* output device.
6.  In the RecordMyDesktop preferences screen, select JACK as audio
    source and use Ctrl-Click to mark the `system:capture_1` and
    `alsa_pcm:monitor_1` plugs. Names may vary, just make sure you
    choose both the left channel of the playback monitor and the left
    channel of the input source.
7.  Now you are ready to record both audio and video with
    RecordMyDesktop.

Let's face it: the amount of sound-related systems is a growing problem
of the FLOSS community. Of course we *do* need a low-level interface for
hardware, and [ALSA][] settled a high-quality standard, providing both
good performance and hardware support. The problem is when audio reaches
user space: there is a plethora of interfaces for audio which do not
more than add complexity and exhacerbate users. In just two seconds I
can recall about [Esound][], [Pulseaudio][], [JACK][], ALSA [dmix][],
[aRts][], [NAS][], [libao][], [Portaudio][], [OpenAL][], [YIFF][]... In
short: a true mess. (Side note: I spent more time finding webpages than
remembering about them.)

I wish some day this situation gets fixed and some Audio System To Rule
the Others™ (ASTRO) is the one only interface for audio in the open
source world. Ideally it would blend the nice routing capabilities of
JACK with the wide adoption and desktop oriented feature set that
Pulseaudio is getting lately. Volunteers, anyone?

***Update, 2008-09-04:** Fix library names, reordered steps. (Kudos go
to Andrés Maneiro for spotting those issues.)*

  [One]: http://nosolosoftware.es/
  [Skype]: http://skype.com
  [RecordMyDesktop]: http://recordmydesktop.sourceforge.net
  [other]: http://xvidcap.sourceforge.net/
  [options]: http://live.gnome.org/Istanbul
  [ALSA]: http://alsa-project.org
  [does not include the JACK plugin]: https://bugs.launchpad.net/ubuntu/+source/alsa-plugins/+bug/84900
  [Esound]: http://www.tux.org/~ricdude/EsounD.html
  [Pulseaudio]: http://0pointer.de/lennart/projects/pulseaudio/
  [JACK]: http://www.jackaudio.org
  [dmix]: http://alsa.opensrc.org/home/w/org/opensrc/alsa/index.php?title=DmixPlugin
  [aRts]: http://www.arts-project.org/
  [NAS]: http://radscan.com/nas.html
  [libao]: http://www.xiph.org/ao
  [Portaudio]: http://www.portaudio.com
  [OpenAL]: http://www.openal.org
  [YIFF]: http://freshmeat.net/projects/yiff/
