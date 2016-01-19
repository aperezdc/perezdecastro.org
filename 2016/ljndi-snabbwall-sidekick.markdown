title: ljndpi: The SnabbWall sidekick
Date: 2016-01-19 20:29:39
Author: aperez
Tags: igalia, snabbswitch, snabbwall

Howdy, and happy 2016! Last time we met here, I wrote about [SnabbWall][swall], a suite of Snabb Switch applications implementing the machinery needed for a [Layer-7 firewall](https://en.wikipedia.org/wiki/Application_firewall) using [deep packet inspection](https://en.wikipedia.org/wiki/Deep_packet_inspection), and a firewall program itself. The work I am doing in SnabbWall is the result of ongoing collaboration between [Igalia](http://www.igalia.com) and the [NLnet Foundation](http://nlnet.nl/). We are very grateful of having their sponsorship.

<figure style="text-align:center">
  ![](http://snabbwall.org/images/igalia-logo.png)
  <span style="margin-left:20px">&nbsp;</span>
  ![](http://snabbwall.org/images/nlnet-logo.gif)
</figure>

We are treating development of SnabbWall like every other project, and among the periodic duties it is important to report progress. Development is happening 100% out in the open, so early on we decided to do also make the status updates open—by blogging them.

*(For those interested in following only related posts, I have set up an additional feed: [RSS](http://perezdecastro.org/snabbswitch.rss), [Atom](http://perezdecastro.org/snabbswitch.atom).)*


nDPI Lua Binding: Check
-----------------------

The second milestone for SnabbWall was having a binding using the handy [LuaJIT FFI extension][ljffi] for the [nDPI][ndpi] library, and I am happy to announce that the binding, dubbed `ljndpi`, is fairly complete by now. As an added bonus, I have been careful to make the code independet from Snabb Switch, which made it possible to split out the history into a [separate repository][ljndpi], which gets imported under `lib/ljndpi/` in the SnabbWall repository using [git-subtree](https://developer.atlassian.com/blog/2015/05/the-power-of-git-subtree/), and then [built](https://github.com/aperezdc/snabbswitch/commit/bfd172da861737d1a1b93b6d0e9e2cf6df959a0a) into the `snabb` executable. This is the same approach currently used in Snabb Switch to build the external dependencies (that is [ljsyscall](https://github.com/justincormack/ljsyscall), [pflua](https://github.com/Igalia/pflua), and [LuaJIT](http://luajit.org)).

<figure class="image">
  ![](http://perezdecastro.org/images/a-team-plan.png)
  <figcaption>Hannibal Smith, happy about the project results</figcaption>
</figure>

Having a working binding for nDPI completes the second milestone of the [SnabbWall roadmap](http://snabbwall.org/roadmap/).


Some Implementation Notes
-------------------------

### Low-level Definitions

The `ndpi.c` submodule (source: [ndpi/c.lua](https://github.com/aperezdc/ljndpi/blob/master/ndpi/c.lua)) contains only the definitions needed by the FFI extension to call nDPI functions, and takes care of loading the `libndpi.so` shared object. If you check the code, you may notice that some of the type names do not match exactly those used in the nDPI headers: as long as the byte size and their role is used consistently, the FFI extension does not really care about the actual names of the types, so I have decided to use names which looked better in my eyes—the nDPI API is kinda terrible in that regard.


### Protocol Bitmasks

Telling nDPI which protocols it should detect is done using a big bitmask, with one bit for each supported protocol.

The implementation of `NDPI_PROTOCOL_BITMASK` in C uses a bunch of macros to operate on a `struct` which wraps an array of integers, and they do not lend themselves to be easily wrapped using the FFI extension. Because of that, I decided to [reimplement it in pure Lua](https://github.com/aperezdc/ljndpi/blob/master/ndpi/protocol_bitmask.lua). The size of the array of integers in the bitmask `struct` and their bit width may vary across different nDPI versions. In preparation for future changes —which should not happen often—, the type is defined using the values of the `NDPI_NUM_BITS` and `NDPI_BITS` constants: copying their values from the nDPI headers is the only change needed.

As a bonus, I have thrown in support for calls to all methods except `:is_set()`. This is super convenient:

```lua
local bits = ndpi.protocol_bitmask()
print(bits:set_all():del(32):is_set(32)) --> false
print(bits:reset():add(42):is_set(42))   --> true
```

Certain operations, like enabling detection of all the supported protocols can be done with a one-liner:

```lua
local dm = ndpi.detection_module(1000)
dm:set_protocol_bitmask(ndpi.protocol_bitmask():set_all())
```


### Protocol Names and Identifiers

For each supported protocol, nDPI has both a macro to give a name to its numerical identifier, and a table with data about the protocol. One of the pieces of data is a string with the name of the protocol, in a format suitable to be presented to the user. These strings are `const static` in the C side of the world, but every time a call to `ndpi_get_proto_name()` it would be needed to convert the plain array of 8-bit integers to a Lua string using `ffi.string()`, which in turn would create a copy. Of course one could cache the strings in the Lua side, but protocol identifiers and names do not change (as long as the nDPI version remains unchanged), so instead of caching the results, I have opted for writing a [small script](https://github.com/aperezdc/ljndpi/blob/master/tools/update-protocol-ids) which parses the `ndpi_protocol_ids.h` file and generates the corresponding [protocol_ids.lua](https://github.com/aperezdc/ljndpi/blob/master/ndpi/protocol_ids.lua):

```lua
-- Generated by ljdnpi's tools/update-protocol-ids script
local T = {
  [0] = "PROTOCOL_UNKNOWN",
  [1] = "PROTOCOL_FTP_CONTROL",
  [2] = "PROTOCOL_MAIL_POP",
  [2] = "PROTOCOL_HISTORY_SIZE",
  -- ...
  PROTOCOL_UNKNOWN = 0,
  PROTOCOL_FTP_CONTROL = 1,
  PROTOCOL_MAIL_POP = 2,
  PROTOCOL_HISTORY_SIZE = 2,
  -- ...
}
T.PROTOCOL_NO_MASTER_PROTO = T.PROTOCOL_UNKNOWN
T.SERVICE_MSN = T.PROTOCOL_MSN
T.SERVICE_DROPBOX = T.PROTOCOL_DROPBOX
T.SERVICE_SKYPE = T.PROTOCOL_SKYPE
T.SERVICE_VIBER = T.PROTOCOL_VIBER
T.SERVICE_YAHOO = T.PROTOCOL_YAHOO
return T
```

Note how the same table contains both numeric and string indexes. This is perfectly fine in Lua, and allows both mapping from a protocol name to its identifier, and from an identifier to a name. The strings are not as nice is the ones returned by `ndpi_get_proto_name()`, but on the upside they are guaranteed to always be uppercase and be valid identifiers.


### Wrapper Module

Finally, the `ndpi.wrap` submodule (source: [ndpi/wrap.lua](https://github.com/aperezdc/ljndpi/blob/master/ndpi/wrap.lua)) ties the previous pieces together to provide an idiomatic Lua interface to nDPI. To achieve this, it uses `ffi.metatype()` to associate metatables to the C types used by nDPI.

The `ndpi.id` and `ndpi.flow` types were a bit tricky because they are opaque: their implementation details are hidden, and nDPI only allows us to create values of those types, free them, and pass them to functions. So in C one does:

```c
// Create and initialize an endpoint identifier:
const size = ndpi_detection_get_sizeof_ndpi_id_struct();
struct ndpi_id_struct *ndpi_id = malloc(size);
memset(ndpi_id, 0x00, size);
```

How does one do that without knowing in advance the size? Well, to begin with, the FFI extension will associate the metatable of the metatype to any pointer value of the C type, *no matter how it has been created*. Additionally, FFI metatypes have an additional `__new` metamethod which allows to manually allocate memory or doing any other thing that may be needed, so I ended up with this (the version for `ndpi.flow` is the same, but using `lib.ndpi_free_flow` instead of `C.free` for the `__gc` metamethod):

```lua
local id_struct_ptr_t = ffi.typeof("ndpi_id_t*")
local id_struct_size  = lib.ndpi_detection_get_sizeof_ndpi_id_struct()

local function id_new(ctype)
  local id = ffi.cast(id_struct_ptr_t, C.malloc(id_struct_size))
  ffi.fill(id, id_struct_size)
  return id
end

local id_type = ffi.metatype("ndpi_id_t", { __new = id_new, __gc = C.free })
```

Note that the metatable does *not* have an `__index` entry, so it does not have any methods attached to values. This effectively only allows creating values, passing them around, and letting the garbage collector free their memory—which is exactly what we want.

For the `ndpi.detection_module` type, the main difference is that there is a table associated to the `__index` entry of the metatype. It contains the functions which act on a `struct ndpi_detection_module_struct*`, some of them renamed to shorter (or just more logical) names, and some of them are small wrappers which perform additional conversion of values between the Lua and C sides of the world.

Finally, the `ndpi.wrap` module also imports the bits from the other submodules (`ndpi.c`, `ndpi.protocol_bitmask`, and `ndpi.protocol_ids`). Provided that `ndpi.wrap` is what should be loaded when using a plain `require("ndpi")`, the one last bit is making sure that `ndpi.lua` has:

```lua
-- Requiring "ndpi" returns the same as "ndpi.wrap"
return require("ndpi.wrap")
```

There is a part of the public nDPI API which I have purposedly omitted from `ljndpi`: the `ndpi_t**()` functions used to implement a tree structure. These are used to provide (as a convenience) a data structure which maps keys to pointers, and it is not really needed to interface with nDPI for packet inspection. Any program which needs a similar structure can use Lua tables. If needed, it is even easier to roll your own custom data structure in Lua than to wrap these functions.


Putting nDPI Into Use
---------------------

The nDPI API is quite low-level, and so is the binding exposed by `ljndpi`. As an exercise to test the module and get my hands greasy in preparation for writing SnabbWall's [L7 Spy](http://snabbwall.org/design/#l7-spy:83772ba7ad0304b1562d08f190539946), I reimplemented a pure-Lua version of the `ndpiReader` tool included with nDPI, which works only on `pcap` capture files. If you want to use `ljndpi` I would strongly encourage you to take a look [examples/readpcap](https://github.com/aperezdc/ljndpi/blob/master/examples/readpcap) in the source tree.

The basic idea goes this way:

* Create a `ndpi.detection_module()` and enable detection of all supported protocols.

* Open the input `pcap` capture (or prepare whatever mechanism you use to read one packet at a time).

* Create a table where flow information is stored.

* For each packet:

  1. Build a “flow identifier” (*flowid*) from information in the packet (more on this below).
  2. If the flow table does not have an entry for the *flowid*, create a new one. Make sure you create also a `ndpi.flow` object, and two `ndpi.id` objects (one for the source host, another for the destination).
  3. Call `detection_module:process_packet()`, passing the `ndpi.flow` and `ndpi.id` objects corresponding to the flow. If this function returns anything else than `ndpi.protocol.PROTOCOL_UNKNOWN`, then the protocol has been identified (jackpot!).

So what's a “flow identifier” anyway? It can be any value (really!), as long as you can calculate it solely from data in the packets, and each identifier should be unique for each application (Layer-7!) passing data over the network between a pair of hosts. For IP-based protocols (TCP, UDP), you want to use at least the IP addresses and ports involved. Note that nDPI considers the direction of the data

There are a number of improvements one can make on top of the basic method above, being the most obvious one using [VLAN](https://en.wikipedia.org/wiki/IEEE_802.1Q) tags to identify flows (`readpcap` does this already). But I am leaving flow identification for a follow-up post. Dear readers: think about it as homework, and make sure to check the answers with me in the following weeks.

(Or, you know, just go ahead, clone [ljndpi](https://github.com/aperezdc/ljndpi), and experiment!)



[ljndpi]: https://github.com/aperezdc/ljndpi/
[swall]: http://snabbwall.org
[ljffi]: http://luajit.org/ext_ffi.html
[ndpi]: http://www.ntop.org/products/ndpi/
