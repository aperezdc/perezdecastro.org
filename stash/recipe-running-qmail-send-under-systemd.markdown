Title: Recipe: Running qmail-send under systemd
Date: 2012-06-27 17:06
Author: aperez
Category: Igalia
Tags: qmail, recipe, systemd

Call me old-fashioned, crazy or whatever, but I *do* use [qmail][] (only
the `qmail-send` service) as local MTA and for relaying outgoing mail to
a smarthost. Over the years I tried several other options
like [msmtp][], nbsmtp, or [nullmailer][], which would allow to not run
a full-fledged MTA, but they either:

-   Do not queue up messages. (Queuing is interesting for
    sometimes-offline boxes, like a laptop: you still “send” messages
    normally, and once there is again a working Internet connection ,
    they are delivered all in a row.)
-   Do not provide a sendmail-compatible binary. (Tools like git
    send-email expect this to be available, so one absolutely wants
    this.)
-   Are too dumb to provide some sort of reasonable “local” delivery to
    a remote mail address. (Certain tools like cron may send messages to
    local accounts, so I want the mailer to be able to forward those
    local messages to a remote address.)

Then at some point I though “hey, but qmail is no more than a number of
small tools glued together which do one task well... why not running
just `qmail-send` for deliveries?” and the idea indeed works like a
charm. Traditionally I have been running it with [dmon][] for running
it, but lately I have been using [systemd][] in my laptop, and decided
to run it directly using it instead of letting it run the SysV init
script. It turned out to be reasonably easy.

Those are the contents for the `/etc/systemd/system/qmail-send.service`
unit file:

    [Unit]
    Description=qmail delivery daemon
    After=syslog.target
    After=local-fs.target
    ConditionFileIsExecutable=/var/qmail/bin/qmail-start

    [Install]
    WantedBy=multi-user.target

    [Service]
    Type=simple
    Restart=always
    StandardOutput=syslog
    StandardError=inherit
    SyslogFacility=mail
    SyslogIdentifier=qmail-send
    Environment=PATH=/var/qmail/bin:/usr/bin:/bin:/usr/sbin:/sbin
    ExecStart=/var/qmail/bin/qmail-start ~/.maildir/
    ExecReload=/var/qmail/bin/qmail-tcpok ; /bin/kill -ALRM ${MAINPID}

Some notes:

-   This assumes that you have a [LWQ][]-style qmail installation, hence
    the paths pointing to `/var/qmail`.
-   The `Environment=` line defines the `PATH` variable so it contains
    `/var/qmail/bin`. This is needed for qmail to work properly.
-   The `ExecReload=` clears the timeout tables with `qmail-tcpok` and
    then sends `SIGALRM` to the main process. This makes it try to
    deliver the queued messages. I have a handy script that runs
    `systemctl reload qmail-send.service` when NetworkManager connects
    to Internet.
-   Like all DJB-ware, qmail logs using the *stdio* streams, so we make
    them go to both the systemd journal and `syslog` (I want to be able
    to `tail -f` the log file for the mail facility).

Once this unit file is in place, use the following to reload the unit
files, and then start and enable the service:

~~~~ {lang="sh"}
systemctl daemon-reload
systemctl start qmail-send.service
systemctl enable qmail-send.service
~~~~

Voilà! :-)

  [qmail]: http://netqmail.org
  [msmtp]: http://msmtp.sourceforge.net/
  [nullmailer]: https://github.com/bruceg/nullmailer
  [dmon]: http://blogs.igalia.com/aperez/tag/dmon/
  [systemd]: http://www.freedesktop.org/software/systemd/
  [LWQ]: http://lifewithqmail.org
