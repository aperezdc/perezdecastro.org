Title: DMon status report: evolution to 0.3.7
Date: 2010-10-04 18:06
Author: aperez
Tags: dmon, igalia

When I [first wrote about DMon][], I pointed out that version 0.3 could
be already installed from [our APT repository][], which hosts flavours
for `i386`, `amd64` and `armel`. Five weeks have passed and I feel like
I have to write a status update now that [0.3.7 is out][]. It is not a
big version number change because DMon behaves essentially as in 0.3,
but a number of new features were added and bugs fixed.

Let's see which juicy bits are available on top of the features it
already had:

-   Additional groups can now be specified using the `-u` and `-U`
    options. As a side effect of their extended syntax, options `-g` and
    `-G` were removed as they are no longer needed.
-   Setting of resource usage limits is now supported with the `-r`.
    This uses [setrlimit(2)][] under the hood.
-   DMon can now wait for some time before re-running commands by
    specifying time intervals with the `-i` option. Think about it as a
    poor man's recurrent job scheduler.
-   Environment variables can now be manipulated (including deletion) by
    means of the `-E` option.
-   All commands (`dmon`, `dlog`, `dslog`) can now be built as a single
    multicall binary. This saves disk space and some kilobytes of
    memory, which is interestinhg for embedded environments.
-   Tools now honor the `DMON_OPTIONS`, `DLOG_OPTIONS` and
    `DSLOG_OPTIONS`; environment variables. When defined, they will be
    interpreted as additional command line arguments. Actual command
    line arguments take precedence, so values given in environment
    variablels can still be overriden.
-   A small `libnofork.so` library is included, which overrides the
    system-provided [fork(2)][] and [daemon(3)][] functions in such a
    way that the library can be preloaded
    (`dmon -E LD_PRELOAD=libnofork.so ....`) to make programs not to
    fork. Very useful for applications which create new daemon processes
    inconditionally so they can be properly monitored. This is tested
    only under GNU/Linux with `glibc` at the moment, use with care!

Apart from new features, a couple of bugs related to error handling were
fixed, for better reliability.

Last but not least, I would like to thank my friend [Andrés J. Díaz][]
who is using DMon and provided feedback and ideas for some of those new
features.

Happy monitoring!

  [first wrote about DMon]: /aperez/2010/08/dmon-process-monitoring-with-style/
  [our APT repository]: http://apt.igalia.com
  [0.3.7 is out]: http://gitorious.org/dmon/dmon/commits/v0.3.7
  [setrlimit(2)]: http://linux.die.net/man/2/setrlimit
  [fork(2)]: http://linux.die.net/man/2/fork
  [daemon(3)]: http://linux.die.net/man/3/daemon
  [Andrés J. Díaz]: http://ajdiaz.wordpress.com/
