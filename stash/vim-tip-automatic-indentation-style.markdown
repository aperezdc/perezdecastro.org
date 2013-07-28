Title: Vim tip: Automatic indentation style
Date: 2009-02-11 12:49
Author: aperez
Category: Igalia
Tags: vim

Today I have found the perfect solution for one of the usual headaches
when you are diving into code of several projects which have different
coding style: indentation. Just grab [the DetectIndent script][], place
it into `~/.vim/plugin` and execute the `:DetectIndent` command when
desired. It will just do what one would expect: adjusting Vim
indentation settings to match those of the current buffer. Of course it
is not perfect, because it must work by analyzing the text and it could
make a bad guess, but I have experienced no problem so far :-)

There are a lot of rarely used resources for the [Vim][] editor, and
most people sticks with default configurations provided by packagers of
GNU/Linux distributions, even when some of them do not use Vim
themselves! It has been online for a while, but today I wanted to let
you know that I am sharing [my configuration file][]. In the last five
years, it has evolved from a simple file with a dozen of lines to a
beast of \~600 lines, which includes hacks from several sources, as well
as my own stuff.

Enjoy! ;-)

  [the DetectIndent script]: http://www.vim.org/scripts/script.php?script_id=1171
  [Vim]: http://www.vim.org
  [my configuration file]: http://furi-ku.org/files/vimrc.local
