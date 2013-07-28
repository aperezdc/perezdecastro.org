Title: Using Bleeding-edge Sup on Ubuntu
Date: 2008-11-05 22:57
Author: aperez
Category: Igalia
Tags: sup

This is a quick recipe which will tell you how to run the development
version of the [Sup e-mail client][] on Ubuntu 8.10; the method will
probably work on any recent Ubuntu or Debian distribution.

First, download the latest Sup code from [their Git repository][]:

    cd ~
    git clone git://gitorious.org/sup/mainline.git sup

Then, install dependencies needed for Sup to run, as `root`:

    apt-get install rubygems ruby-dev 
       lib{ferret,highline,openssl,net-ssh,ncurses,gettext}-ruby1.8
    gem install hoe rmail mime-types fastthread 
       trollop lockfile chronic

Now you can run Sup with your regular user account from the Git branch
you downloaded. Do not add sources with `sup-config` as it will fail
when trying to find the `sup-add` command, it is better to run `sup-add`
manually like in the following example:

    cd ~/sup
    ruby -I lib -w bin/sup-config
    ruby -I lib -w bin/sup-add --labels=inbox imaps://igalia.com/
    ruby -I lib -w bin/sup

Of course, make sure you use your own mail server, and run
`sup-add --help` to take a look at the possible options. If you have
already configured Sup before, or if your prefer to, you can skip
running `sup-config` and/or `sup-add`.

That's all for now, folks. I will tell you in the following weeks how
well I manage using Sup. It can be an interesting reading, as I am
trying to move away from Evolution. As a last reminder, do not forget to
take a look at the [Sup new user guide][] :-)

**Update:** You will need to install `build-essential` and
`libncurses5-dev` if you do not have them installed prior to installing
Ruby gems.

  [Sup e-mail client]: http://sup.rubyforge.org/
  [their Git repository]: http://gitorious.org/projects/sup
  [Sup new user guide]: http://sup.rubyforge.org/NewUserGuide.txt
