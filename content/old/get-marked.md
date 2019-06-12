+++
title = "Get Marked"
date = 2009-01-08
taxonomies.categories = ["igalia"]
taxonomies.tags = ["vim"]
+++

If you are a [Vim][] user (like me) you may be surprised to know (as I
was today) that you can add *jump marks* to save positions in files and
then go back to the marked positions used simple keystrokes:

-   With `mX`, where `X` is a letter, a mark will be set.
-   With `'X`, Vim will take you to the line marked with mark `X`.

Easy, isn't it? If you are curious, you can read more on [this Linux.com
article][]. And do not forget to configure a [viminfo file][] to save
marks between edit sessions and you will get the full mark-on-the-go
feature pack.

  [Vim]: http://www.vim.org
  [this Linux.com article]: http://www.linux.com/articles/54159
  [viminfo file]: http://www.vim.org/htmldoc/starting.html#viminfo
