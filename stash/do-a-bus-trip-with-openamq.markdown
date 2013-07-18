Title: Do a bus-trip with OpenAMQ
Date: 2010-05-31 01:40
Author: aperez
Category: Igalia
Tags: debian, pkg

So you want to do some messaging using [AMQP][], you have a [Debian][]
system (or based on it), and you want to try out [OpenAMQ][]... it's
your **lucky day!**

I have just built some `.deb` packages for the OpenAMQ, using some
[packaging support][] files I found, plus some [patches I throwed in][]
to bring it up to date. Just pick the package of version 1.2c4 for the
distribution of your choice:

-   [OpenAMQ 1.2c4, amd64, Sid][]
-   [OpenAMQ 1.2c4, amd64, Lenny][]
-   [OpenAMQ 1.2c4, i386, Lenny][]

As always, I am just providing those packages here for your convenience.
They work fine for me, but you are on your own using them.

By the way, you may also want to try other options like [RabbitMQ
(package `rabbitmq` and/or][][0MQ][] (package `zeromq-bin`, I did not
have luck with this one, though).

And now it is time to start using the just installed message queueing
service :-D

  [AMQP]: http://www.amqp.org/confluence/display/AMQP/Advanced+Message+Queuing+Protocol
  [Debian]: http://www.debian.org
  [OpenAMQ]: http://www.openamq.org/
  [packaging support]: http://github.com/pieterh/openamq-debian
  [patches I throwed in]: http://gitorious.org/packaging/debian-openamq
  [OpenAMQ 1.2c4, amd64, Sid]: http://people.igalia.com/aperez/files/debs/openamq_1.2c4-1_amd64.deb
  [OpenAMQ 1.2c4, amd64, Lenny]: http://people.igalia.com/aperez/files/debs/lenny/openamq_1.2c4-1_amd64.deb
  [OpenAMQ 1.2c4, i386, Lenny]: http://people.igalia.com/aperez/files/debs/lenny/openamq_1.2c4-1_i386.deb
  [RabbitMQ (package `rabbitmq` and/or]: http://www.rabbitmq.com/
  [0MQ]: http://www.zeromq.org/
