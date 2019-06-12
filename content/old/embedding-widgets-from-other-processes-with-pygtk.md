+++
title = "Embedding widgets from other processes with PyGTK"
date = 2009-07-14
taxonomies.categories = ["igalia"]
taxonomies.tags = ["gtk", "python"]
+++

After discovering the [Surf][] minimalistic web browser, I was just
curious on how difficutl would it be to use [the XEmbed protocol][] to
wrap it into another application. It is far easier than I thought
initially by using the [gtk.Socket][] class which does implement the
protocol in a convenient way, for example using the following Python
code:

```python
import gtk, sys

socket = gtk.Socket()
window = gtk.Window()
window.set_title(u"Embedded widget")
window.add(socket)

# Embed *after* inserting the socket in a window!
socket.add_id(int(sys.argv[1]))
window.show_all()
gtk.main()
```

Save this in a file (e.g. `embed.py`) and now you can run Surf the
following way:

```bash
# Running surf with -e will print the X window ID
surf -e -u http://google.com &
python embed.py <window-id>
```

*(Thanks go to [Claudio][] for pointing out the `gtk.Socket`/`gtk.Plug`
classes)*

  [Surf]: http://surf.suckless.org/
  [the XEmbed protocol]: http://standards.freedesktop.org/xembed-spec/xembed-spec-latest.html
  [gtk.Socket]: http://library.gnome.org/devel/pygtk/stable/class-gtksocket.html
  [Claudio]: http://blogs.igalia.com/csaavedra
