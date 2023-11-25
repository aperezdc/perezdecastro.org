title: Standalone Binaries With Zig CC and Meson
date: 2023-11-24 14:32:00+0300
author: aperez
tags: igalia, floss

Have you ever wanted to run a program in some device without needing to
follow a complicated, possibly slow build process? In many cases it can
be simpler to use [zig cc][zigcc-blog] to compile a static binary and call
it a day.

## Zig What?

The [Zig programming language][ziglang] is a new(ish) programming language
that may not get as much rep as others like Rust, but the authors have
had one of the greatest ideas ever: reuse the chops that Clang has as
a cross-compiler, throw in a copy of the sources for the [Musl C
library][musl], and provide an _extremely_ convenient compiler driver
that builds the parts of the C library needed by your program
on-demand.

Try the following, it just works, it's _magic_:

```sh
cat > hi.c <<EOF
#include <stdio.h>

int main() {
    puts("That's all, folks!");
    return 0;
}
EOF
zig cc --target=aarch64-linux-musl -o hi-arm hi.c
```

Go on, try it. I'll wait.

----

All good? Here is what it looks like for me:

```
% uname -m
x64_64
% file hi-arm
hi-arm: ELF 64-bit LSB executable, ARM aarch64, version 1 (SYSV), statically linked, with debug_info, not stripped
% ls -lh hi-arm
-rwxrwxr-x+ 1 aperez aperez 82K nov 24 16:08 hi-arm*
% llvm-strip -x --strip-unneeded hi-arm
% ls -lh hi-arm
-rwxrwxr-x+ 1 aperez aperez 8,2K nov 24 16:11 hi-arm*
% 
```

A compiler running on a `x86_64` machine produced a 64-bit ARM program out of
thin air (no cross-sysroot, no additional tooling), which does not have any
runtime dependency (it is linked statically), weighting 82 KiB, and can be
stripped further down to  _only_ 8,2 KiB.

While I cannot say much about Zig _the programming language_ itself because I
have not had the chance to spend much time writing code in it, I have the
compiler installed just because of `zig cc`.


## A Better Example

One of the tools I often _want_ to run in a development board is [drm_info][],
so let's cross-compile that. This little program prints all the information it
can gather from a DRM/KMS device, optionally formatted as JSON (with the `-j`
command line flag) and it can be tremendously useful to understand the
capabilities of <abbr title="Graphics Processing Unit">GPU</abbr>s and their
drivers. My typical usage of this tool is knowing whether [WPE
WebKit][wpewebkit] would run in a given embedded device, and as guidance for
working on [Cog][cog]’s [DRM platform plug-in][cog-drm-doc].

It is also a great example because it uses [Meson][meson] as its build system
and has a few dependencies&mdash;so it is not a trivial example like the
one above&mdash;but not so many that one would run into much trouble.
Crucially, both its main dependencies, [json-c][jsonc] and [libdrm][], are
available as [WrapDB packages][wrapdb] that Meson itself can fetch and
configure automatically. Combined with `zig cc`, this means the only
other thing we need is installing Meson.

Well, that is not completely true. We also need to _tell_ Meson how to
cross-compile using our fancy toolchain. For this, we can write the following
[cross file][meson-cross-file], which I have named `zig-aarch64.conf`:

```toml
[binaries]
c = ['/opt/zigcc-wrapper/cc', 'aarch64-linux-musl']
objcopy = 'llvm-objcopy'
ranlib = 'llvm-ranlib'
strip = 'llvm-strip'
ar = 'llvm-ar'

[target_machine]
system = 'linux'
cpu_family = 'aarch64'
cpu = 'cortex-a53'
endian = 'little'
```

While ideally it should be possible to set the value for `c` in the cross file
to `zig` with the needed command line flags, in practice there is a bug that
prevents the linker detection in Meson from working correctly. At least until
[the patch which fixes the issue][meson-zigccld-pr] is not yet part of a
release, the wrapper script at `/opt/zigcc-wrapper/cc` will defer to using
`lld` when it notices that the linker version is requested, or otherwise
call `zig cc`:

```sh
#! /bin/sh
set -e
target=$1
shift

if [ "$1" = '-Wl,--version' ] ; then
	exec clang -fuse-ld=lld "$@"
fi
exec zig cc --target="$target" "$@"
```

Now, this is how we would go about building `drm_info`, note the use of
`--default-library=static` to ensure that the subprojects for the dependencies
are built accordingly and that they can be linked into the resulting
executable:

```sh
git clone https://gitlab.freedesktop.org/emersion/drm_info.git
meson setup drm_info.aarch64 drm_info \
  --cross-file=zig-aarch64.conf --default-library=static
meson compile -Cdrm_info.aarch64
```

A short while later we will be kicked back into our shell prompt, where we
can check the resulting binary:

```
% file drm_info.aarch64/drm_info
drm_info.aarch64/drm_info: ELF 64-bit LSB executable, ARM aarch64, version 1 (SYSV), statically linked, with debug_info, not stripped
% ls -lh drm_info.aarch64/drm_info
-rwxr-xr-x 1 aperez aperez 1,8M nov 24 23:07 drm_info.aarch64/drm_info*
% llvm-strip -x --strip-unneeded drm_info.aarch64/drm_info
% ls -lh drm_info.aarch64/drm_info
-rwxr-xr-x 1 aperez aperez 199K nov 24 23:09 drm_info.aarch64/drm_info*
%
```

That's a ~200 KiB `drm_info` binary that can be copied over to any 64-bit
ARM-based device running Linux (the kernel). _Magic!_

<div style="margin: 1em; text-align: center;">
<img src="zigmagic.svg" style="min-width: 25%; max-with: 80%;"
  alt='The General Magic logo, but its text reads "Zig Magic" instead'>
</div>

[cog]: https://github.com/Igalia/cog
[cog-drm-doc]: https://igalia.github.io/cog/platform-drm.html
[drm_info]: https://gitlab.freedesktop.org/emersion/drm_info
[jsonc]: https://github.com/json-c/json-c
[libdrm]: https://gitlab.freedesktop.org/mesa/drm
[meson]: https://mesonbuild.com
[meson-cross-file]: https://mesonbuild.com/Cross-compilation.html#cross-compilation
[meson-zigccld-pr]: https://github.com/mesonbuild/meson/pull/12293
[musl]: https://musl.libc.org
[wpewebkit]: https://wpewebkit.org
[wrapdb]: https://mesonbuild.com/Wrapdb-projects.html
[zigcc-blog]: https://andrewkelley.me/post/zig-cc-powerful-drop-in-replacement-gcc-clang.html
[ziglang]: https://ziglang.org
