Title: Using boolean variables in Bash
Date: 2009-01-06 17:27
Author: aperez
Category: Igalia
Tags: bash

Today I stumbled upon [a weblog post by Mark Dominus][] on a “novel” way
of using flag variables in shell code, mainly because I have been using
that technique since my early days of shell programming. Let me
introduce the syntax:

    the_world_is_flat=true
    # ...do something interesting...
    if $the_world_is_flat ; then
      echo 'Be careful not to fall off!'
    fi

This example may look familiar to some of my readers, because in fact it
is taken from the [Bill tutorial][]. Some modules included in [Bill][]
use this kind of syntax extensively. Some care must be taken, because we
are directly executing the contents of a variable in the `if` clause, so
you would not better use this with values entered by the user, but I
find very convenient to directly expand and evaluate `true` and `false`
from variables when they come from “trusted” code.

I learned this trick several years ago from my friend [Andrés][] when we
were working together. I do not know when did he learn this syntax, but
I am sure that the thing is not as new as it sounds.

Oops, almost forgot: have a nice 2009!

  [a weblog post by Mark Dominus]: http://blog.plover.com/prog/sh-flags.html
  [Bill tutorial]: http://people.igalia.com/aperez/bill/tutorial.html#interactive-mode
  [Bill]: http://blogs.igalia.com/aperez/?p=23
  [Andrés]: http://ajdiaz.wordpress.com/
