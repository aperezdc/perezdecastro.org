Title: Simple XFS and btrfs timings
Date: 2008-06-24 13:20
Author: aperez
Category: Igalia
Tags: btrfs, xfs

Last weekend I was able of emptying a partition and had the opportunity
of testing [btrfs][] for first time. I made some simple timings using
the Bash `time` builtin. The test was building a Linux kernel with the
default configuration (`make defconfig`). I timed the time needed for
unpacking kernel sources, building and removing the tree afterwards. The
results against XFS are as follows:

<table>
<thead>
<tr>
<th>
Phase

</th>
<th>
XFS (usr/sys)

</th>
<th>
btrfs (usr/sys)

</th>
</tr>
</thead>
<tbody>
<tr>
<th>
Unpack

</th>
<td>
115.2 / 6.3

</td>
<td>
38.6 / 10.3

</td>
<tr>
<th>
Build

</th>
<td>
758.6 / 90.4

</td>
<td>
667.5 / 110.1

</td>
<tr>
<th>
Remove

</th>
<td>
0.07 / 3.6

</td>
<td>
0.07 / 6.3

</td>
</tbody>
</table>
All measurements are shown in seconds, so smaller numbers means better
performance. I was surprised with how fast was unpacking kernel sources
on btrfs, so I was expecting a slightly better build time. The reason
for the similar build times can be the fact that the tools (compiler,
linker, etc) were running from a XFS partition, and that it was a
CPU-bound. Both test over XFS and btrfs were done after a clean system
boot and freshly created filesystems.

What I loved about btrfs was the ability of growing *and* shrinking the
filesystem while mounted and being accessed, which makes it a perfect
candidade for its use over [LVM][]. I still have to try out subvolumes,
live writable snapshots, and making some serious testing. Even so, btrfs
looks like a Good Thing™ to me.

  [btrfs]: http://btrfs.wiki.kernel.org/
  [LVM]: http://en.wikipedia.org/wiki/Logical_Volume_Manager
