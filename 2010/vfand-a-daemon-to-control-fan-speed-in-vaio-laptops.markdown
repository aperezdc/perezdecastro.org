Title: vfand: A daemon to control fan speed in Vaio laptops
Date: 2010-07-27 20:45
Author: aperez
Tags: vfand, igalia

Today I got tired of getting frequent lock-ups in my laptop, a [Vaio
TZ11MN/N][] which has been serving me just fine the during the past
three years. I decided to investigate a bit because the machine was
quite hot, and after some digging I found that the fan speed was being
kept below 45, by reading from `/sys`. For example:

```
cat /sys/devices/platform/sony-laptop/fanspeed
44
```

Then I noticed that writing to the file would also work, but the
embedded controller would insist in lowering the speed, so I ran the
following loop from the shell:

```bash
while sleep 5 ; do
   echo 200 > /sys/devices/platform/sony-laptop/fanspeed
done
```

That snip caused the fan to stay running at a higher speed, and the
laptop temperature started to fall slowly. Then I tried [fancontrol][],
without luck: the fans in my TZ11 cannot be controlled with it. Then I
decided to write my own, and [vfand][] was born.

Even when some temperature sensors are there (e.g. the one in the CPU
die), I found no easy way of determining the *overall* temperature of
the machine using entries from `/sys`. Next was to determine which
driver is in charge of the fan entry under `/sys`, to check whether it
can do something else. The fan entry is managed by the [sonypi][]
driver, which actually does support opening `/dev/sonypi` and getting
the temperature using an `ioctl` called `SONYPI_IOCGTEMP`. It looked
fine, so I implemented my little daemon in terms of `ioctl` on that
device, so it should would with all Vaio laptops supported by the
driver.

The speed control algorithm is quite simple at the moment, but it works
fine for me:

-   When the temperature is less than a user-configurable value (35º C
    by default), the fan speed is set to the minimum possible value.
-   When the temperature is above a user-configurable value (55 ºC by
    default), the fan speed is set to the maximum possible value.
-   If the temperature is in between the configurable values, then a
    linear formula is used to calculate the speed. As the temperature
    raises, the fan speed will be raised, too (and vice versa).

The daemon is naïve, so it will log errors to the standard error stream,
and it will not detach itself from the controlling terminal. An option
is running it from `/etc/rc.local` until I add an init script which uses
`start-stop-daemon` (or something else) to launch it.

Another option, which is a bit bizarre but will ensure that it is always
running even if it does, is doing:

```bash
echo 'vf:2345:respawn:/usr/bin/vfand' >> /etc/inittab
telinit q
```

Last, but not least, I have already uploaded a simple, working package
to [our APT repository][].

I hope this is useful for some other Vaio users out there.

  [Vaio TZ11MN/N]: http://www.small-laptops.com/sony-vaio-tz11/
  [fancontrol]: http://linux.die.net/man/8/fancontrol
  [vfand]: http://gitorious.org/vfand/
  [sonypi]: http://lxr.linux.no/linux+v2.6.34.1/drivers/char/sonypi.c
  [our APT repository]: http://apt.igalia.com
