Title: Meet Bill
Date: 2008-11-27 03:55
Author: aperez
Category: Bill
Tags: bash

It has been in the oven for some time, but now it is ready for
release... [Bill][] version 0.1 has just hit the lines!

In short, Bill is a solution for creating high-quality Bash code using
reusable components. As [GNU Bash][] is its only dependency, it can be
run nearly everywhere—even on resource-limited systems!

## Origins and motivation

Sometimes one wants to spit out some code to glue together a set of
already available tools and quickly solve a problem by combining their
strengths. That is okay, and using a shell script is probably the best
solution, until annoyances arise:

1.  Portions of boilerplate code is repeated one script after another.
    Bill addresses this problem by providing a way of creating and
    reusing modules, and by providing a set of standard ones. It comes
    with batteries included.
2.  The script *will* eventually grow; and it will become a nightmare to
    debug and maintain. Bill includes tools for testing and documenting
    the code.
3.  Some ideas are complicated to achieve in shell code, and usually
    implementing them can be tricky. Bill already does the tricks for
    you, so you can focus on the actual code.

Thus, Bill was born with three main goals in mind: having as little
dependencies as possible, easing development of complex applications,
and serving as a playground for advanced usage of Bash. While I was
making progress with the code, we had the ideas of running simple web
applications coded in shell scripts and having unit tests and added them
on the go.

## Trying it out

If you use a `dpkg`-based distribution (Ubuntu, Debian), just grab the
[.deb package][] and install it by running `dpkg -i bill_0.1-1_all.deb`.
Otherwise you can download the [source tarball][] and unpack it with
`tar -xfj bill-0.1.tar.bz2`. You can run Bill without installing by
adding the `bill-0.1/scripts/` directory to your `PATH` environment
variable.

Once you have your copy you are ready to [read the tutorial][]. I will
give you only an appetizer here:

    $ bill
    (bill) echo "Hello, Bill!"
    Hello, Bill!
    (bill)

This is all for today, but expect more news related to Bill in the
future. For the intrepid in you, you can check out the [code repository
at Gitorious][], the code is under the GPL v2 license. I hope you enjoy
this initial release as much as I did while preparing it.

Have a lot of fun...

  [Bill]: http://people.igalia.com/aperez/bill
  [GNU Bash]: http://www.gnu.org/software/bash
  [.deb package]: http://people.igalia.com/aperez/bill/releases/bill_0.1-1_all.deb
  [source tarball]: http://people.igalia.com/aperez/bill/releases/bill-0.1.tar.bz2
  [read the tutorial]: http://people.igalia.com/aperez/bill/tutorial.html
  [code repository at Gitorious]: http://gitorious.org/projects/bill
