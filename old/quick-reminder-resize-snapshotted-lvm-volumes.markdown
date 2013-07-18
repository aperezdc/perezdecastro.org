Title: Quick reminder: Resize snapshotted LVM volumes
Date: 2008-07-15 17:11
Author: aperez
Category: Igalia
Tags: cli, lvm

Just in case you did not know about that, I spent some minutes today
figuring out how to resize a LVM logical volume there are snapshots of
it: the volume cannot be active. This is a pity if your root filesystem
is *inside* a logical volume. Fortunately, you can stop the bootup
process of recent Debian installations *in* the initial RAM disk by
passing `break=mount`; unfortunately this minimal system has the
`vgchange` tool (needed to start/stop volumes) but it *does not* have
`lvresize` (guess what it is needed for?).

Finally I ended up firing up the bootup process from a Debian
“netinstall” CD, entered `rescue` in the bootloader prompt and
**switched to the second console** just after the installer detects
hardware and before it mounts disks. Then it was only a matter of
typing:

     # vgchange -an vg
     # lvresize -L +300M vg/base

Then reboot the installed system and make the XFS filesystem grow with:

     # xfs_growfs /

...and you are done :)
