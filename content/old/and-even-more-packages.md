+++
title = "And even more packages"
date = 2010-06-21

[taxonomies]
categories = ["igalia"]
tags = ["debian", "pkg"]
+++

Most of the time, people involved in the Free Software community what
does with packages is *using prebuilt packages*, and a small amount of
people are who actually prepare packages. For one reason or another, I
end up building some [Debian][] packages from time to time. Most of the
time the motivations are:

-   Having some build-time option enabled (fine-tuning build options via
    USE-flags is one of the reasons why I *love* [Gentoo][] :-D).
-   A new version we *want* is out but there is no package in Debian
    stable, nor in backports. Or maybe it is some experimental
    application we want to use.
-   Add patches in packages which are not yet officially merged, either
    in Debian or in the upstream project.

In the spirit of giving something back to the community, and because
they may be useful to other persons, I like sharing the result of my
work, so here we go with a new batch of `.deb` packages (which most
likely will work in [Ubuntu][] as well):

<table cellpadding="5" style="font-size: 120%;text-align: left">
<thead>
<tr>
<th>
What

</th>
<th>
Distribution

</th>
<th>
Packages

</th>
</tr>
</thead>
<tbody>
</tbody>
<tr style="border-top: 1px solid #aaa">
<td style="padding:0.5em">
[OpenERP][] client 6.0 alpha 20100617

</td>
<td style="padding:0.5em">
lenny

</td>
<td style="padding:0.5em">
[openerp-client\_6.0-alpha20100617\_all.deb][]

</td>
</tr>
<tr style="border-top: 1px solid #aaa">
<td style="padding:0.5em">
[DSpam][] 3.9.0

</td>
<td style="padding:0.5em">
lenny

</td>
<td style="padding:0.5em">
[dspam\_3.9.0-4\_i386.deb][]  
[dspam-doc\_3.9.0-4\_all.deb][]  
[dspam-webfrontend\_3.9.0-4\_all.deb][]  
[libdspam7\_3.9.0-4\_i386.deb][]  
[libdspam7-drv-sqlite3\_3.9.0-4\_i386.deb][]  
[libdspam7-drv-pgsql\_3.9.0-4\_i386.deb][]  
[libdspam7-drv-mysql\_3.9.0-4\_i386.deb][]  
[libdspam7-dev\_3.9.0-4\_i386.deb][]

</td>
</tr>
<tr style="border-top: 1px solid #aaa">
<td style="padding:0.5em">
[Nginx][] 0.8.41

</td>
<td style="padding:0.5em">
lenny / squeeze

</td>
<td style="padding:0.5em">
[nginx\_0.8.41-0\_amd64.deb][]  
[nginx\_0.8.41-0\_armel.deb][]

</td>
</tr>
<tr style="border-top: 1px solid #aaa">
<td style="padding:0.5em">
[rotlog][] 0.2

</td>
<td style="padding:0.5em">
lenny / squeeze

</td>
<td style="padding:0.5em">
[rotlog\_0.2-1\_armel.deb][]

</td>
</tr>
</table>
One note regarding the Nginx package: it is supercharged with the
versions of the following third-party modules:

-   agentzh's (章亦春) [headers\_more][] module.
-   Leo Ponomarev's [HTTP push][] module.
-   Gregory Nosek's [upstream fair balancer][] module.
-   My own [fancy indexes][] module.

The ARM packages are the ones I am using in my [GuruPlug][], and were
built in the plug itself, so I am quite sure they will work in almost
any ARM Debian box which uses [EABI][], including the venerable
[SheevaPlug][] and [NSLU2][] devices.

Have a lot of fun...

  [Debian]: http://www.debian.org
  [Gentoo]: http://www.gentoo.org
  [Ubuntu]: http://www.ubuntu.com
  [OpenERP]: http://www.openerp.com
  [openerp-client\_6.0-alpha20100617\_all.deb]: http://people.igalia.com/aperez/files/debs/openerp-client_6.0-alpha20100617_all.deb
  [DSpam]: http://dspam.sourceforge.net/
  [dspam\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/dspam_3.9.0-4_i386.deb
  [dspam-doc\_3.9.0-4\_all.deb]: http://people.igalia.com/aperez/files/debs/dspam/dspam-doc_3.9.0-4_all.deb
  [dspam-webfrontend\_3.9.0-4\_all.deb]: http://people.igalia.com/aperez/files/debs/dspam/dspam-webfrontend_3.9.0-4_all.deb
  [libdspam7\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/libdspam7_3.9.0-4_i386.deb
  [libdspam7-drv-sqlite3\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/libdspam7-drv-sqlite3_3.9.0-4_i386.deb
  [libdspam7-drv-pgsql\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/libdspam7-drv-pgsql_3.9.0-4_i386.deb
  [libdspam7-drv-mysql\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/libdspam7-drv-mysql_3.9.0-4_i386.deb
  [libdspam7-dev\_3.9.0-4\_i386.deb]: http://people.igalia.com/aperez/files/debs/dspam/libdspam7-dev_3.9.0-4_i386.deb
  [Nginx]: http://nginx.org
  [nginx\_0.8.41-0\_amd64.deb]: http://people.igalia.com/aperez/files/debs/nginx_0.8.41-0_amd64.deb
  [nginx\_0.8.41-0\_armel.deb]: http://furi-ku.org/files/gp/nginx_0.8.41-0_armel.deb
  [rotlog]: http://furi-ku.org/+/cgit/code/rotlog/
  [rotlog\_0.2-1\_armel.deb]: http://furi-ku.org/files/gp/rotlog_0.2-1_armel.deb
  [headers\_more]: http://wiki.nginx.org/NginxHttpHeadersMoreModule
  [HTTP push]: http://pushmodule.slact.net/
  [upstream fair balancer]: http://wiki.nginx.org/NginxHttpUpstreamFairModule
  [fancy indexes]: http://furi-ku.org/+/cgit/code/ngx-fancyindex/plain/README.rst
  [GuruPlug]: http://www.globalscaletechnologies.com/t-guruplugdetails.aspx
  [EABI]: http://wiki.debian.org/ArmEabiPort
  [SheevaPlug]: http://en.wikipedia.org/wiki/SheevaPlug
  [NSLU2]: http://en.wikipedia.org/wiki/NSLU2
