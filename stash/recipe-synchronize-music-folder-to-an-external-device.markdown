Title: Recipe: Synchronize music folder to an external device
Date: 2012-01-30 18:44
Author: aperez
Category: Igalia
Tags: bash, cli, multimedia, music, rsync

This is easy to come up with, but as I end up having to dig through
`rsync`'s manual page to find the relevant options to copy my music to a
device that has a non-Unix filesystem, it may be good to just write the
recipe down here. Note that I am assuming that the file system in the
device does not permission bits and ownerships (e.g. FAT), so those are
*not* to be kept, and using `rsync --archive` is not a good option
`rsync` will fail to set those extra attributes.

    rsync --progress --delete -vrtxmhi ~/Music/ /media/${target_device}/Music/

This is what I use to keep my music library synchronized across my
laptop, my phones and the extra backup in an external hard drive :-)
