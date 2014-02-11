Title: A tale of multiple processes in WebKitGTK+
Date: 2014-02-17 23:45
Author: aperez
Tags: webkit, igalia

One of the goals we defined during the 2013 edition of the WebKitGTK+
hackfest —among others— was enabling the Network Process, which my
colleague [Carlos already blogged about right after the
hackfest](http://blogs.igalia.com/carlosgc/2013/12/12/webkitgtk-hackfest-2013-the-network-process/),
and with that in place, we would be then able to support having one Web
Process for each
[WebKitWebView](http://webkitgtk.org/reference/webkit2gtk/unstable/WebKitWebView.html).
Fast forward one month and a half to [version
2.3.5](http://webkitgtk.org/2014/02/05/webkitgtk2.3.5-released.html):
this is the first release of WebKitGTK+ shipping with support for the
Network Process and multiple Web Processes.

This feature enables applications which use multiple views to be much,
*much* more robust. Previously, one single Web Process was shared among
all the web views in an application, meaning that rogue web content could
stall the Web Process —or even worse, make it crash— and all the views
in the application would suddenly stop working. *All* of them. Translating
this to a familiar use of WebKitGTK+: each tab in [your favorite
Web browser](https://wiki.gnome.org/action/show/Apps/Web) will be completely
kaputt and rendered unusable as soon as *just one* of the loaded web pages
causes havoc. With multiple Web Processes though, only the web view
(read: browser tab) causing trouble would stop working, and the rest will
keep running completely unaffected by it.


## More processes, Igor!

We have not only enabled support for multiple processes: as a bonus, it
has been made optional. That is good if your application will keep using
the shared Web Process mode for all the web views: that is the
default setting. Simple applications that deal with content know to be
safe, like [Yelp](https://wiki.gnome.org/action/show/Apps/Yelp) or
[Devhelp](https://wiki.gnome.org/action/show/Apps/Devhelp) do not need
any changes.

Applications can change the [process
model](http://webkitgtk.org/reference/webkit2gtk/unstable/WebKitWebContext.html#WebKitProcessModel)
with a single API call:

```cpp
int main(int argc, char **argv)
{
  webkit_web_context_set_process_model (
      webkit_web_context_get_default (),
      WEBKIT_PROCESS_MODEL_MULTIPLE_SECONDARY_PROCESSES);

  /* The rest of the application code, unmodified */
}
```

<figure class="image">
	![](http://perezdecastro.org/2014/wk-processes-everywhere.png)
	<figcaption>The result of a single function call</figcaption>
</figure>

Setting the process model **must be done as early as possible** in
application code or, more precisely, before any other API calls that
would cause a Web Process to be spawned. That is: before creating
a web view *and* also before any other method call that would make
WebKitGTK+ reach for the network. This is a hard requirement, and
**not doing as advised will make your application crash**. You have
been warned.


## Taking one step back

While having separate Web Processes is great and all, it is reasonable
to wonder whether that should be the one and only option… Is there
some mid-term approach that would be more reasonable? Moreover, how memory
usage fares with the process galore we have just unleashed? Is WebKitGTK+
going to cause an involuntary <abbr title="Denial Of Service">DoS</abbr>
attack in systems with scarce memory?

<figure class="image">
	![](http://perezdecastro.org/2014/fry-wk-process-mapping.png)
	<figcaption>Fry also wonders</figcaption>
</figure>

As it turns out, there are a number of situations in which having exactly
one Web Process for each `WebKitWebView` is not the best option:

* Pages which open multiple browser windows may want to use JavaScript to
	manipulate the state of one window from the other, or open links in
  a named window created by specifying the [target
	attribute](http://www.w3.org/TR/1999/REC-html401-19991224/present/frames.html#h-16.3.2).
	Sharing the state may be needed in those cases.
* Applications may want to decide under which circumstances to create new
	processes. For example, a web browser could implement a mode in which each
	different domain is assigned a Web Process, and all the views displaying
	content from the same domain use the same process.
* When memory goes low, it would be interesting to make web views start
	sharing processes, to try to make better use the memory.

Therefore, [Carlos](http://blogs.igalia.com/carlosgc/) has added a new
function in the API to allow application developers to create “related”
web views, which will share a Web Process:

```cpp
GtkWidget *view, *related_view, *unrelated_view;

void create_views ()
{
  /* Create two views which share a Web Process */
  view = webkit_web_view_new ();
  related_view =
    webkit_web_view_new_with_related_view (WEBKIT_WEB_VIEW (view));

  /* This view will spawn a new Web Process */
  unrelated_view = webkit_web_view_new ();
}
```

While this does not directly solve the case in which WebKitGTK+ limits by
itself the amount of processes being used —which is a feature that may be
in an upcoming release—, it covers the most interesting use case without
breaking the API: once again, existing applications wanting to stay in the 
single process world do not need any changes to their code.


## Added complexity: the case for Web Extensions

Unfortunately, there were some assumptions in WebKitGTK+ that no longer
hold true now that it is possible to have multiple Web Processes. Even
when we have tried to make as easier as possible for applications to switch
to multiprocess mode, it is very likely that applications using [Web
Extensions](http://webkitgtk.org/reference/webkit2gtk/unstable/WebKitWebExtension.html)
will need to be updated to handle the fact that each Web Process will
load and instantiate the Web Extensions.

<figure class="image">
	![](http://perezdecastro.org/2014/wk-not-simply-spawn-processes.png)
	<figcaption>Because things are never like that in real life</figcaption>
</figure>

A common pattern to establish a communication channel between a Web
Process and an application using WebKitGTK+ is for a Web Extension to
use D-Bus to expose a known [unique name](http://dbus.freedesktop.org/doc/dbus-specification.html#message-bus-names),
and the application waits for message bus to appear and connects to it.
Unfortunately, it is no good having multiple instances of a Web Extension
trying to register the same name on the bus—names are *unique!*

One option we briefly considered was allowing to application to know the
process identifier of the Web Process associated to a Web View, which
would allow to use the process identifier to generate an unique name.
Instead, we introduced a way to enable applications to pass arbitrary
data to Web Extensions before they are initialized, and allow extensions
to retrieve the data during their initialization: this way the application
can generate an unique identifier, and pass it to the extensions without
exposing a low-level detail like a process identifier in the public API.
Plus, being allowed to pass arbitrary data is a much more generic solution,
it avoids the needs for [ugly hacks](https://git.gnome.org/browse/epiphany/commit/?id=aaf6422a17c7080f98d2d82d95ff6313ca500c0a),
and in cases where Web Extensions do not need to pass information back to
the application it avoids needing to use an additional communication
channel.

Using this new facility, the application can set any data that can be
represented as
a [GVariant](https://developer.gnome.org/glib/stable/glib-GVariant.html)
to be passed to Web Extensions on initialization:

```cpp
#define WEB_EXTENSIONS_DIRECTORY /* ... */

int main (int argc, char **argv)
{
  WebKitWebContext *context = webkit_web_context_get_default ();
  GVariant *data = get_data_for_web_extensions ();

  webkit_web_context_set_web_extensions_directory (
      context, WEB_EXTENSIONS_DIRECTORY);
  webkit_web_context_set_web_extensions_initialization_user_data (
      context, data);

  GtkWidget *view = webkit_web_view_new ();

  /* ... */
}
```

In the code for the Web Extensions, the signature and name of the
[initialization
function](http://webkitgtk.org/reference/webkit2gtk/unstable/WebKitWebExtension.html#WebKitWebExtensionInitializeWithUserDataFunction)
has to be changed, for an additional argument with the user data to
be passed to the initialization function:

```cpp
void webkit_web_extension_initialize_with_user_data (
    WebKitWebExtension *extension, GVariant *user_data)
{
  /* Initialize the extension, using “user_data” */
}
```

But there is still one use-case that this mechanism alone does not
cover: passing different user data to each instance of a Web Extension
running in a separate Web Process. This is the reason for the new
[initialize-web-extensions](http://webyykitgtk.org/reference/webkit2gtk/unstable/WebKitWebContext.html#WebKitWebContext-initialize-web-extensions).
This signal is emitted exactly before spawning a Web Process that will
instantiate new instances of the Web Extensions, and its callback function
is guaranteed to be the most appropriate moment to set the data that will
be passed to the Web Exntensions on initialization:

```cpp
#define WEB_EXTENSIONS_DIRECTORY /* ... */

static void
initialize_web_extensions (WebKitWebContext *context, gpointer user_data)
{
  /* Web Extensions get a different ID for each Web Process */
  static guint32 unique_id = 0;

  webkit_web_context_set_web_extensions_directory (
      context, WEB_EXTENSIONS_DIRECTORY);
  webkit_web_context_set_web_extensions_initialization_user_data (
      context, g_variant_new_uint32 (unique_id++));
}

int main (int argc, char **argv)
{
  g_signal_connect (webkit_web_context_get_default (),
                    "initialize-web-extensions",
                    G_CALLBACK (initialize_web_extensions),
                    NULL);

  GtkWidget *view = webkit_web_view_new ();

  /* ... */
}
```

With this final bit, there is not just a way of knowing when a Web Process
is about to be spawned: the best moment to set the data for the initialization
of Web Extensions is also known.


## Check list

To change the process model:

* Use `webkit_web_context_set_process_model()` to set the [process
	model](http://webkitgtk.org/reference/webkit2gtk/unstable/WebKitWebContext.html#WebKitProcessModel).

To pass initialization data to Web Extensions:

* Use `webkit_web_context_set_web_extensions_initialization_user_data()`
  to pass arbitrary data to Web Extensions.
* Rename the `webkit_web_extension_initialize()` function in Web Extensions
  to `webkit_web_extension_initialize_with_user_data()`, in order
  to receive the initialization user data.

To update make Web Extensions play well with multiple processes:

* Use the [initialize-web-extensions](http://webyykitgtk.org/reference/webkit2gtk/unstable/WebKitWebContext.html#WebKitWebContext-initialize-web-extensions)
  signal and set the initialization user data from the callback.


## Some final words

Having all those pieces in WebKitGTK+ means that support for multiple
processes (one per tab) in the GNOME [Web browser](https://wiki.gnome.org/action/show/Apps/Web)
is happening. Right now the needed changes are already in the Git
repository, and at the Igalia browsers team we are doing steady progress
to have multiprocess support in Web as an opt-in setting for the next
release of GNOME. Brave souls can build Web (and WebKitGTK+) themselves,
and enable the multiprocess mode using `gsettings`:

```bash
gsettings set org.gnome.Epiphany \
    process-model one-secondary-process-per-web-view
```

Last, but not least, I want to mention that all this is possible to all the
restless developers who devoted time to make multiprocess in WebKitGTK+
happen after we kickstarted the work [during the WebKitGTK+ hackfest](http://blogs.igalia.com/carlosgc/2013/12/12/webkitgtk-hackfest-2013-the-network-process/).

Happy times!
