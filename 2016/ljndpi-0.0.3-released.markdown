Title: ljndpi 0.0.3 released with nDPI 1.8 support
Date: 2016-07-31 22:15:00
Author: aperez
Tags: igalia, snabbswitch, snabbwall

Although I have been away from Snabb-related work for a while, the fact that
[nDPI 1.8 was released](https://github.com/ntop/nDPI/releases/tag/1.8) didn't
went unnoticed. This library is an important building block for
[SnabbWall](http://snabbwall.org), the [Layer-7
firewall](https://en.wikipedia.org/wiki/Application_firewall) which I am
developing at [Igalia](https://www.igalia.com) with sponsorship from the
[NLnet Foundation](https://nlnet.nl) (thanks!).

<figure style="text-align:center">
  ![](http://snabbwall.org/images/igalia-logo.png)
  <span style="margin-left:20px">&nbsp;</span>
  ![](http://snabbwall.org/images/nlnet-logo.gif)
</figure>

SnabbWall uses the nDPI library via the [ljndpi][ljndpi] binding, about which
I [wrote back in
January](https://perezdecastro.org/2016/ljndi-snabbwall-sidekick.html). As any
other component which uses a native library, `ljndpi` is a consumer of the API
and ABI exported by it, so it needs to be updated to accomodate to changes
introduced in new releases of nDPI.

Fortuntately most of the API (and ABI) from nDPI 1.7 remains unchanged in
version 1.8, making it possible to maintain the interface exposed to the Lua
world. This is very good news, and it means that any program using `ljndpi`
does *not* need to be modified to work with nDPI 1.8: just update `ljndpi` to
[version 0.0.3](https://github.com/aperezdc/ljndpi/releases/tag/v0.0.3) and
you are ready to go.


Nitty-Gritty Details
--------------------

In order to support versions 1.7 and 1.8 of the nDPI library,
`ndpi_revision()` [is
used](https://github.com/aperezdc/ljndpi/blob/master/ndpi/c.lua#L76) to obtain
the version string of the loaded library, and parsed into a *(major, minor,
patch)* version triplet. The `ndpi.c` module uses this version information to
determine which symbols to make known to the FFI extension via `ffi.cdef`:

```lua
if lib_version.minor == 7 then
  -- Declare functions available only in nDPI 1.7
  ffi.cdef [[
    ...
  ]]
elseif lib_version.minor == 8 then
  -- Ditto, for version 1.8
  ffi.cdef [[
    ...
  ]]
end
```

The high-level `ndpi.wrap` module does the same, ensuring that only functions
available in the version of the nDPI library currently loaded are used. In
some cases, parameters passed to functions with the same name in nDPI may
differ, and `ndpi.wrap` [shuffles them around as
needed](https://github.com/aperezdc/ljndpi/blob/master/ndpi/wrap.lua#L104) in
order to avoid changes in the interface exposed to Lua:

```lua
if lib_version.major == 7 then
   -- ...
else
   -- ...

   -- In nDPI 1.8 the second parameter (uint8_t proto) has been dropped.
   detection_module.find_port_based_protocol = function (dm, dummy, ...)
      local proto = lib.ndpi_find_port_based_protocol(dm, ...)
      return proto.master_protocol, proto.protocol
   end
end
```

Last but not least, the numeric values which identify each protocol supported
by nDPI have changed as well, due to the additional protocols supported by the
new version of the library. The existing `ndpi.protocol_ids` module was
renamed to `ndpi.protocol_ids_1_7`, and then a new `ndpi.protocol_ids_1_8`
generated using the
[update-protocol-ids](https://github.com/aperezdc/ljndpi/blob/master/tools/update-protocol-ids)
tool. Finally, the `ndpi.wrap` module was updated to load the module which
corresponds to the version of the nDPI library being used:

```lua
-- Return the module table.
return {
  protocol = require("ndpi.protocol_ids_"
            .. lib_version.major .. "_"
            .. lib_version.minor);
  -- ...
}
```


Easier Installation
-------------------

As a bonus, it is now possible to install `ljndpi` using the
[LuaRocks](https://luarocks.org) package manager. LuaRocks provides similar
functionality to NodeJS'
[npm](https://docs.npmjs.com/getting-started/what-is-npm) or Python's
[pip](https://pip.pypa.io/en/stable/quickstart/). If your LuaJIT installation
includes LuaRocks, getting the latest stable release of `ljndpi` is easier
than ever:

```sh
luarocks install ljndpi
```

It is also possible to install a development snapshot directly. The following
will fetch the source from the Git repository and install it using LuaRocks —
though it is strongly recommended to use the stable releases:

```sh
luarocks install --server=https://luarocks.org/dev ljndpi
```

Hopefully, this will make `ljndpi` easier to discover and used by projects
other than SnabbWall. Who knows, it may even make it easier for distributions
to package it! (Hint: LuaRocks supports [specifying a custom
tree](http://leafo.net/guides/customizing-the-luarocks-tree.html#the-install-locations/using-a-custom-directory).)


One More Thing...
-----------------

<figure class="image">
  ![](https://perezdecastro.org/images/onemorething-small.jpg)
  <figcaption>He said it 31 times on stage (look it up!)</figcaption>
</figure>

My [previous post](https://perezdecastro.org/2016/identifying-l7-flows.html)
ended up in a cliffhanger which promised another post about SnabbWall.
Supporting nDPI 1.8 in `ljndpi` seemed important enough to write about it, but
rest assured that the post on SnabbWall is next in my “polish and publish”
queue.


[ljndpi]: https://github.com/aperezdc/ljndpi
[ljffi]: http://luajit.org/ext_ffi.html
