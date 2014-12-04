title: Inception! JS-in-JS!
Date: 2014-12-04 2:00
Author: aperez
Tags: igalia, v8, javascript, chromium

Apparently this November has been [the gloomiest in
a while](http://yle.fi/uutiset/its_official_november_in_helsinki_was_three_times_gloomier_than_average/7659975),
and that certainly may have slowed down my [on-going quest to bring
arrow functions to V8](http://code.google.com/p/v8/issues/detail?id=2700).
Though arrow functions deserve a write-up themselves, my musings today are
about a side quest that started in September, when I had the chance to visit
enchanting Berlin one more time, this time as a speaker at [JSConf
EU](http://2014.jsconf.eu).

So what does a guy hacking on JavaScript engines talk about in a conference
which is not a lair of compiler neckbeards? Of course it had to be someting
related to the implementation of JavaScript engines, but it should have
something to do with *what can be done with JavaScript*. It turns out that
V8 has large-ish parts implemented in a subset of JavaScript ([and
SpiderMonkey](https://hg.mozilla.org/mozilla-central/file/2c9781c3e9b5/js/src/builtin);
[and
JavaScriptCore](http://trac.webkit.org/browser/trunk/Source/JavaScriptCore/builtins),
a bit too!). Enter “Inception: JavaScript-in-JavaScript — where language
features are implemented in the language itself any similarity with the
movie is a mere coincidence)”.


Intermission
------------

Provided that the [video of my talk at JSConf
EU](http://2014.jsconf.eu/speakers/adrian-perez-de-castro-javascript-in-javascript-inception.html)
is now online, you may want to go watch it now (as an option, with the
[slides](/jsinception) in another window) and come back afterwards to
continue reading here.

Did you see the video of the talk? Good, let's recap a bit before
continuing.


Engines use JavaScript, too
---------------------------

I made some quick numbers (with [CLOC](http://cloc.sf.net)) to give you an
idea of how much major engines are using JavaScript themselves. This is the
number of *thousands of lines of code* (kLOC) of the engines themselves,
how much of it is JavaScript, and its percentage over the total (excluding
the test suites):

| Engine         | Total | JS |   % |
|:---------------|------:|---:|----:|
| JavaScriptCore |   269 |  1 | 0.3 |
| SpiderMonkey   |   457 | 18 | 3.9 |
| V8             |   532 | 23 | 4.3 |

Both V8 and SpiderMonkey have a good deal of the runtime library
implemented in JavaScript, relying on the JIT to produce machine code
to provide a good performance. JavaScriptCore might have an edge in cases
where it is not possible to use the JIT and its C++ implementation can be
faster when using the interpreter (iOS, anyone?). In the case of V8 the
choice of going JavaScript is clear, because it always compiles to machine
code.

Most of the features introduced in the runtime library by the [ES6
specification](http://people.mozilla.org/~jorendorff/es6-draft.html) can be
implemented without needing to touch low-level C++ code. Or do we?


Live-coding %TypedArray%.prototype.forEach()
--------------------------------------------

For my talk in Berlin I wanted to show how accessible it is to use
JavaScript itself as an entry point to the guts of V8. What would be better
than picking something new from the spec, and live-coding it, let's say the
`.forEach()` method for typed arrays? Because of course, coding while
delivering a talk cannot *ever* go bad.

<figure class="image">
	![](/2014/danger-is-my-middle-name.gif)
	<figcaption>Live-coding, what could go wrong?</figcaption>
</figure>

As a first approach, let's write down an initial version of `.forEach()`,
in the very same way as we would if we were writing a polyfill:

```javascript
function TypedArrayForEach(cb, thisArg) {
	if (thisArg === undefined)
		thisArg = this;
	for (var i = 0; i < this.length; i++)
		cb.call(thisArg, this[i]);
}
```

But, in which file exactly should this go, and how is it made available
in the runtime library? It turns out that there is a bunch of `.js` files
under `src/`, one of them conspicuously named `typedarray.js`, prompting
us to go ahead and write the above function in the file, plus the following
initialization code inside its —also aptly named— `SetupTypedArrays()`
function, right at the end of the macro definition:

```javascript
function SetupTypedArrays() {
macro SETUP_TYPED_ARRAY(ARRAY_ID, NAME, ELEMENT_SIZE)
	// ...

	// Monkey-patch .forEach() into the prototype
	global.NAME.prototype.forEach = TypedArrayForEach;
endmacro

TYPED_ARRAYS(SETUP_TYPED_ARRAY)
}
```

Wait! What, macros? Yes, my friends, but before crying out in despair,
rebuild V8 and run the freshly built `d8` passing `--harmony-arrays`:

```
% ./out/x64.debug/d8 --harmony-arrays
V8 version 3.31.0 (candidate) [console: readline]
d8> Int8Array.prototype.forEach
function forEach() { [native code] }
d8>
```

It is alive!


Standards are hard
------------------

At this point we have a working polyfill-style implementation patched in
the prototypes of typed arrays, and it works. Yet, it does not quite work
as it should. To begin with, the function should throw `TypeError` if
called on an object that is not a typed array, or if the callback is not
callable. The spec also mentions that the `.length` property of the
function should be `1` (that is: it is declared as having a single
argument), and so on.

You see, formally specifying a programming language is a complex task
because all those iffy details have to be figured out. Not to forget about
the interactions with other parts of the language, or the existing code
bases. In the particular case of JavaScript the backwards compatibility adds
a good deal of complexity to the formal semantics, and wading through the
hundreds of pages of the [ES6
specification](http://people.mozilla.org/~jorendorff/es6-draft.html) can be
a daunting task. We may feel compelled to define things differently.

<figure class="image padded">
	![](http://imgs.xkcd.com/comics/standards.png)
	<figcaption>How standards are born, courtesy of
		[XKCD](https://xkcd.com/927/).</figcaption>
</figure>

Personally, I would eradicate one of the modes, keep just sloppy or strict,
but not both. Only that then it would not be JavaScript anymore. Think about
all that legacy code that lurks on the depths of the Internet, wouldn't it
be nice that it continues to work?

That leads to yet another subtlety: the value passed as `thisArg` (available
as `this` in the callback function) is expected to be wrapped into an object
only for sloppy mode functions — but not for strict mode ones, because strict
mode is, well, stricter. While `.call()` handles this, [it is not particularly
fast](https://gist.github.com/aperezdc/b1b5dab48eeb1dcfadc8) (more on this
later), so we may end up needing a way to know which functions are in
sloppy mode, do the wrapping ourselves (when needed) and arrange the calls
in a more efficient way. We have to assume that there will be code in the
wild relying in this behavior. If only we could knew which functions are
sloppy!


A better solution
-----------------

As a matter of fact, the JavaScript engines already know which functions are
strict and which ones not. We just cannot get access to that information
*directly*. Fortunately V8 provides a way in which JavaScript code can
invoke C++ *runtime functions*: the functions declared using the
`RUNTIME_FUNCTION()` macro can be invoked from JavaScript, by prefixing
their names with `%`, and if you take a peek into `src/runtime/`, there are
plenty.

To begin with, there is `%_CallFunction()`, which is used pervasively in
the implementation of the runtime library instead of `.call()`. Using
it [is an order of magnitude
faster](https://gist.github.com/aperezdc/b1b5dab48eeb1dcfadc8), we will be
keeping it in our utility belt. Then, there is `%IsSloppyModeFunction()`,
which can be used to find out the “sloppyness” of our callback functions.

But wait! Do you remeber that I mentioned macros above? Take a look at
`src/macros.py`, go, now. Did you see something else interesting in there?
Plenty of utility macros, used in the implementation of the runtime library,
live there. We can use `SHOULD_CREATE_WRAPPER()` instead. Also, there are
a number of utility functions in `src/runtime.js`, most annotated with
sections of the EcmaScript specification because they *do* implement
algorithms as written in the spec. Using those makes easier to make sure
our functions follow all the intrincacies of the spec.

Let's give them a try:


```javascript
// Do not add a "thisArg" parameter, to make
// TypedArrayForEach.length==1 as per the spec.
function TypedArrayForEach(cb /* thisArg */) {
	// IsTypedArray(), from src/runtime/runtime-typedarray.cc
	// MakeTypeError(), from src/messages.js
	if (!%IsTypedArray(this))
		throw MakeTypeError('not_typed_array', []);

	// IS_SPEC_FUNCTION(), from src/macros.py
	if (!IS_SPEC_FUNCTION(cb))
		throw MakeTypeError('called_non_callable', [cb]));

	var wrap = false;
	var thisArg = this;
	if (arguments.length > 1) {
		thisArg = arguments[1];
		// SHOULD_CREATE_WRAPPER(), from src/macros.py
		wrap = SHOULD_CREATE_WRAPPER(cb, thisArg);
	}

	for (var i = 0; i < this.length; i++) {
		// ToObject(), from src/runtime.js
		%_CallFunction(wrap ? ToObject(thisArg) : thisArg,
		               this[i], i, this, cb);
	}
}
```

Now that is much closer to the [version that went into
V8](https://chromium.googlesource.com/v8/v8.git/+/ee64a14b242b66022c070a57e8f50ed68cb7b57c%5E%21/)
(which has better debugging support on top), and it covers
every the corner cases in the spec. Rejoice!


When in Rome...
---------------

Needless to say, there is no documentation for most of the helper functions
used to implement the runtime library. The best is to look around and see
how functions similar to the one we want to implement are done, while
keeping a copy of the spec around for reference.

<figure class="image padded">
	![](/2014/when-in-rome.gif)
	<figcaption>Do as the tigers do.</figcaption>
</figure>

Those are a couple of things one can find by scouring the the existing
code of the runtime library. First: for typed arrays, the macro in
`SetupTypedArrays()` installs a copy of the functions for each typed
array kind, effectively duplicating the code. While this may seem
gratuitious, each copy of the function is very likely to be used only
on typed arrays in which elements are a certain type. This helps the
compiler to generate better code for each of the types.

Second: Runtime functions with the `%_` prefix in their names (like
`%_CallFunction()`) do not have their C++ counterpart in `src/runtime/`.
Those are *inline runtime functions*, for which the code is emitted
directly by the code generation phase of the compiler. They are real
fast, use them whenever possible!


Next
----

After coming back from Berlin, I have been implementing the new typed
array methods, and the plan is to continue tackling them one at a time.

As mentioned, `%TypedArray%.prototype.forEach()` is already in V8
(remember to use the `--harmony-arrays` flag), and so is `%TypedArray%.of()`,
which I think is very handy to create typed arrays without needing to
manually assign to each index:

```javascript
var pow2s = Uint8Array.of(1, 2, 4, 16, 32, 64, 128, 256);
```

Apart from my occassional announcements (and rants) [on
Twitter](https://twitter.com/aperezdc), you can also follow the overall
progress by subscribing to
[issue #3578](http://code.google.com/p/v8/issues/detail?id=3578) in the V8
bug tracker.

Last but not least, a mention to the folks at
[Bloomberg](http://bloomberg.com), who are sponsoring our ongoing work
implementing ES6 features. It is great that they are able to invest in
improving the web platform not just for themselves, but for everybody
else as well. Thanks!

<figure class="image">
	![](/2014/igalia-bloomberg.png)
</figure>
