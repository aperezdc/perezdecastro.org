Title: Python talks Collectd
Date: 2009-03-22 23:32
Author: aperez
Tags: python, igalia

I have been playing lately with [collectd][] again, which is a very nice
piece of software to monitor out things, especially when you want more
than just the network statistics that other tools like [MRTG][]. In a
coffee break [someone][] commented that it would be interesting to
process and display some if the data sent by collectd daemons installed
in machines in real-time, and it sounded like a funny idea, so the first
thing I did was implementing the network protocol. At the moment I have
a working pure-[Python][] implementation of it working: [collectd.py][],
capable of receiving data (sending data is stil work in progress).

As a quick introduction, you could use the module as follows:

```python
from collectd import Reader

rdr = Reader()
while True:
    print "-" * 80
    for item in rdr.interpret():
        print item
```

This will join the default IPv4 multicast group (`239.19274.66`) used by
collectd (sorry, IPv6 support is incomplete) and start listening for
incoming UDP packets in the default port (`25826`), will interpret each
incoming data packet, and then print each component of the data packet
to standard output in a rather readable format:

    [1237749608] localhost.localdomain/swap/swap/used [(1, 48082944.0)]
    [1237749608] localhost.localdomain/swap/swap/free [(1, 1007009792.0)]
    [1237749608] localhost.localdomain/swap/swap/cached [(1, 18640896.0)]
    [1237749608] localhost.localdomain/users/users [(1, 5.0)]

Each data item is an instance of `collectd.Values` (which behaves mostly
as a list, and can contain multiple values) and `collectd.Notification`.
Both of them share some fields inherited from `collectd.Data`. For
example, you could filter messages regarding swap space usage from
machines containing `foobar` in their host names:

```python
if "foobar" in item.host and item.plugin == "swap":
    print item
```

If you want to bind to a particular address/port or join any other
multicast group than de default (sorry: joining multiple groups is not
implemented right now) you can pass parameters to the constructor:

```python
rdr = collectd.Reader(host="192.168.0.32", port=9000)
```

The protocol was pretty straightforward to interpret, the hardest part
was guessing how to properly handle multicast, as I never had to deal
with it before. Now it is time to spend some time with [PyCairo][], or
even [PyCha][] which looks pretty convenient, and make a small
application which dumps real-time graphs to a window :-)

  [collectd]: http://collectd.org
  [MRTG]: http://oss.oetiker.ch/mrtg/
  [someone]: http://blogs.igalia.com/jmunhoz/
  [Python]: http://python.org
  [collectd.py]: http://people.igalia.com/aperez/files/collectd.py
  [PyCairo]: http://cairographics.org/pycairo/
  [PyCha]: http://www.lorenzogil.com/projects/pycha/
