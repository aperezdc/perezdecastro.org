Ezmlm lists and the From header
===============================

date
:   2009-05-13 13:17

author
:   Hario

category
:   Connectical

If you have used the fine [ezmlm](http://ezmlm.org/) mailing list
manager (which is a perfect complement for the
[qmail](http://cr.yp.to/qmail.html) MTA) you may have found that when
hitting the “Reply” button in your mail client, the recipient will be
the author of the message instead of the list address. There is a quick
workaround by passing the list address to the `-3` to `ezmlm-make`, but
that will screw up the “From” MIME header in messages, and it will look
like all messages were send by the mailing list!

</p>
Fortunately, there is a solution thanks to the infinite tuneability of
ezmlm. As you should already know, for each list a directory with some
files is created for each mailing list, and most of the behaviour of the
mailing list can be tuned by editing those files. There are two files
which affect MIME headers which will be of interest:

</p>
-   `headerremove` defines a list of headers which will be stripped off
    messages when they arrive.
-   `heeaderadd` defines a list of headers (and their values) which will
    be added by ezmlm when processing messages.

</p>
What we want to do is that the “Reply” button of mail clients makes them
use the list address as recipient. For this we can add a “Reply-To”
header, and a “X-Mailing-List” one (the latter is not standard, but
honored by a number of clients):

</p>
<p>
    echo 'Reply-To: yourlist@yourdomain.com' >> headeradd  echo 'X-Mailing-List: <yourlist@yourdomain.com>' >> headeradd

</p>
The we must ensure that the original “From” header is preserved, by not
listing it in `headerremove`:

</p>
<p>
    sed -i -e '/^[Ff]rom$/d' headerremove

</p>
Now you will see the correct “From” value in messages, and replying to
them will send the message to the list by default. Also, if you want to
filter list messages, you can now use the “X-Mailing-List” header, which
is the default action of some clients when classifying messages per
mailing list.

</p>
Isn't ezmlm nice? ;-)

</p>

