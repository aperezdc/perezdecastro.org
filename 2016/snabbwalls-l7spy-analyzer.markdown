title: SnabbWall's Traffic Analyzer: L7Spy
date: 2016-08-18 10:51:00
author: aperez
tags: igalia, snabbswitch, snabbwall


Wow, two posts just a few days apart from each other! Today I am writing about
`L7Spy`, the application from the [SnabbWall](http://snabbwall.org) suite used
to analyze network traffic and detect which applications they belong to.
SnabbWall is being developed at [Igalia](https://www.igalia.com) with
sponsorship from the [NLnet Foundation](https://nlnet.nl). (Thanks!)

<figure style="text-align:center">
  ![](http://snabbwall.org/images/igalia-logo.png)
  <span style="margin-left:20px">&nbsp;</span>
  ![](http://snabbwall.org/images/nlnet-logo.gif)
</figure>


A Digression
------------

There are two things related to `L7Spy` I want to mention beforehand:

### nDPI 1.8 is Now Supported

The changes from the [recently released][ljndpi0.3.3] `ljndpi` v0.3.3 have been
merged into the SnabbWall repository, which means that now it also supports
using [version 1.8 of the nDPI library](https://github.com/ntop/nDPI/releases/tag/1.8).

### Following Upstream

[Snabb][snabb] follows a monthly release schedule. Initially, I thought it
would be better to do all the development for SnabbWall starting from a given
Snabb release, and incorporate the changes from upstream later on, after the
first one of SnabbWall is done. I noticed how it might end up being difficult
to [rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) SnabbWall
on top of the changes accumulated from the upstream repository, and switched
to the following scheme:

* The branch containing the most up-to-date development code is always in the
  `snabbwall` branch.
* Whenever a new Snabb version is released, changes are merged from the
  upstream repository using its corresponding release tag.
* When a SnabbWall release is done, it tagged from current contents of the
  `snabbwall` branch, which means it is automatically based on the latest
  Snabb release.
* If a released version needs fixing, a maintenance branch `snabbwall-vX.Y`
  for it is created from the release tag. Patches have to be backported or
  purposedfully made for that this new branch.

This approach reduces the burden of keeping up with changes in Snabb, while
still allowing to make bugfix releases of any SnabbWall version when needed.


L7Spy
-----

The `L7Spy` is a Snabb application, and as such it can be reused in your own
application networks. It is made to be connected in a few different ways,
which should allow for painless integration. The application has two
bidirectional endpoints called *south* and *north*:

<figure style="text-align:center">
  ![](https://perezdecastro.org/2016/app-l7spy.png)
  <figcaption>The L7Spy application.</figcaption>
</figure>

Packets entering one of the ends are forwarded unmodified to the other end,
in both directions, and they are scanned as they pass through the application.

The only mandatory connection is the receiving side of either *south* or
*north*: this allows for using `L7Spy` as a “kitchen sink”, swallowing the
scanned packets without sending them anywhere. As an example, this can be
used to connect a [RawSocket
application](https://github.com/snabbco/snabb/tree/master/src/apps/socket) to
`L7Spy`, attach the `RawSocket` to an existing network interface, and do
passive analysis of the traffic passing through that interface:

<figure style="text-align:center">
  ![](https://perezdecastro.org/2016/app-rawsocket-l7spy.png)
  <figcaption>Passive analysis made easy</figcaption>
</figure>

If you swap the `RawSocket` application with [the one driving Intel
NICs](https://github.com/snabbco/snabb/tree/master/src/apps/intel), and divert
a copy of packets passing through your firewall towards the NIC, you would be
doing essentially the same but *at lightning speed* and moving the load of
packet analysis to a separate machine. Add a bit more of smarts on top, and
this kind of setup would already look like a standalone [Intrusion Detection
System](https://en.wikipedia.org/wiki/Intrusion_detection_system)!


snabb wall
==========

While implementing the `L7Spy` application, the `snabb wall` command has also
come to life. Like all the other Snabb programs, the `wall` command is built
into the `snabb` executable, and it has subcommands itself:

```
aperez@hikari ~/snabb/src % sudo ./snabb wall
[sudo] password for aperez:
Usage:
  snabb wall <subcommand> <arguments...>
  snabb wall --help

Available subcommands:

  spy     Analyze traffic and report statistics

Use --help for per-command usage. Example:

  snabb wall spy --help

aperez@hikari ~/snabb/src %
```

For the moment being, only the `spy` subcommand is provided: it exercises the
`L7Spy` application by feeding into it packets captured from one of the
supported sources. It can work in *batch mode* —the default—, which is useful
to analyze a static [pcap](https://en.wikipedia.org/wiki/Pcap) file. The
following example analyzes the full contents of the `pcap` file, reporting at
the end all the traffic flows detected:

```
aperez@hikari ~/snabb/src % sudo ./snabb wall spy \
      pcap program/wall/tests/data/EmergeSync.cap
0xfffffffff19ba8be   18p   134.68.220.74:21769 -     192.168.1.2:26883  RSYNC
0xffffffffc6f96d0f 4538p   134.68.220.74:22025 -     192.168.1.2:26883  RSYNC
aperez@hikari ~/snabb/src %
```

Two flows are identified, which correspond to two different connections
between the client with IPv4 address `134.68.220.74` (from two different
ports) to the server with address `192.168.1.2`. Both flows are correctly
identified as belonging to the [rsync](https://en.wikipedia.org/wiki/Rsync)
application. Notice how the application is properly detected even though the
`rsync` daemon is running in port `26883` which is a non-standard one for
this kind of service.

It is also possible to ingest traffic directly from a network interface in
*live mode*. Apart from the [drivers for Intel
cards](https://github.com/snabbco/snabb/blob/master/src/apps/intel/README.md)
included with Snabb (selectable using the `intel10g` and `intel1g` sources)
there are two hardware-independent sources for [TAP
devices](https://en.wikipedia.org/wiki/TUN/TAP) (`tap`) and RAW sockets
(`raw`). Let's use a RAW socket to sniff a copy of every packet which passes
through the a kernel-managed network interface, while opening a well known
search engine in a browser using their `https://` URL:

```
aperez@hikari ~/snabb/src % sudo ./snabb wall spy --live eth0
...
0x77becdcb    2p    192.168.20.1:53    -   192.168.20.21:58870  SERVICE_GOOGLE:DNS
0x6e111c73    4p   192.168.20.21:443   -   216.58.210.14:48114  SERVICE_GOOGLE:SSL
...
```

Note how even the connection is encrypted, our nDPI-based analyzer has been
able to correlate a DNS query immediately followed by a connection to the
address from the DNS response at port `443` as a typical pattern used to
browse web pages, and it has gone the extra mile to tell us that it belongs to
a Google-operated service.

There is one more feature in `snabb wall spy`. Passing `--stats` will print a
line at the end (in *normal mode*), or every two seconds (in *live mode*),
with a summary of the amount of data processed:

```
aperez@hikari ~/snabb/src % sudo ./snabb wall spy --live --stats eth0
...
=== 2016-08-17T18:05:54+0300 === 71866 Bytes, 99 packets, 35933.272 B/s, 49.500 PPS
...
=== 2016-08-17T18:19:35+0300 === 3105473 Bytes, 2884 packets, 1.599 B/s, 0.001 PPS
...
```

One last note: even though it is not shown in the examples, scanning and
identifying [IPv6](https://en.wikipedia.org/wiki/Ipv6) traffic is already
supported.

<figure class="image">
  ![](https://perezdecastro.org/2016/let-ipv6-flow.png)
  <figcaption>Get that IPv6 flowing!</figcaption>
</figure>


What Next?
==========

Now that traffic analysis and flow identification is working nicely, it has to
be used for actual filtering. I am now in the process of implementing the
firewall component of SnabbWall (`L7fw`) as a Snabb application. Also, there
will be a `snabb wall filter` subcommand, providing an off-the-shelf L7
filtering solution. Expect a couple more of blog posts about them.

In the meanwhile, if you want to play with `L7Spy`, I will be updating
[its WIP documentation](http://snabbwall.org/refdoc.html#snabbwall-apps) in the
following days. Happy hacking!


[snabb]: https://github.com/snabbco/snabb
[ljndpi0.0.3]: https://perezdecastro.org/2016/ljndpi-0.0.3-released.html
