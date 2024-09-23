Title: Playing some Go
Date: 2010-11-15 16:21
Author: aperez
Category: Igalia
Tags: compiler, debian, go, pkg


So the other day I wanted to play some Go, but not the kind of Go you
could imagine by looking at today's post picture:

<figure class="image">
  <a href="http://en.wikipedia.org/wiki/Go%5f%28game%29"><img
    alt="playing go" src="../images/playing-go.jpg"></a>
</figure>

I mean the Google's [Go programming language][]. The sad news  is that
there are no Debian packages in the repositories, but I was able of
finding [a Mercurial repository][] with the stuff needed to make build a
nice build of it. So if you want to try out Go, just add the [Igalia APT
repository][] to your system and install `google-go`. For the lazy
people, this just cast this magic spell:

```bash
wget -qO- http://apt.igalia.com/apt-igalia.key | apt-key add -
deb http://apt.igalia.com igalia main
apt-get install google-go
```

For the moment there is an `amd64` for Sid that should work fine on
Ubuntu (Lucid and Maverick). I tried making an ARM build, but it failed
with some error I did not try to fix (yet).

Have a lot of fun playing with Go!

  [Go programming language]: http://golang.org/
  [a Mercurial repository]: http://hg.debian.org/hg/collab-maint/golang
  [Igalia APT repository]: http://apt.igalia.com
