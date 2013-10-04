Title: More btrfs goodness: snapshots
Date: 2008-06-26 00:42
Author: aperez
Tags: btrfs, cli, igalia, connectical

As I am currently working with KVM [KVM][] and I will have some big disk
image files hanging around, I thought it could be a good opportunity to
give a try to the [`btrfs`][] snapshot and subvolume support.

First of all: snapshots and subvolumes *are the same* to `btrfs`. To be
fair: snapshots are *subvolumes with initial content*. The nice thing
about btrfs is the Copy-On-Write (COW) semantics: snapshots do not take
physical space until blocks are overwritten, and only new versions of
overwritten blocks are allocated from free space. This is a lot similar
to KVM/Qemu snapshots when dealing with images in the `qcow2` format.
The difference is that you can *mount* a `btrfs` volume: you get
features designed for virtualization right on the filesystem level! Once
again old technology is applied in a novel way :-)

I have a `btrfs` volume mounted at `/mnt/misc`, and a 1GB Debian “Etch”
image and a file with some notes about the image:

```
# ls -l /mnt/misc
-rw-r--r-- 1 root root 1000000000 2008-06-24 20:44 etch-base.img
-rw-r--r-- 1 root root         60 2008-06-24 18:35 etch-base.txt
```

Now let us create a snapshot named `snappy`:

```
# btrfsctl -s snappy /mnt/misc
# ls -l /mnt/misc
-rw-r--r-- 1 root root 1000000000 2008-06-24 20:44 etch-base.img
-rw-r--r-- 1 root root         60 2008-06-24 18:35 etch-base.txt
```

Hey! Wait a second! Nothing seems to happen!... This is due to all
subvolumes and snapshots hanging from the filesystem root, and the
`default` subvolume is mounted (you guessed it) *by default*. Let's
remount another subvolume:

```
# umount /mnt/misc
# mount -o subvol=snappy /dev/hda1 /mnt/misc
# ls -l /mnt/misc
-rw-r--r-- 1 root root 1000000000 2008-06-24 20:44 etch-base.img
-rw-r--r-- 1 root root         60 2008-06-24 18:35 etch-base.txt
```

Nothing impressive... now for the fun part we will add some garbage, and
mount *all* the subvolumes at once:

```
# touch /mnt/misc/hello-btrfs.txt
# echo 'btrfs rocks' >> /mnt/misc/etch-base.txt
# umount /mnt/misc
# mount -o subvol=. /dev/hda1 /mnt/misc
# ls /mnt/misc
default  snappy
```

Now the mount point shows a directory for each subvolume, and the files
are really there:

```
# ls /mnt/misc/*
/mnt/misc/default:
etch-base.img  etch-base.txt

/mnt/misc/snappy:
etch-base.img  etch-base.txt  hello-btrfs.txt
```

Now please run `df -h /mnt/misc` by yourself and get surprised: only
about 1GB of physical space is really in use. In fact that can even be
less than 1GB, as `btrfs` supports sparse files as well (if there are
“gaps” they do not take physical space). Final remark: you can also make
snapshots of snapshots.

  [KVM]: http://kvm.qumranet.com/kvmwiki
  [`btrfs`]: http://btrfs.wiki.kernel.org/
