Feed redirect
=============

date
:   2008-01-13 22:53

author
:   Hario

category
:   General

tags
:   h4x0r, nginx

A while ago while watching logs in order to debug a little CGI-script I
am coding for [ezmlm](http://www.ezmlm.org) I noticed some feed readers
were trying to access the old URLs. I added a permanent redirect in my
[Nginx](http://nginx.net) configuration file. As an interesting side
effect, now [Planet GPUL](http://planet.gpul.org) is catching my feeds
again ;-)

Just in case someone wonders how an unconditional redirect is written in
`nginx.conf`, the snippet is as follows:

<p>
    location ~ ^/blog/(rss2_xml|rdf10_xml|rdf91_xml) {      rewrite .* http://hario.wordpress.com/feed permanent;    }

</p>

