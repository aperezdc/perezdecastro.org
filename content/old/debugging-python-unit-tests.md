+++
title = "Debugging Python unit tests"
date = 2010-07-16

[taxonomies]
categories = ["igalia"]
tags = ["python"]
+++

I have been doing quite some [Python][] hacking lately, especially unit
testing, and I have found some “funny” bugs in a piece of code. I wanted
to do some step-by-step debugging, but I did not want to manually invoke
the debugger with the same environment as the unit tests, because the
preparation needed for test cases is not trivial.

Then I decided to re-read the [Pdb documentation][], and found a
super-handy feature: the `set_trace()` function. I short, you can insert
the following snippet in almost any piece of code:

```python
import pdb
pdb.set_trace()
```

...and when the execution flow call `set_trace()`, the debugger will
take over the terminal and display the familiar `(Pdb)` prompt, being
the environment that of the scope where `set_trace()` was called.

  [Python]: http://www.python.org
  [Pdb documentation]: http://docs.python.org/release/2.7/library/pdb.html
