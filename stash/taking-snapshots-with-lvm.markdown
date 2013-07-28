Title: Taking snapshots with LVM
Date: 2008-07-03 12:29
Author: aperez
Category: Igalia
Tags: cli, lvm

Let us suppose we have a volume group named `vg`. Let us suppose we have
a logical volume named `base` which holds our precious data in a 800 MB
file system which has support for freezing (e.g. XFS). So we can take
snapshots at any time with a single command:

    # lvcreate --size 200M --snapshot --name snappy /dev/vg/base

Now we can mount it whenever we want to recover from the saved status:

    # mount -o nouuid,ro /dev/vg/snappy /mnt

The `nouuid` option is needed for XFS filesystems, otherwise the driver
will think it is mounting the *same* filesystem and will refuse to mount
the snapshot. Take into account that:

-   Blocks in the source volume are stored on-demand in the snapshot
    volume when they are changed.
-   If mounting the snapshot in write mode, written blocks will be
    stored in the snapshot volume.
-   You can make the original filesystem grow, *but it cannot be
    shrunk*.
-   Snapshots can be grown *and* shrunk.
-   If a snapshot runs out of free blocks, it will render itself
    unusable: make sure you check its status periodically with
    `lvdisplay` and grow it as needed.

Currently I am using snapshots as a quick-come-on-let's-go backup method
for the root filesystem of a Debian installation I am using for a
project. If somethings goes wrong one can mount the snapshot and restore
files from the snapshot... or one can even boot up from a snapshot by
setting `root=/dev/mapper/vg-snappy` in the kernel command line... :D
