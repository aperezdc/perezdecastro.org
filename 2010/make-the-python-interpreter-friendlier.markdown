Title: How to make the Python interpreter friendlier
Date: 2010-04-15 18:02
Author: aperez
Tags: python, igalia

We are doing quite some coding in [Python][] lately (well, and [also at
spare time][]), and it is always nice to have the possibility of having
the interactive interpreter to play with. But sometimes my mind refuses
to stop working, so I wondered whether there would be a simple way of
improving the overall user experience when using the stock Python
interpreter without needing to install alternative ones like
[bpython][], [IPython][] or [Reinteract][]. The idea is to have
something *a bit better* without throwing in additional dependencies.

So I lurked a bit by the documentation and learnt about the
[PYTHONSTARTUP][] environment variable. Next step? Fired out `$EDITOR`
and created a `~/.startup.py` file with the following contents:

```python
import readline, atexit, os, rlcompleter

historypath = os.path.expanduser("~/.pyhistory")
readline.parse_and_bind("tab: complete")

def save_history(historypath=historypath):
    import readline
    readline.write_history_file(historypath)

if os.path.exists(historypath):
    readline.read_history_file(historypath)

atexit.register(save_history)

del os, atexit, readline, save_history, historypath, rlcompleter
```

The most important thing is to bind the `Tab` key for completion. That
`complete` function already comes bundled with the Python binding for
[readline][] (and compatibles), and will complete names for functions,
variables, classes, methods, etc.

The rest of the snippet deals with saving the history of entered lines
to a file when the interpreter is exited. The trick there is the
`historypath=historypath`, to make that variable an [upvalue][]. Being
that way, we can clean up everything (last line) after initialization,
so the interpreter will not get its global namespace poluted.

Finally, make `PYTHONSTARTUP` to be defined in every shell creation:

```bash
echo 'export PYTHONSTARTUP="$HOME/.startup.py"' >> .bashrc
```

Now re-launch your shell, type in `python` and enjoy your
freshly-supercharged interpreter:

```
$ exec bash -l
$ python
Python 2.5.5 (r255:77872, Mar 20 2010, 05:19:32)
[GCC 4.4.3] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> import os
>>> os. # tap TAB two-times here
Display all 224 possibilities? (y or n)
```

  [Python]: http://www.python.org
  [also at spare time]: /aperez/2010/04/surrender-to-subrender/
  [bpython]: http://bpython-interpreter.org/
  [IPython]: http://ipython.scipy.org/
  [Reinteract]: http://www.reinteract.org/
  [PYTHONSTARTUP]: http://docs.python.org/using/cmdline.html#envvar-PYTHONSTARTUP
  [readline]: http://tiswww.case.edu/php/chet/readline/rltop.html
  [upvalue]: http://en.wikipedia.org/wiki/Upvalue
