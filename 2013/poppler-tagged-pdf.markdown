Title: Tagged-PDF: Coming to a Poppler near you
Date: 2013-10-14 16:30
Tags: igalia

As part of the work [Igalia](http://igalia.com) has been doing on the [Friends of GNOME
Accessibility project](http://www.gnome.org/news/2013/02/call-for-bids-for-gnome-accessibility-work/),
I implemented parsing the additional
information present in Tagged-PDF documents in
[Poppler](http://poppler.freedesktop.org/). The state of the implementation
and all related issues are being tracked in Bugzilla using [metabug
\#64813](https://bugs.freedesktop.org/show_bug.cgi?id=64813): as of today, the
[first](http://cgit.freedesktop.org/poppler/poppler/commit/?id=e04cabd878a0fd84faa5178f423fd828d010b664)
[patches](http://cgit.freedesktop.org/poppler/poppler/commit/?id=402ee8b4e31630a42a0a38db1d39164cc5789f3c)
[have been landed](http://cgit.freedesktop.org/poppler/poppler/commit/?id=45e0fe56985f34e695c99a2f6ec1ffe14e239b9e), 
and the rest are expected to be moved progressively from
the [tagged-pdf
branch](http://cgit.freedesktop.org/poppler/poppler/log/?h=tagged-pdf)
to `master`. 


## What Tagged-PDF brings to the table

The [PDF specification](https://www.adobe.com/devnet/pdf/pdf_reference.html),
a huge 750 page document, includes the Tagged-PDF specification, which
is part of the [ISO PDF/A-1a](http://en.wikipedia.org/wiki/PDF/A#PDF.2FA-1)
standard. It specifies how a document can:

* Describe its structure: a tree of nodes describing each entity of the
  document (headings, paragraphs, images, form items, etc) is provided,
  optionally including additional metainformation describing how the
  element is styled.

* A way for non-textual content to be described. Think of it as the `alt`
  attribute of `<img>` elements in HTML, but in a PDF document almost any
  element may have an alternate text (not only images).

Having access to this information is of interest to users of assistive technologies.
For instance, a screen reader can inform the user about the type of information being read,
whether the text is emphasized, whether it is reading a series of data from a table,
and so on. But Tagged PDF support can greatly improve the experience in additional ways:

* Document viewers can provide the user an accurate outline of the elements
  in the document. Note that this would not be the same as the table of
  contents which can also be present in PDF files: the outline can be
  extracted automatically from the document structure, instead of being
  made.

* Viewers can provide means to jump around the document more efficiently
  *and* accurately: for example moving one paragraph at-a-time, skipping
  to the next image or table, etc. The possibilities are endless.

* Searching in documents can be more powerful. Imagine being able to
  search for images which contain a certain word in their description,
  or search only inside a table or a paragraph.

* Text extraction can be done more accurately, in particular when dealing
  with documents in which the page layouts are non-linear.

Therefore, implementing support in Poppler for reading all the Tagged-PDF
information from PDF files is an important first step which will enable
applications to provide a better user experience.


## The document structure in Poppler

The main goal for the implementation was to be able to use the Tagged-PDF
information in document *viewers*. As a result, the implementation so far
does not have editing capabilities. On the bright side, being able to focus
on parsing meant that I had time to make it almost 100% complete, and the
parser will try to extract as much as possible from the document structure
tree before bailing out—even with corrupted files or malformed tress.

Because the document structure is read-only, the objects representing it
are created the first time the structure tree is accessed, and they are
all owned by the document `Catalog` object (i.e. you do not need to delete
them after using them). Iterating over the tree structure elements is
very easy:

```cpp
static void
handleElement(const StructElement *element)
{
        // Do something with "element". For example, print the contained text.
        if (element->isContent()) {
                GooString *text = element->getText();
                printf("%s\n", text->getCString());
                delete text;
        }

        // Visit the child elements (if any)
        for (unsigned i = 0; i < element->getNumElements(); i++)
                handleElement(element->getElement(i));
}

// ...

const StructTreeRoot *tree = document->getCatalog()->getStructTreeRoot();
for (unsigned i = 0; i < tree->getNumElements(); i++)
        handleElement(tree->getElement(i));
```

In addition to adding support for parsing the document tree, the `pdfinfo`
tool has been updated and can now be used to print out the structure tree
(flag: `-struct`) or the tree plus the text contained in the elements
(flag: `-struct-text`). It looks like this when used with the [FW-4 US
tax form](http://www.irs.gov/pub/irs-pdf/fw4.pdf) (the [actual
output](fw4-struct-text.txt) is much longer):

```
% pdfinfo -struct fw4.pdf | tail -n + 22
Structure:
  Document (inline)
    Part "Page 1" (inline)
      Sect (inline)
        Sect (inline)
          Div (inline)
            H1 (block)
              "Form W-4 (2013)"
          Div (inline)
            P (block)
              "Purpose. Complete Form W-4 so that your employer can withhold
              the correct federal income tax from your pay. Consider
              completing a new Form W-4 each year and when your personal or
              financial situation changes."
 (...)
```

In order to test the implementation, I have written the `pdfstructutohtml`
tool, which uses the structure tree to convert PDFs to HTML, trying to
keep the logical structure. The output for the FW-4 form has a number of
flaws because the program is simple and could use some improvements, but
the [generated HTML](fw4-pdfstruct.html) source contains the structure
and basic styling, properly converted from the original document: not
bad for a ~500 line program!


## GLib bindings

Because the ultimate goal is to improve the accessibility experience in
[Evince](https://projects.gnome.org/evince/) and
[Documents](https://wiki.gnome.org/Apps/Documents), the Poppler-GLib binding
should also expose the document structure in the API. The process for this
is taking more time because, while the low-level Poppler API can be changed
at any time (there is no promise of stability), the GLib binding must be
stable, so [Carlos](http://blogs.igalia.com/carlosgc/) and I have been
iterating over it to make sure that what we provide will not need to be
changed in the future (ideally).

Being a higher-level API, the Poppler GLib binding eliminates the need of
two different classes for the structure: where in low-level Poppler there is
`StructTreeRoot` and `StructElement`, in the GLib binding there is only
`PopplerStructureElement`, and iteration over the tree is done using an
external iterator. This approach is more consistent with other parts of
the binding. Traversing the structure tree can be done like this:

```cpp
static void
handle_structure_element_iter (PopplerStructureElementIter *iter)
{
        PopplerStructureElementIter *child;
        PopplerStructureElement *element;

        do {
                /* Do something with "element". For example, print the contained text */
                element = poppler_structure_element_iter_get_element (iter);
                if (poppler_structure_element_is_content (element))
                        {
                                gchar *text = poppler_structure_element_get_text (element);
                                g_print ("%s\n", text);
                                g_free (text);
                        }
                g_object_unref (element);

                /* Visit the child elements (if any) */
                if ((child = poppler_structure_element_iter_get_child (iter)))
                        {
                                handle_structure_element_iter (child);
                                poppler_structure_element_iter_free (child);
                        }
        } while (poppler_structure_element_iter_next (iter));
}

/* ... */
PopplerStructureElementIter *iter;

if ((iter = poppler_structure_element_iter_new (document)))
        handle_structure_element_iter (iter);
```

Here you can see the new pane in the `poppler-glib-demo` tool, which
shows the document structure tree:

<figure class="image">
  ![FW-4 in poppler-glib-demo](fw4-glib-demo.png)
  <figcaption>FW-4 in `poppler-glib-demo`</figcaption>
</figure>

Last but not least, the GLib binding has received some additional love
to add proper documentation to the new functions and to make them
[introspection](https://wiki.gnome.org/GObjectIntrospection)-friendly
so you can use them right away in your favourite programming language.


## What's next?

The next step will be to add the needed code in
[Evince](https://projects.gnome.org/evince/) to take advantage of the
information exposed via the document structure tree, and make use of it
to improve accessibility —and usability— of the document view. On top
of the [improvements done by Antía](http://blogs.igalia.com/apuentes/2013/09/04/15/),
once the Tagged-PDF support lands in Poppler, my colleagues at Igalia
will use it in Evince to implement the following:

* Feeding more, and more accurate, information to ATK will make assistive
  technologies provide better access to document content. For example,
  being able to extract text from particular elements in the document
  structure allows to send text to a screen reader one paragraph (or
  list item, or table cell) at a time, allowing the user to better
  navigate the document.

* Better tab navigation, especially in forms: traversing the document
  structure makes it possible to identify the logical order of form fields, instead
  of having to guess their order from their positions in the page.

* Navigating forms across pages: a current limitation of how Poppler and
  Evince work is that it is not always possible to know all the page
  contents before rendering the page, which makes it very difficult to know
  whether focus should move to the previous or next page. The document
  structure can be inspected to determine whether there are elements in the
  surrounding pages eligible to receive focus, and act accordingly.

Finally, I would like to thank [Carlos
García-Campos](http://blogs.igalia.com/carlosgc/) for his thorough code
reviews. Of course, big thanks also to the [GNOME
Foundation](http://www.gnome.org/foundation/) and all the [Friends of
GNOME](http://www.gnome.org/friends/) supporters for making it possible
to keep improving our software stack to make it more accessible.
