title: Tip: Faster remote shells with multiplexed SSH
date: 2008-06-26 19:37
author: aperez
category: Toolchain
tags: ssh

Edit `~/.ssh/config` (or `/etc/ssh/ssh_config` for sitewide
configuration) and add the following snippet:

    Host *
       ControlMaster auto
       ControlPersist 120
       ControlPath ~/.ssh/socket-%r@%h:%p

This will create a socket for each set *(user, machine, port)* when the
first SSH session is opened. Further sessions will see the socket and
use it instead of opening a new connection, multiplexing all concurrent
connections via the same connection. The same goes for `scp` and `sftp`.

Nice side-effects of this:

-   No functionality is lost at all.
-   SSH sessions will open faster, as there is no need to establish a
    connection.
-   You will not need to enter you password everytime (but note that
    maybe you should be using public-key authentication).
-   You can open several sessions to servers which put a limit on the
    number of simultaneous connections.
-   If you are a sysadmin, you can limit the number of SSH connections
    to exactly one per user :-)

