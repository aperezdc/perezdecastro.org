Title: Locked out of SSH? Renew all the keys!
Date: 2015-08-16 01:52:50
Author: aperez
Tags: igalia, sysadmin

Long time, no post! Well, here I am with something completely unrelated to
programming. Instead, is this something that has been bugging me for a while
but I had been postponing because from the surface it looked a bit like a
deep rabbit hole.

The Issue
---------

For a while, every time I tried to connect to certain servers via SSH (or
[Mosh], make sure to check it out!), I was getting something like this:

```
~ % ssh sensei.perezdecastro.org
Host key fingerprint is ~~REDACTED~~
Permission denied (publickey).
~ %
```

Having plenty of things pending to do, plus lazyness, made me ignore this
for a while because most of the machines I connect to via SSH have
password-based authentication as a fallback. But today I had to use a machine
that is configured to accept *only* key-based authentication, so I had to bite
the bullet. As usual, I re-tried connecting with the very same command, plus
adding `-v` to get some debugging output. Notice this message:

```
debug1: Skipping ssh-dss key /home/aperez/.ssh/id_dsa for not in PubkeyAcceptedKeyTypes
```

Could this be the root cause? Searching on Internet did not yield anything
interesting — nobody checks result pages after the second one, ever. Then
I remembered that after the infamous [Heartbleed](http://heartbleed.com/) bug
several initiatives with the goal of making secure stuff more secure —and
hopefully bug-free— were started. While [LibreSSL](http://www.libressl.org/)
gets the honorable mention of having the cutest
[logo](http://www.libressl.org/images/ChePuff.jpg), other teams have not been
behind in “de-crufting” their code. I started to fear that the latest release
of [OpenSSH](openssh) may not have support anymore for one of:

- The host key used by the server.
- The host key type used by my laptop.
- The identity key type.

It was time to learn about what changed in the recent past.


Exhibit “A”
-----------

Looking at [OpenSSH 7.0 release notes](openssh-rel7.0), there is the culpript:

```
 * Support for ssh-dss, ssh-dss-cert-* host and user keys is disabled
   by default at run-time. These may be re-enabled using the
   instructions at http://www.openssh.com/legacy.html
```

So it turns out that support for `ssh-dss` keys like the one I was trying to
use is still available, but disabled by default. The mentioned URL contains
information on [how to use legacy features](openssh-legacy), and in this case
the support for `ssh-dss` keys can be re-enabled using the
`PubkeyAcceptedKeyTypes` option, either temporarily for a single `ssh` (or
`scp`) invocation:

```
~ % ssh -oPubkeyAcceptedKeyTypes=+ssh-dss sensei.perezdecastro.org
```

or permanently adding a snippet to the `~/.ssh/config` file:

```
Host sensei.perezdecastro.org
     PubkeyAcceptedKeyTypes +ssh-dss
```


The Solution
------------

I suspect it won't be long before support for
[DSA](https://en.wikipedia.org/wiki/Digital_Signature_Algorithm) keys is
disabled at compile time, and
[for good reasons](http://meyering.net/nuke-your-DSA-keys/), so this seemed
a moment as good as any to make a new SSH key, and propagate it to the hosts
where I was using the old one.

<figure class="image">
  <img src="//perezdecastro.org/2015/should-change-ssh-key.png">
  <figcaption>Indeed, I should.</figcaption>
</figure>

Question is: Which type of key should I generate *as of 2015*? The current
default of `ssh-keygen` is to use RSA keys of 2048 bits, which seems like a
reasonable thing provided that it is
[technically possible to break 1024 bit keys](http://cs.tau.ac.il/~tromer/twirl/).
Applying a bit of paranoia, I decided to better use a 4096 bit key, to make
it future-proof as well.

But hey, we live in [dangerous
days](https://www.themoviedb.org/movie/57656-dangerous-days-making-blade-runner),
and one may want to stay away from RSA keys. They use the standard NIST
curves, which are
[not that good](http://www.hyperelliptic.org/tanja/vortraege/20130531.pdf),
and because we know for a fact that the NSA has been
[tampering around with them](http://projectbullrun.org/dual-ec/), we may
want to take a different approach, and go for an Ed25519 key instead. Which,
apart from having [Daniel J. Bernstein](dbj) in the
[design](http://ed25519.cr.yp.to/ed25519-20110926.pdf) team, are *not*
vulnerable to [poor random number generation](http://www.xkcd.com/424/). There
is only one catch: support for Ed25519 is kind of new, so if you need to
connect to machines using OpenSSH ≤ 6.5 you may still want to create a 4096
bit RSA key for them, ensuring that the Ed25519 key is used by default and the
RSA one *only* when needed. More on that later, for now let's create the new
keys with:

```
~ % ssh-keygen -t ed25519
```

and:

```
~ % ssh-keygen -t rsa -b 4096
```

Then, append the key to the relevant machines, changing `id_ed25519` to
`id_rsa` for the ones which do not support Ed25519; note how the option
to enable `ssh-dss` keys is used to temporarily allow using the old key to be
able to append the new one (which somehow did not work with `ssh-copy-id`):

```
% ssh -oPubkeyAcceptedKeyTypes=+ssh-dss sensei.perezdecastro.org \
    'cat >> ~/.ssh/authorized_keys' < ~/.ssh/id_ed25519.pub
```

Last but not least, let's make sure that the RSA key is only ever used when
needed, with a couple of tweaks in the `~/.ssh/config` file:

```
PubkeyAcceptedKeyTypes ssh-ed25519,ssh-ed25519-cert-v01@openssh.com

Host oldmachine.perezdecastro.org
     PubkeyAcceptedKeyTypes +ssh-rsa
```

Note that it is *not* possible to remove one item from the
`PubkeyAcceptedKeyTypes` list with `-ssh-rsa`: we need to specify a complete
list of key types that OpenSSH will be allowed to use. For reference: the
`ssh_config` [manual page](http://www.openbsd.org/cgi-bin/man.cgi/OpenBSD-current/man5/ssh_config.5)
lists the default value, and `ssh -Q key` lists key types built in a
particular OpenSSH installation. In my case, I have decided to use my new
Ed25519 key as primary, allowing only this key type by default, and using
the RSA key for selected hosts.

While we are at it, it may be interesting to switch from the OpenSSH server to
[TinySSH](http://tinyssh.org/) in the servers under our control. Despite being
small, it supports Ed25519, and it uses NaCl ([DJB](djb)'s crypto library)
instead of OpenSSL. Also, it is possibly the simplest service one can setup
over [CurveCP](http://curvecp.org/) at the moment. But this post is already
long enough, so let's move on to the finale.


Finale
------

My main desktop environment is [GNOME](http://www.gnome.org), which is very
nice and by default includes a convenient SSH agent as part of its
[Keyring](https://wiki.gnome.org/Projects/GnomeKeyring) daemon. But every now
and then I just use [OpenBox window manager](http://openbox.org), or even a
plain Linux virtual terminal with a [tmux](https://tmux.github.io/) session in
it, where there is no GNOME components running. And I do miss its SSH agent.
After looking a bit around, I have installed
[Envoy](https://github.com/vodik/envoy), which instead of implementing its own
agent, ensures that one (and only one) instance of the OpenSSH `ssh-agent`
runs for each user, across all logged-in sessions, and without needing changes
to your shell startup files when using the included PAM module.

**Update** (2015-08-16): Another reason to use Envoy, as pointed out by
[Óscar Amor](https://twitter.com/amhairghin), is that the GNOME Keyring daemon
[can't handle Ed25519 keys](https://bugzilla.gnome.org/show_bug.cgi?id=723274).

Happy SSH'ing!


[Mosh]: https://mosh.mit.edu/
[openssh]: http://www.openssh.com
[openssh-legacy]: http://www.openssh.com/legacy.html
[openssh-rel7.0]: http://www.openssh.com/txt/release-7.0
[djb]: http://cr.yp.to/djb.html
