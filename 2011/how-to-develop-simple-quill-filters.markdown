Title: How to develop (simple) Quill filters (and make them available to users)
Date: 2011-09-21 01:27
Author: aperez
Category: Hacking
Tags: c, meego, plugin, qt, quill

So, you are a developer and want to get your hands dirty coding for the
for the [Nokia N9][] (and maybe you even got one of those nifty [Nokia
N950][] handsets), or just want to add some extra capabilities to
[Quill][]... Anyway, for me the journey started while toying with the
[Gallery application][]: I noticed that three is no tool that would
convert images to grayscale in the image edition mode! So I decided to
step in and hack on a bit.

**The result**  
Take a close look at the middle screenshot in the image below. Can you
spot the “Desaturate” tool?

[![Desaturate plugin in action](http://farm7.static.flickr.com/6170/6150764021_743b2401fc.jpg)](http://www.flickr.com/photos/aperezdc/6150764021/in/photostream)

That tool is added to the Gallery application by the plugin I have
implemented. The source code is [available at Gitorious][] and is
licensed under the LGPLv2. A binary package can be downloaded [here][].

**Tools of the trade**  
This is what was needed to get the job done:

-   The [MeeGo 2.1 Harmattan SDK][], installed and working.
-   A peek at the API documentation of [libquillimagefilter][],
    [GalleryEditPlugin][] and [GalleryEditUiProvider][].
-   The source code of the [existing Quill filters][] — because it's
    always nice to get “inspiration” from somewhere ;-)
-   Some coffee to drink.

**Gallery plugin**  
The Gallery application in the N9/N950 supports loading the so-called
“edit plugins”. It will try to load all the `.so` files it finds in
`/usr/lib/gallery`. Each of those should contain a subclass of
[GalleryEditPlugin][]. A minimum subclass declaration would look like
this:

```cpp
class GalleryDesaturatePlugin: public GalleryEditPlugin {
    Q_OBJECT
    Q_INTERFACES(GalleryEditPlugin);
public:
    GalleryDesaturatePlugin(QObject* parent = 0);
    virtual ~GalleryDesaturatePlugin();
    QString name() const;
    QString iconID() const;
public Q_SLOTS:
    void performEditOperation();
private:
    Q_DISABLE_COPY(GalleryDesaturatePlugin)
};
```

The first interesting method is `name()`. It must return the string
which will be shown as tool name when using the edition mode in Gallery.
The simplest possible implementation is just to return a constant
string:

```cpp
QString
GalleryDesaturatePlugin::name() const
{
    return QString("Desaturate");
}
```

As an additional improvement, it would have been nice to provide
internationalization support, and return a string translated to the
language configured by the user in the system settings. I had no time to
figure out how to provide translations for a plugin yet, so the simple
approach will do for now.

The next method is `iconID()`, which returns a string with an identifier
of the icon to be presented next to the tool name. It is enough to
return the file name without the suffix, and the icon will be picked
from `/usr/share/themes/blanco/meegotouch/icons/`. In our case, let's
use one of the images included by default:

```cpp
QString
GalleryDesaturatePlugin::iconID() const
{
    return QString("icon-m-camera-filter-black-white-screen");
}
```

Next step is to implement the juicy part: `performEditOperation()`.
Let's first see the code:

```cpp
void
GalleryDesaturatePlugin::performEditOperation()
{
    if (editUiProvider()) {
        QHash options;
        editUiProvider()->runEditFilter("com.igalia.aperez.desaturate", options);
    }
    emit editOperationPerformed();
}
```

Now maybe you are wondering where pixel data of the image is being
manipulated... that's actually a good question! It turns out that
Gallery uses the Quill library to do image handling, so it off-loads the
actual implementation of image filters to it. The snippet above just
calls the `runEditFilter()` method of [GalleryEditUiProvider][], which
takes an identifier of a Quill filter plus a set of options, and runs it
over the image. It would be tempting to just implement our pixel
mangling here, but nor the `GalleryEditPlugin`, nor the
`GalleryEditUiProvider` will give us access to the image data! Reading
[through the Quill documentation][] I noticed that it supports infinite
undo and redo... same as the edit mode of the Gallery application! It
makes sense that the Gallery API forces the developer to use a Quill
filter to ensure that image edit history is seamlessly supported. If
Gallery allowed to directly manipulate data, a plugin could go against
the user experience presented by the application allowing to
destructively edit images.

**Quill filter plugin**  
The good thing about having to implement a Quill plugin is the fact
that any application using `libquillimagefilter` will be able of using
it. Also, when also using `libquill`, support for infinite undo and redo
is provided. For free, no strings attached. Plugins are loaded from
`/usr/lib/qt4/plugins/quillimagefilters`.

Quill filter plugins are a bit different from the Gallery edit tool
plugins. A subclass of [QuillImageFilterInterface][] will act as a
factory class that the library uses for creating getting information
about the filters implemented by a plugin, and for instantiating the
filters themselves. This means one plugin can define more than one
filter, which is useful for implementing filters that have common parts
in their implementation, or that are logically related. On the other
side, each filter is a subclass of [QuillImageFilterImplementation][],
and will do the actual pixel mangling.

Let's look at the plugin declaration first:

```cpp
class QuillDesaturatePlugin: public QObject, public QuillImageFilterInterface
{
    Q_OBJECT
    Q_INTERFACES(QuillImageFilterInterface)
public:
    QuillImageFilterImplementation* create(const QString& name);
    const QStringList name() const;
private:
    Q_DISABLE_COPY(QuillDesaturatePlugin)
};
```

The method `name()` returns a list of the names of all the filters
implemented by the plugin. Or, to be more precise, the names of the
filters that the plugin can actually instantiate. Our simple plugin
returns only one name:

```cpp
#define FILTER_NAME_DESATURATE "com.igalia.aperez.desaturate"

const QStringList QuillDesaturatePlugin::name() const
{
    return QStringList() << FILTER_NAME_DESATURATE;
}
```

Instantiation of the filters happens in the `create()` method. Note
that, if some filter name is not known, or for some reason it is
impossible to instantiate the filter, it is valid to return a null
pointer:

```cpp
QuillImageFilterImplementation*
QuillDesaturatePlugin::create(const QString& name)
{
    if (name == FILTER_NAME_DESATURATE) {
        return new Desaturate;
    } else {
        return 0;
    }
}
```

The only remaining bit is the filter implementation itself. The
declaration looks like:

```cpp
class Desaturate: public QuillImageFilterImplementation
{
public:
    QuillImage apply(const QuillImage& image) const;
    virtual const QString name() const;
};
```

The `name()` method is trivial to implement, and it must return the name
used to identify the filter itself:

```cpp
const QString
Desaturate::name() const
{
    return FILTER_NAME_DESATURATE;
}
```

Actual image data manipulation (at last!) happens in the `apply()`
method. The original image is passed as argument, but it is declared as
constant and it must not be modified. The proper *modus operandi* is to
create a copy (or a completely new image) and modify it in-place. The
images passed back and forth are [QuillImage][] instances, which is a
subclass of the well-known [QImage][]. Any algorithm and operation that
can be done with a QImage will work just right. To make things even
easier, images will be always RGBA, so it is not needed to handle
different pixel formats. The implementation for converting images to
grayscale (i.e. “desaturating” them) is quite straightforward:

```cpp
QuillImage
Desaturate::apply(const QuillImage& image) const
{
    QuillImage result(image);

    QRgb* endp(reinterpret_cast(result.bits() + result.numBytes()));
    for (QRgb *p = reinterpret_cast(result.bits()); p < endp; p++) {
        int value = (qRed(*p) + qGreen(*p) + qBlue(*p)) / 3;
        *p = qRgba(value, value, value, qAlpha(*p));
    }

    return result;
}
```

For each pixel in the image, the alpha value is kept (to leave the
transparency untouched, in formats that support it like PNG), and an
average of the red, green and blue components is done to get the
intensity of grey for each pixel. This algorithm, even when being
completely unoptimized and naïve (there are for sure algorithms that
render better quality), works “well enough” and is “fast enough” even
for huge images.

**Bottom line**  
Wrapping up, this is how things work, bottom up:

-   A filter implementation (subclass of
    [QuillImageFilterImplementation][]) does the pixel data
    manipulation.
-   To make Quill use the filter, a plug-in implementing
    [QuillImageFilterInterface][] should declare it as supported, and it
    must be able to instantiate it.
-   Quill handles undo/redo for us :-)
-   Gallery plug-ins forward the actual work to Quill filters. This
    ensures that undo/redo is not broken.</tt>
-   Gallery plug-ins are merely an stub which informs the application
    about how to display a tool. It may also implement the user
    interface for filters needing it.

There are a number of topics that are not covered in this how to, like
how to add an user interface to a Gallery tool plugin, or how to package
the plugins to make them user-installable. Also, some details were left
off to avoid unnecessary noise, so I would encourage readers to [take a
look at the source code][available at Gitorious] for the plugin
presented here.

Side note: As a bonus, plugins made this way will also work from the
post-capture view of the Camera application of the N9/N950.

Now, go and do your own filters! Happy hacking...

  [Nokia N9]: http://swipe.nokia.com/
  [Nokia N950]: https://meego.com/community/device-program/devices/nokia-n9-devkit
  [Quill]: https://maemo.gitorious.org/meego-image-editor/
  [Gallery application]: http://conversations.nokia.com/2011/07/19/editing-photos-on-the-nokia-n9/
  [available at Gitorious]: https://gitorious.org/aperez-sandbox/harmattan-plugin-desaturate
  [here]: http://people.igalia.com/aperez/files/gallery-plugin-desaturate_1_armel.deb
  [MeeGo 2.1 Harmattan SDK]: http://harmattan-dev.nokia.com/
  [libquillimagefilter]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libquillimagefilter/
  [GalleryEditPlugin]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libgallerycore/class_gallery_edit_plugin.html
  [GalleryEditUiProvider]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libgallerycore/class_gallery_edit_ui_provider.html
  [existing Quill filters]: https://maemo.gitorious.org/meego-image-editor/quillimagefilters/trees/master/src/plugins
  [through the Quill documentation]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libquill/class_quill_undo_stack.html
  [QuillImageFilterInterface]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libquillimagefilter/class_quill_image_filter_interface.html
  [QuillImageFilterImplementation]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libquillimagefilter/class_quill_image_filter_implementation.html
  [QuillImage]: http://harmattan-dev.nokia.com/unstable/beta/api_refs/xml/daily-docs/libquillimagefilter/class_quill_image.html
  [QImage]: http://doc.qt.nokia.com/4.7/qimage.html
