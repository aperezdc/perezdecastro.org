Title: Maintaining your LVM snapshots clean
Date: 2008-07-04 20:02
Author: aperez
Category: Igalia
Tags: bash lvm

As [I have written before][] snapshots is a extremely fast and
convenient way of perfoming *live* backups which can be mounted and
handled like any other filesystem. But I also told you that LVM snaphots
could render themselves as unusable when they run out of free blocks.
Today I hacked up a quick script which automagically increments sizes of
snapshots logical volumes. Just drop the following snippet into
`/etc/cron.hourly` and relax:

```bash
#! /bin/bash

THRESHOLD="80"
INCREMENT="15"

set -e
IFS=':'

/sbin/lvs --noheadings --units M --separator : |   
while read lv vg attr lsize origin snapp move log copyp
do
  # Check whether this is a snapshot or not
  [ "${snapp}" ] || continue

  snapp=${snapp%.*}
  lv=${lv// /}

  # Check whether the thing needs resizing
  [ "${snapp}" -ge "${THRESHOLD}" ] || continue

  lsize=${lsize%.*}
  isize=$(( INCREMENT * lsize / 100 ))
  echo "lvresize -L +${isize}M ${vg}/${lv}"
  /sbin/lvresize -L "+${isize}M" "${vg}/${lv}"
done
```

You can change the following settings:

- `THRESHOLD` is the percent of usage which triggers resizing. When
  actual usage is greater than this value snapshots will grow.
- `INCREMENT` is used to calculate how much size is added to the
  volume, it is a percent of the current volume size.

Of course the script could be improved (i.e. it could check whether
there are space for growing in the volume group), but this naïve
implementation is enough to make me happy and not to worry about
checking status of my snapshots periodically :D

  [I have written before]: http://blogs.igalia.com/aperez/?p=9
