Title: Python recipe: Functional config file parsing
Date: 2009-12-12 04:17
Author: aperez
Tags: python, igalia

Sometimes one has to parse programmatically some file containing
`key=value` pairs. In the world of systems administration this means
configuration files most of the time. Also, one thing I like is
[functional programming][], but in the real world one ends up making
almost all of the code in [imperative][] style. Python allows some
functional constructs, and sometimes I like to use them to make code
most concise, because it express better what the code is trying to do or
just because I wanted to melt my mind doing some functional tricks.

First, let me introduce the code:

```python
from itertools import imap, ifilter

config_items = lambda iterable: 
    imap(lambda (k, v): (k.strip(), v.strip()),
        imap(lambda s: s.split("=", 1),
            ifilter(lambda s: s and not s.startswith("#"),
                imap(lambda s: s.strip(), iterable))))
```

Neat, huh? As promised in the title, this is functional. And yes, I am
aware of [ConfigParser][], but I do not need its full power, and also I
have found some problems with files containing [Unicode][] strings.

I think this is one of the most beautiful snippets of code I have ever
written in Python: it makes just one thing well, and it is terse and
concise. Moreover, it is quite easy to explain.

## How does it work

I have just written that it is easy to explain how this works. Okay, I
will dissect this beast one line at a time, starting at the innermost.
But first, a quick introduction to `imap()` and `ifilter`:

-   **`imap()`**: Works like `map()`, which returns a list whose
    contents are the results of applying a function (first argument) to
    each of the elements of another list (the second argument). The
    difference is that `imap()` uses [generators][] instead.
-   **`ifilter()`**: This one works like `filter()` and will also return
    a list, whose contents are the items of another list (second
    argument) for which the result of calling the given function (first
    argument) is `True`. This one also works with generators.

Now, let us start with the first one:

```python
imap(lambda s: s.strip(), iterable)
```

This picks each line, and removes whitespace sitting at the left and and
the right of the string.

```python
ifilter(lambda s: s and not s.startswith("#"),
```

We want to keep *interesting* lines: empty lines and comment-lines
starting with a hash mark (`#`) must be thrashed away. We check for
lines which *both* are not empty and that do not start with a hash-mark.

```python
imap(lambda s: s.split("=", 1),
```

That one picks each string and splits it at the first `=` character,
thus separating the key from the value. This is what converts each
string into a `(key, value)` tuple.

```python
imap(lambda (k, v): (k.strip(), v.strip()),
```

This is the last remaining detail: Removes extra leading and trailing
whitespace from the keys and values of the generated tuples. This is
needed for removing the spaces around the `=` character.

## How to use it

Fire in the interpreter, type in (or copy-and-paste) the above code and
guess by yourself:

```
>>> text = """a = 1
... b = this is b"""
>>> tuple(config_items(text.splitlines()))
(('a', '1'), ('b', 'this is b'))
>>> dict(config_items(text.splitlines()))
{'a': '1', 'b': 'this is b'}
>>> 
```

So you pass it ~~a list~~ an iterable which yields lines, and it will
return another iterable, which yields `(key, value)` tuples. Thanks to
how `dict()` is defined, we can directly pass the result to it and get a
dictionary.

But it would be useful as well to use it on files, so here we go:

```
>>> file("test.conf", "w").write(text)
>>> dict(config_items(file("test.conf")))
{'a': '1', 'b': 'this is B'}
>>>
```

For your convenience, you may want to define a helper function if it
makes you feel more comfortable:

```
>>> def config_file_items(path):
...    with file(path, "rU") as f:
...        return config_items(f)
...
>>> dict(config_file_items("test.conf"))
{'a': '1', 'b': 'this is B'}
>>>
```

## Extra niceties

I have already mentioned that this code uses [generators][] in its
entirety. What is passed from one function to another in the chain of
`imap()` and `ifilter()` calls are *always* generators. This means that
if `config_items()` is used to read a big file (e.g. some hundreds of
megabytes) *only one line is in memory at a given time*. This is why I
did not use `map()` and `filter()` but their “incremental” counterparts
from the `itertools` module. So the bottom line is that this may not be
the most efficient implementation out there, but it is good and is
capable of working over arbitrarily long sequences of data while the
function remains small and understandable.

## Error Handling

Whenever the input is not well formed, then this function will raise
`ValueError`, or when a `=` character is not found in some line. This
means that you can do something like this:

```python
import sys
try:
    items = dict(config_items(sys.stdin))
except ValueError:
    raise SystemExit("Malformed 'key=value' input in standard input")
```

Of course more elaborate error checking could be done i.e. to be able of
showing to the user the exact offending line number, but the goal is to
keep things as simple as possible. Also the syntax of those simple
configuration files is so simple that it should be fairy simple for the
user to spot typos.

## Final words and advice

My advice is that if you have the possibility, make your Python code in
such a way that it uses generators, unless you are sure that it will
*always* handle reasonably small amounts of data.

I hope that things are explained well enough, and (who knows!) maybe
this can help someone to better understand why generators are a good
idea. I will also be happy if you came here looking for some code to
parse simple configuration files and this did the trick for you.

  [functional programming]: http://en.wikipedia.org/wiki/Functional_programming
  [imperative]: http://en.wikipedia.org/wiki/Imperative_programming
  [ConfigParser]: http://docs.python.org/library/configparser.html
  [Unicode]: http://en.wikipedia.org/wiki/Unicode
  [generators]: http://www.python.org/dev/peps/pep-0289/
