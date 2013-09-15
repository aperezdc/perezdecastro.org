Title: DMon 0.4.2 “Three Wise Men” released
Date: 2012-01-07 22:13
Author: aperez
Tags: dmon, igalia

Don't expect lots of surprises this time, but an otherwise smooth
maintenance release that includes a couple of minor niceties. Changes
since version 0.4.1 mostly affected the logging tools (`dlog`, `dslog`
and `drlog`):

- Logging tools now may accept input from arbitrary file descriptors,
  using the `--input-fd` command line option. This enables to do some
  nice redirection tricks from shell scripts and other programs which
  use them.
- Logging tools now support adding an arbitrary string in front of
  logged lines using the `--prefix` option. For example, this allows
  to send the output of several commands to a FIFO, and when reading
  from it it would be possible to know which command originated the
  message in the resulting output:

  ```bash
  mkfifo logpipe
  dmon cat logpipe -- dlog -t /var/log/combined
  dmon command1 -- dlog -p command1: logpipe
  dmon command2 -- dlog -p command2: logpipe
  dmon command3 -- dlog -p command3: logpipe
  ```

- Logging tools now handle the `INT`, `TERM` and `HUP` signals. When
  signalled, they will flush buffers to disk, and in the case of
  `drlog` check if log rotation is needed; for `INT` and `TERM` the
  processes will also shut down gracefully.
- The manual pages now also include the long variant of command line
  options.
- A number of small improvements: better error messages, removal of
  some unused code, updated to a slightly newer version of `libwheel`,
  better and more consistent command line parsing, silent Make
  rules...

Make sure you grab the [tarball][] while it is still fresh, and do not
forget that a package for [Arch Linux][] is available <a>in the AUR</a>.

**Update, Jan 30th:** Packages for DMon 0.4.2 are now also available at
the [Igalia APT respoitory][], for `i386`, `amd64` and `armel`.

Happy 2012!

  [tarball]: http://people.igalia.com/aperez/files/dmon-0.4.2.tar.gz
  [Arch Linux]: http://archlinux.org
  [Igalia APT respoitory]: http://apt.igalia.com
