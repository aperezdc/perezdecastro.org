+++
title = "The story of linux-{gate,vdso}.so"
date = 2009-01-13
taxonomies.categories = ["igalia"]
taxonomies.tags = ["linux"]
+++

If you have used `ldd` on a dynamic binary with a Linux 2.6 kernel you
may have wondered what the heck is the `linux-gate.so` library, because
it is not present in the filesystem. Depending on kernel versions, it
may appear as `linux-vdso.so`. Well, [here][] is an in-depth
explanation, but in short it is a *virtual ELF library* which is
contained in the kernel itself (that is why there is no file on disk)
that gets mapped into the address space of every process. It contains
some functions used by the C library to enter kernel space on system
calls, and the contents of the library change depending on what method
is faster for syscall invocation on your CPU.

Even short explanation: it is a trick the kernel does to make programs
work faster, and [Linus is proud of it, even being a disgusting pig][].

  [here]: http://www.trilithium.com/johan/2005/08/linux-gate/
  [Linus is proud of it, even being a disgusting pig]: http://lkml.org/lkml/2002/12/18/218
