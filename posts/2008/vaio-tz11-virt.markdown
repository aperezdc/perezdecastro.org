title: Virtualization extensions with a Vaio TZ11MN/N
date: 2008-04-26 20:24
author: Hario
tags: hardware linux gentoo


For some bizarre reason the silly people working at Sony decided to
disable the [Intel VT
extensions](http://en.wikipedia.org/wiki/X86_virtualization#Intel_VT_.28IVT.29)
by default. But [hackers](http://catb.org/jargon/html/H/hacker.html) are
always smarter than stupid salesmen making decisions in some random
department of a Enormous Big Company™: there is [a
way](http://forum.notebookreview.com/showthread.php?t=189228&page=5) to
re-enable VT extensions.

**Big FAT warning:**I have only checked this with a Vaio VGN-TZ11MN/N
with a Phoenix BIOS version R0052N7. **Following the instructions
detailed here may render your computer totally unusable**, and I decline
all responsiblity on the correctness of this method. It worked for me,
however.

Fortunately, the code needed to enable the virtualization extensions is
still in the BIOS, but there is no menu which allows for easy
configuration, so we need to modify the setting using a somewhat
“manual” method.

1.  Get yourself a bootable DOS system. You can boot from hard-disk, a
    floppy, a USB flash stick or whatever. I used one of the
    [FreeDOS](http://www.freedos.org/) boot floppy images I used a some
    time ago to play old computer games in an old Pentium 120 I own. In
    order to write the image to an USB floppy drive I had to use the
    following command:

        # dd if=fdosfloppy.img of=/dev/sda

2.  Copy a [DOS text
    editor](http://short.stop.home.att.net/freesoft/txtedit1.htm) into
    the bootable device. I used the tiny “T” editor.

3.  [Get](http://www.filewatcher.com/b/ftp/ftp.supermicro.com/utility.0.0.html)
    yourself a copy of the `symcmos.exe` utility and copy it to the
    bootable device. This tool allows modifying the configuration values
    stored in the CMOS by dumping current contents and loading new
    values from a text file.

4.  Boot the DOS system from the device we have prepared so far.

5.  Run `symcmos -v2 -lsettings.txt`, if everything goes as expected now
    the `settings.txt` file will contain one setting per line, in a
    `(address)[value]` fashion.

6.  Scroll down to address `0363` and modify the value from `0000` to
    `0001`. Save the file.

7.  Load the new values into the CMOS by running
    `symcmos -v2 -usettings.txt`

8.  Last, but not least, power down the computer (a warm reboot will not
    work). If everything went well, now you can boot your [favourite
    GNU/Linux distro](http://gentoo.org), load the kernel module and
    install [KVM](http://kvm.qumranet.com/):

        # modprobe kvm-intel
        # emerge kvm

For KVM I am using the [ebuilds from the sabayon
overlay](http://svn.sabayonlinux.org/overlay/app-emulation/kvm/). Also,
if there is an error when trying to load the KVM kernel module, maybe
you did not follow the procedure correctly: double-check your steps, and
remember that using `dmesg | tail` you can check whether VT is still
disabled by the BIOS.

For the intrepidous people trying this, I hope you will have good luck
(as I did), but remember that I can only say that this works for a
VGN-TZ11MN/N with a Phoenix BIOS version R0052N7.
