Title: Introducing SnabbWall
Date: 2015-12-31 20:00:00
Author: aperez
Tags: igalia, snabbswitch, snabbwall

If you have been following the blogs of my colleagues [Katerina](http://luatime.org), [Diego](http://blogs.igalia.com/dpino/), and [Andy](http://wingolog.org) it should not be a surprise for you to know that in [Igalia](http://www.igalia.com) we have a small —and awesome!— team working with [Snabb Switch](http://snabb.co) to provide novel software–mostly solutions for networking.

We are now starting the development of [SnabbWall](http://snabbwall.org) is an *application-level* (Layer-7) firewall *suite* for Snabb Switch, and yours truly happens to be the lead developer, so I figured out this is a good moment to introduce the project, which is kindly sponsored by the [NLnet Foundation](http://nlnet.nl/).

<figure style="text-align:center">
  ![](http://snabbwall.org/images/igalia-logo.png)
  <span style="margin-left:20px">&nbsp;</span>
  ![](http://snabbwall.org/images/nlnet-logo.gif)
</figure>


The one-minute introduction to Snabb Switch
-------------------------------------------

Snabb Switch (which I'm going to abbreviate as *SnS*, it's getting long to type it!) works by taking over network interfaces, bypassing the kernel drivers, and using its own. When used to implement a certain network functionality, what your (SnS) program “sees” is no more than streams of raw packets. Gone are the TCP/IP stack, BSD sockets, and all the other functionality provided by the operating system kernel to user space programs. Heck, you even need to roll your [own](https://github.com/SnabbCo/snabbswitch/tree/master/src/apps/intel) [drivers](https://github.com/SnabbCo/snabbswitch/tree/master/src/apps/solarflare)! There is nothing in there but the hardware waiting to have streams of electrons blasted through it. But things go *real* fast in there without the overhead of a traditional network stack, so, despite the void, it is a good place to massage packets and pass them along.

It is fortunate that empty spaces do not last long as such: SnS comes with a set of [built-in applications](https://github.com/SnabbCo/snabbswitch/tree/master/src/apps), which can be combined in different ways to achieve our (networking-related) goals. For example, we could pick the [bridge application](https://github.com/SnabbCo/snabbswitch/tree/master/src/apps/bridge), combine it with the driver for our network interfaces, and *(bam!)* we have a super fast Ethernet bridge. And even more.

Now is when we remember that SnS is *soft*ware component. That means that it is code running in a computer, as a normal user space program, which can be modified. Why not adding packet filtering capabilities to that bridge we built, so one of the ports only accepts certain kinds of traffic? We could write a small SnS application which only allows HTTP traffic to pass by:

```lua
local ethernet = require("lib.protocol.ethernet")
local datagram = require("lib.protocol.datagram")
local link = require("core.link")

local HttpOnly = {
  new = function (self) return setmetatable({}, self end;
  push = function (self)
    local n = math.min(link.nreadable(self.input.input),
                       link.nwritable(self.output.output))
    for _ = 1, n do
      local p = link.receive(self.input.input)
      local d = datagram:new(p, ethernet)
      d:parse_n(2)
      local ip4 = d:stack()[2]
      if ip4:sport() == 80 or ip4:dport() == 80 then
        link.transmit(self.output.output, p)
      end
    end
  end;
}

```

Well, that was not long. But you can see where this is going: if we are serious about making a full–fledged firewall, our cute little program is going to mutate into something hairy. We would like to have something like [netfilter](http://netfilter.org/) or, even better, something neater which allows to specify rules in a higher level syntax like [OpenBSD's Packet Filter](http://www.openbsd.org/faq/pf/filter.html), package it as a SnS application, and have it ready for reusing.


Dear readers: meet SnabbWall
----------------------------

SnabbWall is —will be, when completed— a set of SnS *applications* and *programs*. Applications are reusable in your own designs, like every other SnS application.

<figure class="image">
  ![](http://snabbwall.org/images/diagrams/arch-blocks.png)
  <figcaption>SnabbWall components</figcaption>
</figure>

The **L7 Spy** application is capable of identifying protocol data flows (that is, it works in at the [application level](https://en.wikipedia.org/wiki/Application_layer), or Layer-7) but other than that packets just flow through it. The idea here is that sometimes it is interesting to just know which kind of traffic passes through network, for example to gather statistics. If a packet is determined to belong to a certain protocol, ancillary metadata is attached to the packet. The way metadata is handled does not ever modify the packet itself, so applications which are not designed to handle it do not need to be modified.

On the other hand, the **L7 Firewall** application implements the actual logic of matching packets against a set of rules which determine what to do with each one of them. What is special about this application is that, on top of what other filtering solutions like [pflua](http://wingolog.org/archives/2014/09/02/high-performance-packet-filtering-with-pflua) may offer, it also allows to match the additional metadata generated by L7 Spy — if present.

Note that it is not at all necessary to use both applications in tandem: they can function independently, to allow others to mix-and-match them as desired. Yet, they are designed to work together, and SnabbWall also provides a standalone program (`snabb wall`) which implements a complete application-level firewall.


Deep Space 9
------------

Inferring the protocol to which a packet belongs is a tough job: it requires inspecting the whole contents of each packet, including decoding of protocol fields and reading the data payloads. This is typically referred to as [deep packet inspection](https://en.wikipedia.org/wiki/Deep_packet_inspection) (DPI), and if the term makes you feel uneasy it is not without reason: DPI is used by evil governments and faceless corporations to eavesdrop on us *netizens*, or by greedy Internet service providers to cap some kinds of traffic thus attacking net neutrality. Which does not mean that DPI is bad *per se*: like any other tool, it can be used also to pursue noble purposes. Who wouldn't want their video calls to be smooth thanks to the network giving priority to real time audio and video after all? DPI is just one more tool, and as such it can be misused — [so can a hammer](https://www.priv.gc.ca/information/research-recherche/2009/lewis_200905_e.asp). But implementing DPI algorithms is not among the goals of the project — if possible. A hammer had to be chosen.

There are Free Software solutions which already provide DPI functionality. After evaluating the candidates, it was decided that SnabbWall (in particular, the L7 Spy application) would use [nDPI](http://www.ntop.org/products/ndpi/). It is a well-maintained, reliable piece of software, with a C API which lends itself to be wrapped using [LuaJIT's FFI](http://luajit.org/ext_ffi_api.html). It has a long story —for a piece of software— as it started life as OpenDPI, which itself was a trimmed down version of a commercial product, and along its multiple lives it has been tweaked to the point that nDPI provides the best protocol/application detection of the pack.

Here is a commented shortlist of other implementations which were evaluated before settling on nDPI:

* [l7-filter](http://l7-filter.sourceforge.net/) is designed to be used along with the rest of the [netfilter](http://netfilter.org) stack. That is, in kernel space and reusing components of the Linux kernel, which makes it unsuitable to use in user space.
* [Hippie](http://hippie.cvs.sourceforge.net/viewvc/hippie/), apart from being kernel-only, seems super abandoned: last commit in 2008, and having to use CVS to check out the code is guaranteed to give chills to anyone.
* [OpenDPI](https://code.google.com/p/opendpi/) is [no longer available](http://lastsummer.de/bye-bye-opendpi/). It is possible to find a [copy](https://github.com/thomasbhatia/OpenDPI) of the latest version of the source code published under the LGPL, but nevertheless the project is abandoned and unmaintained.
* [nDPI](http://www.ntop.org/products/ndpi/) itself is an improved fork of OpenDPI, actively maintained by the [ntop](http://www.ntop.org/) developers. The inferred protocols and applications for inspected packets are consistently the best among the solutions based on Free Software.
* [libprotoident](http://research.wand.net.nz/software/libprotoident.php) uses an interesting technique dubbed *Lightweight Packet Inspection* (LPI): instead of looking at the whole payload, it only checks the first four bytes of each packet. This implementation is very interesting because it ensures that payload data does not need to be read in full without sacrificing much on the side of detection reliability, which surely looks better in the eyes of those concerned about potential eavesdropping.
* [SPID](http://sourceforge.net/projects/spid/) also follows a different approach which does not read packet payloads in full, using statistical data instead. Unfortunately it is just a prototype.

*(For an exhaustive discussion of some of the options outlined, I recommend reading through the “Independent Comparison of Popular DPI Tools for Traffic Classification” paper by Tomasz Bujlow, Valentín Carela-Español, and Pere Barlet-Ros — which is [available in PDF](http://tomasz.bujlow.com/publications/2014_journal_elsevier_comnet_independent_comparison.pdf).)*


Coda
----

As mentioned, the project has just been started and so far I have been able to put up [its website at snabbwall.org](http://snabbwall.org), and work on the [design](http://snabbwall.org/design/) of the system. There is also a [roadmap](http://snabbwall.org/roadmap/) which I plan to keep updated as the project progresses, though I expect that the tech-savyy readers may prefer to [delve into the code at GitHub](https://github.com/aperezdc/snabbswitch).

At this very moment I am already starting to write the Lua binding for nDPI, using the handy [LuaJIT FFI](http://luajit.org/ext_ffi_api.html), which I am trying to keep independent from the rest of SnabbWall. Hopefully we will be able to release it as a separate component. Stay tuned!

