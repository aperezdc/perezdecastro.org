Title: Beware of bugs... yarrr!
Date: 2008-09-15 12:58
Author: aperez
Category: Igalia

> Beware of bugs in the above code; I have only proven it correct,  
>  not tried it.
>
> —Donald E. Knuth.

As long as you keep administering machines, you may have found that
updating critical systems can be tedious if you do your job carefully:
manually checking whether packages (either new or upgraded) have known
issues which may affect your machines can be tedious and error prone.
Fortunately there is some tools which automate such tests, and one of
those is available for Debian and derived systems (in general I think it
will work with nearly every APT-based distro out there): `apt-listbugs`.
After installing the package, which is readily available from your Usual
Sources™, the installed APT hook will check the package against the bug
tracker for your distribution and ask you what to do in the presence of
existing open bugs:

    Retrieving bug reports... Done
    Parsing Found/Fixed information... Done
    serious bugs of python-babel (-> 0.9.1-5) 
     #493742 - Python namespace conflict with python-pybabel
    Summary:
     python-babel(1 bug)
    Are you sure you want to install/upgrade the above packages? [Y/n/?/...]

You can tap `?` at the prompt to see the list of available actions: you
can stop installing, pin packages... If you also install `reportbug` you
will be able of typing the bug number at the prompt to see bug details.

I hope this makes you life a little bit happier.
