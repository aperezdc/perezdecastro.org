Title: Bash 4.0 is out!
Date: 2009-03-03 20:39
Author: aperez
Category: Igalia
Tags: bash

Some of you maybe already know about the news, but [GNU Bash 4.0][] was
released a while ago. There are some interesting good news in this
release. For example, now Bash ships with support for associative arrays
(hashes) *out-of-the-shell*. This will make some [Bill][] modules like
[data/hash][] unneeded in the long term, as well as providing a nice
speedup to code using it. But do not let your imagination fly before
thinking a bit about the following: a critical piece of the base system
like the shell will not be updated by your [favourite][]
[distributors][] in a while.

Bash 3.2 has died... long live Bash 3.2!

  [GNU Bash 4.0]: http://linux.slashdot.org/article.pl?sid=09/02/23/1957244
  [Bill]: http://people.igalia.com/aperez/bill
  [data/hash]: http://people.igalia.com/aperez/bill/lib/data/hash.html
  [favourite]: http://www.debian.org
  [distributors]: http://www.gentoo.org
