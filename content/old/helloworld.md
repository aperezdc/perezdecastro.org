+++
title = "Hello world!"
date = 2008-06-16
taxonomies.categories = ["igalia"]
+++

So... brand new [Igalia][] worker: brand new [work mates][], brand new
office, brand new [experiences at Arbo][], brand new coffee machine...
and brand new weblog. Here I will be blogging about my experience while
ensuring all works at the systems area, but maybe some code kicks in, as
I also enjoy programming. As this is just a presentation post, let me
say «Hello, world!» in a multi-language fashion:

```
C=0;/*Hello_World 2>/dev/null
#! /bin/bash
*/
#define echo main() { printf(
#define exit "\n"); }
echo "Hello, world!"
exit
/*
#! perl
print "Hello, world!\n";
__END__
_*/
```

This snippet works as C, Perl and Bash programs, just save it to a file
and try to run it:

```
$ perl -x source.c
Hello, world!
$ bash source.c
Hello, world!
$ gcc -o hello hello.c && ./hello
Hello, world!
$
```

Do not try too hard to understand it... your brain could melt as mine
did while trying to add support for AWK.

  [Igalia]: http://www.igalia.com
  [work mates]: http://blogs.igalia.com
  [experiences at Arbo]: http://blogs.igalia.com/jmunhoz/2008/06/10/the-arbo-war/
