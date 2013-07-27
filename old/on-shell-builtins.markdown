Title: On shell builtins
Date: 2008-10-09 13:07
Author: aperez
Category: Igalia
Tags: bash

Today I will explain a «misfeature» of the Bash shell which may puzzle
you at first sight, but which has its own internal logic. Take the
following example:

    f () {
      echo "I return false"
      return 1
    }

    g1 () {
      local v=$(f)
      echo "Exit status is $?"
    }

    g2 () {
      local v
      v=$(f)
      echo "Exit status is $?"
    }

    g1
    g2

This script would produce the following output:

    Exit status is 0
    Exit status is 1

You may wonder why the call to `g1` does not print `1`. The reason is
that `local` is no more than a shell built-in command: first, the
command expansion executes and the exit status variable `$?` is set to
`1`, but then the `local` built-in executes and succeeds, and the exit
status variable gets set to zero *before* we inspect it!

The bottom line is: **never ever expand a command in the same line where
you declare variables.**
