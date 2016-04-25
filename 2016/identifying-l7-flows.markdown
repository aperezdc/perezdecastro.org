title: Identifying Layer-7 packet flows in SnabbWall
date: 2016-04-26 22:34:00
author: aperez
tags: igalia, snabbswitch, snabbwall

Spring is here already, the snow has melted a while ago, and it looks like a
good time to write a bit about network traffic flows, as promised in my
[previous post](https://perezdecastro.org/2016/ljndi-snabbwall-sidekick.html)
about [ljndpi][ljndpi]. Why so? Well, looking at network traffic and grouping
it into logical streams between two endpoints is something that needs to be
done for [SnabbWall][swall], a suite of Snabb applications which implement a
Layer-7 analyzer and firewall which [Igalia](http://www.igalia.com) is
developing with sponsorship from the [NLnet Foundation](https://nlnet.nl).

<figure style="text-align:center">
  ![](http://snabbwall.org/images/igalia-logo.png)
  <span style="margin-left:20px">&nbsp;</span>
  ![](http://snabbwall.org/images/nlnet-logo.gif)
</figure>

*(For those interested in following only my Snabb-related posts, there are
separate feeds you can use: [RSS](https://perezdecastro.org/snabbswitch.rss),
[Atom](https://perezdecastro.org/snabbswitch.atom).)*


Going With the Flow
-------------------

Any sequence of related network packets between two hosts can be a network
traffic flow. But not quite so: the exact definition may vary, depending on
the level at which we are working. For example, an ISP may want to consider
all packets between the pair of hosts —regardless of their contents— as part
of the same flow in order to account for transferred data in metered
connections, but for SnabbWall we want “application-level” traffic flows. That
is: all packets generated (or received) by the same application should be
classified into the same flow.

But that can get tricky, because even if we looked only at TCP traffic from
one application, it is not possible just map a single connection to one flow.
Take FTP for example: in active mode it uses a *control connection*, plus an
additional *data connection*, and both should be considered part of the same
flow because both belong to the same application.  On the other side of the
spectrum are web browsers like the one you are probably using to read this
article: it will load the HTML using one connection, and then other related
content (CSS, JavaScript, images) needed to display the web page.

In SnabbWall, the assignment of packets to flows is done based on the
following fields from the packet:

* [802.1Q](https://en.wikipedia.org/wiki/802.1q) VLAN tag.
* Source and destination IP addresses.
* Source and destination port numbers.

The VLAN tag is there to force classifying packets with the same source and
destination *but* in different logical networks in separate packet flows. As
for port numbers, in practice these are only extracted from packets when the
upper layer protocol is UDP or TCP. There are other protocols which use port
numbers, but they are deliberately left out (for now) because either nDPI does
not support them, or they are not widely adopted
([SCTP](https://en.wikipedia.org/wiki/SCTP_packet_structure) comes to mind).


Some Implementation Details
---------------------------

Determining the flow to which packets belong is an important task which is
performed *for each single packet scanned*. Even before packet contents are
inspected, they have to be classified.

Handling flows is split in two in the SnabbWall packet scanner: a generic
implementation inspects packets to extract the fields above (VLAN tag,
addresses, ports) and calculates a unique *flow key* from them, while
backend-specific code inspects the contents of the packet and identifies the
application for a flow of packets. Once the generic part of the code has
calculated a key, it can be used to keep tables which associate additional
data to each flow. While SnabbWall has only one backend which at the moment
which uses [nDPI][ndpi], this split makes it easier to add others in the
future.

For efficiency —both in terms of memory and CPU usage— flow keys are
represented using a C `struct`. The following snippet shows the one for IPv4
packets, with a similar one where the address fields are 16 bytes wide being
used for IPv6 packets:

```lua
ffi.cdef [[
   struct swall_flow_key_ipv4 {
      uint16_t vlan_id;
      uint8_t  __pad;
      uint8_t  ip_proto;
      uint8_t  lo_addr[4];
      uint8_t  hi_addr[4];
      uint16_t lo_port;
      uint16_t hi_port;
   } __attribute__((packed));
]]

local flow_key_ipv4 = ffi.metatype("struct swall_flow_key_ipv4", {
   __index = {
      hash = make_cdata_hash_function(ffi.sizeof("struct swall_flow_key_ipv4")),
   }
})
```

The `struct` is laid out with an extra byte of padding, to ensure that its
size is a multiple of 4. Why so? The hash function (borrowed from the
[lib.ctable](https://github.com/Igalia/snabb/blob/lwaftr/src/lib/ctable.lua)
module) used for flow keys works on inputs with sizes multiple of 4 bytes
because calculations are done in a word-by-word basis. In Lua the hash value
for userdata values is their memory address, which makes them all different
to each other: defining our own hashing function allows using the hash values
as keys into tables, instead of the flow key itself. Let's see how this works
with the following snippet, which counts per-flow packets:

```lua
local flows = {}
while not ended do
   local key = key_from_packet(read_packet())
   if flows[key:hash()] then
      flows[key:hash()].num_packets = flows[key:hash()].num_packets + 1
   else
      flows[key:hash()] = { key = key, num_packets = 1 }
   end
end
```

If we used the `key`s themselves instead of `key:hash()` for indexing the
`flows` table, this wouldn't work because the userdata for the new key is
created for each packet being processed, which means that keys with the same
content created for different packets would have different hash values (their
address in memory). On the other hand, the `:hash()` method always returns the
same value keys with the same contents.


Highs and Lows
--------------

You may be wondering why our flow key `struct` has its members named
`lo_addr`, `hi_addr`, `lo_port` and `hi_port`. It turns out that in packets
which belong to the same application travel between two hosts *in both
directions*. Let's consider the following:

* Host A, with address `10.0.0.1`.
* Host B, with address `10.0.0.2`.
* A web browser from A connects (using randomly assigned port `10205`) to
  host B, which has an HTTP server running in port `80`.

The sequence of packets observed will go like this:

| # | Source IP  | Destination IP | Source Port | Destination Port |
|--:|-----------:|---------------:|------------:|-----------------:|
| 1 | `10.0.0.1` | `10.0.0.2`     | `10205`     | `80`             |
| 2 | `10.0.0.2` | `10.0.0.1`     | `80`        | `10205`          |
| 3 | `10.0.0.1` | `10.0.0.2`     | `10205`     | `80`             |
| 4 | …          | …              | …           | …                |

If the flow key fields would be `src_addr`, `dst_addr` and so on, the first
and second packets would be classified in separate flows — but they belong in
the same one! This is sidestepped by sorting the addresses and ports of each
packet when calculating its flow key. For the example connection above, all
packets involved have `10.0.0.1` as the “low IP address” (`lo_addr`),
`10.0.0.2` as the “high IP address” (`hi_addr`), `80` as the “low port”
(`lo_port`), and `10205` as the “high port” (`hi_port`) — effectively
classifying all the packets into the same flow.

This translates into some minor annoyance in the [nDPI scanner
backend](https://github.com/aperezdc/snabbswitch/blob/swall-starfruit/src/apps/wall/scanner/ndpi.lua#L74)
because nDPI expects us to pass a pair of identifiers for the source and
destination hosts for each packet inspected. Not a big deal, though.


Flow(er Power)
--------------

Something we have to do for IPv6 packets is traversing the chain of [extension
headers](https://en.wikipedia.org/wiki/IPv6_packet#Extension_headers) to get
to the upper-layer protocol and extract port numbers from TCP and UDP packets.
There can be any number of extension headers, and while in practice they
should never be *lots*, this makes the amount of work needed to derive a flow
key from a packet is not constant.

The good news is that [RFC 6437][rfc6437] specifies using the 20-bit *flow
label* field of the fixed IPv6 header in a way that, combined with the source
and destination addresses, they uniquely identify the flow of the packet. This
is all rainbows and ponies, but in practice the current behaviour would still
be needed: the specification considers that an all-zeroes value indicates
“packets that have not been labeled”. Which means that it is still needed to
use the source and destination ports as fallback. What is even worse: while
forbidden by the specification, flow labels can mutate while packets are
en-route without any means of verifying that the change was made. Also, it is
allowed to assign a new flow label to an unlabeled packet when packets are
being forwarded. Nevertheless, using the flow label may be interesting to be
used instead of the port numbers when the upper layer protocol is neither TCP
nor UDP. Due to the limited usefulness, using IPv6 flow labels remains
unimplemented for now, but I have not discarded [adding support later
on](https://github.com/aperezdc/snabbswitch/issues/9).


Something Else
--------------

Alongside with the packet scanner, I have implemented the [L7Spy
application](https://github.com/aperezdc/snabbswitch/blob/swall-starfruit/src/apps/wall/l7spy.lua),
and the [snabb
wall](https://github.com/aperezdc/snabbswitch/tree/swall-starfruit/src/program/wall)
command during this phase of the SnabbWall project. Expect another post soon
about them!


[ljndpi]: https://github.com/aperezdc/ljndpi/
[ljffi]: http://luajit.org/ext_ffi_api.html
[swall]: http://snabbwall.org
[ndpi]: http://www.ntop.org/products/ndpi/
[rfc6437]: https://tools.ietf.org/html/rfc6437
