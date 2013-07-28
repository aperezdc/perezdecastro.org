Title: SSH + Screen, a shortcut
Date: 2010-09-15 19:03
Author: aperez
Category: Igalia
Tags: bash, cli, screen, ssh

Most of the time while administering servers, I open an SSH
connection and then a Screen session. Lately I have been using
with SSH the `-t` option to force it to create a PTY, which is
needed by some programs which do not work when their output and/or input
is not a terminal, and just realized that I can just do:

```bash
ssh user@host -t screen
```

I even have a small script named `shsc` which does that for me:

```bash
#! /bin/bash

userhost=''
opts=( )

for opt in "$@" ; do
    if [[ ${opt} = *@* ]] ; then
        userhost=${opt}
    else
        opts=( "${opts[@]}" "${opt}" )
    fi
done

if [[ ${#userhost} -eq 0 ]] ; then
    echo "$(basename "$0"): No '[user]@host' specified"
    exit 1
fi >&2

exec ssh "${userhost#@}" -t screen "${opts[@]}"
```

The idea is that parameters other than the user and hostname to connect
to are passed to Screen, so one can do things like checking where there
are alive Screen sessions, and reattach to them:

```
% shsc @ara-ara.org -ls
There is a screen on:
  9573.scr    (09/15/2010 06:49:42 PM)    (Detached)
1 Socket in /var/run/screen/S-aperez.

Connection to ara-ara.org closed.
% shsc @ara-ara.org -DRR
```

