Title: DMon: Process monitoring with style
Date: 2010-08-27 01:18
Author: aperez
Tags: dmon, igalia, connectical

Have you ever wanted to run a lengthy process making sure that it will
be restarted on failure? Did you need at some point to daemonize a
“normal” program? Well, maybe you already knew about [daemontools][],
[runit][], [freedt][], [Supervisor][], [upstart][] or —recently—
[systemd][]. They already do a good job respawning processes, but there
are three single things that neither of them are capable of doing:

-   Running a **single command** and exiting when it exits successfully.
-   Running commands **interactively**, without daemonizing nor
    detaching from the terminal.
-   **Temporarily suspending** execution when the system load goes over
    a configurable value, **and resuming execution** automatically as
    soon as the load drops below another configurable value.

If you ever needed at least one of those features, then [DMon][] is
probably what you want. If unsure, read the examples below — you might
find some inspiration for use-cases!

## The Story

Years ago I discovered [Daniel J. Bernstein][]'s [qmail][], and with it
came the rest of the “DJB-ware” software stack: [djbdns][], [ucspi][],
[daemontools][]... and their philosophy!)

Some weeks ago I coded [vfand][], a small “non-daemon” to control the
speed of the fan in my Vaio laptop because it was overheating. I am
lazy, so I deliberately left out daemonization and suggested launching
it from [init(8)][] — because I knew that DJB's tools leave
daemonization and logging to other tools which [just do one thing
well][].

Days back I had to make a huge data copy in a mission-critical mail
server, and used the mighty [rsync][] tool because I wanted the copy to
be interruptible so I could stop it when the system load was getting
high and then resuming the data copy. I did that manually (`Ctrl-Z`,
wait, `fg`, repeat), and I do not like performing automatable tasks.
Fortunately I seldom do this kind of tasks.

Do you recognize the pattern? [DMon][] is a subproduct of what I have
been doing lately, applying the knowledge about `daemontools` I already
had.

## How does it work? — Modus operandi

In short it works àla `daemontools` without control sockets and without
using script files for launching processes. All options are specified in
the command line, as long as the commands to be run. Like this:

    dmon [options] command [command-options] 
         [-- log-command [log-command-options]

As an example, consider the following command line:

```bash
dmon cron -f -- dlog /var/log/cron.log
```

This is what DMon wil do:

1.  Daemonize itself.
2.  Create a [pipe(2)][], which will be used to connect the output of
    the given `command` to the input of the `log-command`.
3.  Spawn both the `command` and the `log-command`.
4.  Silently wait. If some child is terminated, it will be respawned.

That is pretty close to what the `supervise` program included in
`daemontools` does, so it have already all the advantages of it, plus
without needing stuff in the file system. Passing options to `dmon` will
trigger some of the extra features provided:

- Passing `-n` makes it run in the foreground. This is very useful in
  conjunction with `-1`: with the latter the processes will be only
  respawned if their exit status is non-zero.
- If you want to log messages from standard error, use `-e` and both
  standard output and standard error will be piped to the logging
  command.
- For faulty programs which could get somewhat “locked” and sometimes
  take too much time to run, you may pass a maximum running time with
  `-t`. When the timeout is reached the program will be forcibly
  killed and then started again.
- Finally, for pausing the program over a given value of system load,
  use `-L`. After pausing execution (by means of the `SIGSTOP`
  signal), it will be resumed when the system load falls below the
  value given with `-l` (by sending `SIGCONT`). The signals used are
  the standard ones used for this duty e.g. by the shell, so almost
  every well-behaved program will work without modifications.

The DMon package already includes a couple tools ready to be used as
logging command: `dlog` will append lines to a log file, optionally
adding a timestamp to them, and `dsyslog` will send lines to [the system
log][]. You can use any logging tool which works with `daemontools`,
like `multilog` (part of it) or my own [rotlog][] ;-)

## DMon use-cases & Examples

Running `rsync` in a terminal (without detaching), pausing the copy when
the system load is above `4.0`, retrying until the copy succeeds:

```bash
dmon -n -1 -L 4.0 rsync -az /path/to/srcdir /path/to/destdir
```

Launching [vfand][1] as a daemon, logging errors to the local `syslog`,
and saving the PID of the process (the second line terminates `dmon`,
`vfand` and `dsyslog` in a single shot):

```bash
dmon -e -p /var/run/vfand.pid vfand -- dsyslog vfand
kill $(cat /var/run/vfand.pid)
```

Starting the [MediaTomb][] UPnP server as a user `mediatomb` (i.e. at
bootup), saving auto-rotated logs with [rotlog][] running as user `log`:

```bash
dmon -e -u mediatomb -g mediatomb -U log -G log 
     mediatomb --interface eth0 --home /mnt/mediafiles 
     -- rotlog -c /var/log/mediatomb/
```

## Final Words

It was fun for me to hack in [DMon][] because C is a language I learnt
to love, and using it from time to time is nice to not lose contact with
it. Also, I had a clear idea of what I wanted to do for solving a
particular problem, which is great for keeping focus.

Albeit DMon is already in its third release (namely [version 0.3][]) and
I have been using it since its first inceptions, it may contain bugs as
any other piece of software. Do not hesitate to [drop me a line][] with
your complaints and suggestions — or even better: get yourself a clone
of the [Git][] [repository][] and use its [send-email][] awesomeness!

Happy monitoring!

  [daemontools]: http://cr.yp.to/daemontools.html
  [runit]: http://smarden.org/runit/
  [freedt]: http://offog.org/code/freedt.html
  [Supervisor]: http://supervisord.org/
  [upstart]: http://upstart.ubuntu.com/
  [systemd]: http://www.freedesktop.org/wiki/Software/systemd
  [DMon]: http://gitorious.org/dmon
  [Daniel J. Bernstein]: http://en.wikipedia.org/wiki/Daniel_J._Bernstein
  [qmail]: http://cr.yp.to/qmail.html
  [djbdns]: http://cr.yp.to/djbdns.html
  [ucspi]: http://cr.yp.to/ucspi-tcp.html
  [vfand]: http://blogs.igalia.com/aperez/2010/07/vfand-a-daemon-to-control-fan-speed-in-vaio-laptops/
  [init(8)]: http://linux.die.net/man/8/init
  [just do one thing well]: http://onethingwell.org/post/457050307/about-one-thing-well
  [rsync]: http://www.samba.org/rsync/
  [pipe(2)]: http://linux.die.net/man/2/pipe
  [the system log]: http://linux.die.net/man/3/syslog
  [rotlog]: http://gitorious.org/rotlog
  [1]: http://gitorious.org/vfand
  [MediaTomb]: http://mediatomb.cc/
  [version 0.3]: http://gitorious.org/dmon/dmon/commit/d342f15dcd7262b420dba3be5ac96dadbab48952
  [drop me a line]: mailto:aperez@igalia.com
  [Git]: http://git-scm.com
  [repository]: http://gitorious.org/dmon/dmon/
  [send-email]: http://www.kernel.org/pub/software/scm/git/docs/git-send-email.html
