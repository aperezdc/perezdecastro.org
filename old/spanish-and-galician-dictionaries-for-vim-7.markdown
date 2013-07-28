Title: Spanish and Galician dictionaries for Vim 7
Date: 2010-01-07 18:05
Author: aperez
Category: Igalia
Tags: vim

If you write long, literary text (like end-user documentation) in
Spanish and/or Galician, and [Vim][] 7 is your editor of choice, you may
want to download the [spell checker dictionaries for those
languages][]. To use them, drop the files under `~/.vim/spell`. (By the
way, you may need to create the directory if needed).

To use the dictionaries, just type in the needed Ex command, e.g. for
Galician that would be:

      :set spell spelllang=gl

If you use modelines in your text files, you may want to add those
settings there as well. That makes an easy way to choose a different
language for each file. Also, do not forget to take a look at the [spell
checker documentation][] to learn more about it (tip: some keybindings
are really useful).

Note that you will only be able of editing UTF-8 texts. I have not
crafted ISO-8859-1 versions of the dictionary tables because no single
person should be using an encoding different from UTF-8 nowadays (for a
[number][] of [good reasons][]). If someone has a strong need for
ISO-encoded tables, please let me know.

Last but not least, let me stress that the dictionaries were converted
from the ones used by [OpenOffice.org][] plus some small patches I took
from the Vim SVN repository. Big thanks go to the all the people working
in both projects. I am not an expert with legal stuff, but as the source
files are under the [LGPL][] I think it is safe to assume that the
Spanish and Galician dictionaries generated from them are LGPL'd, too.

Remember: it is always good to deliver well-written documents. Happy
2010 ;-)

  [Vim]: http://www.vim.org
  [spell checker dictionaries for those languages]: http://people.igalia.com/aperez/vim.html
  [spell checker documentation]: http://vimdoc.sourceforge.net/htmldoc/spell.html
  [number]: http://developers.sun.com/dev/gadc/technicalpublications/articles/utf8.html
  [good reasons]: http://www.tbray.org/ongoing/When/200x/2003/04/06/Unicode
  [OpenOffice.org]: http://www.openoffice.org
  [LGPL]: http://www.gnu.org/copyleft/lesser.html
