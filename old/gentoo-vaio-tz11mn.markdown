title: Gentoo life with a Vaio TZ11MN/N
date:  2007-10-22 20:01
tags:  floss gentoo
Category: はりおの階

Last week I received a shiny new Sony [Vaio
TZ11MN/N](http://vaio.sony.es/view/ShowProduct.action?product=VGN-TZ11MN%2FN&site=voe_es_ES_cons&category=VN+TZ+Series)
laptop, which I expect to last at least the same as my old iBook G3:
about six years. This is totally feasible because I will use it for
development, net surfing, some office tasks and a bit of
[gaming](http://www.openttd.com). The very first thing I did once the
computer booted for first time was **not accepting** the Windows Vista
license; instead I did put a [Gentoo](http://www.gentoo.org) 2007.0
mini-install CD in the optical drive and fired up the installation
proccess. After some tinkering those are my first impressions on how the
thing performs.

Kernel support is quite good for most of the hardware, which runs pretty
fast, with some rough edges. Apart from the following, the rest does the
(desired) “just works” thing:

-   On bootup, audio does not play through the speakers. If you plug a
    set of headphones and unplug them then sound comes alive. My guess
    is that this is some kind of weird behavior or something which does
    not get initialized in the [Intel HD-Audio ALSA
    driver](http://bugtrack.alsa-project.org/main/index.php/Matrix:Soundcard-Tags).
-   Two hotkeys of the front panel do work: the “AV Mode” and “Eject”
    keys emit ACPI events. The other ones do not generate events at all,
    neither standard input layer events nor ACPI hotkey events.
    Regarding the hotkeys which can be activated using the “Fn” key,
    some of them generate standard events, and others are generating
    *two* ACPI events. Messy, but works.
-   The integrated card reader does not work for me. At least the Memory
    Stick™ slot gets recognized by the kernel's MTD layer, but I cannot
    give it a try because I have no cards of this kind. On the other
    hand, the SD card reader is not even recognized. Maybe
    [this](https://launchpad.net/ubuntu/+source/linux-source-2.6.20/+bug/84540)
    has something to do with it.
-   Integrated webcam should work with the [ry5u870
    driver](http://lsb.blogdns.net/ry5u870/), but as the website is down
    I was not even able of downloading them. The generic
    [Linux-UVC](http://linux-uvc.berlios.de/) driver recognizes the
    gadget, but it isn't able of properly driving the hardware (i.e. the
    driver loads, detects the camera but does not attach because of the
    device is yet unsupported by the driver).
-   Suspend-to-RAM is giving me the usual nightmare of headaches. Apple
    PowerPC machines are horribly easier to set-up properly, I only
    needed to install and load the “pbbuttonsd” daemon in my old iBook
    to make it suspend and come back to life smoothly. ACPI needs to get
    this one better done. I tried the manual method, and it works but
    the video card is not wakened up; then I tried the tricks pointed
    out in the kernel documentation (fiddling with the “acpi\_suspend”
    boot setting, using “vbetool”, disabling framebuffer, and so on),
    and now I trying the [Gnome Power
    Manager](http://www.gnome.org/projects/gnome-power-manager/), which
    seems to do the right thing... *sometimes*. But I do not want to
    depend upon something which in turn needs X11 running just to
    suspend the machine!
-   Well, this is it less important, but the
    [ipw3945](http://ipw3945.sourceforge.net/) wireless card has
    proprietary firmware and a binary-only daemon which must be running
    or the card won't work at all. Despite that, support is good and the
    card works nicely, and it even has a hardware switch to turn off the
    transmitter, which is nice to save battery.

The issues which annoy me are the one regarding the speakers and the
suspend-to-RAM weirdness. I can live with the other ones, but I
definitely need at least suspend-to-RAM working. Apart from the said
things, the laptop is a very nice piece of hardware: it weights less
than 1.2kg and even being a tiny thing with a 11-inch display it has a
great LED-based TFT, which looks terrific and has very good contrast
even at 50% of brightness. The DVD burner is quite fast, albeit being
attached to the USB bus, and the keyboard has a good feel. The trackpad
is correct, but I would like it better if it were a bit wider, to match
the aspect ratio of the screen. Ah! And the battery lasts about 5-6
hours.
