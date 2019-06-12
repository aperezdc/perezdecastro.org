+++
title = "Packaging Navalplan and OpenERP 5.2 alpha"
date = 2010-03-27
taxonomies.categories = ["igalia"]
taxonomies.tags = ["debian", "navalplan", "openerp"]
+++

I have been packaging some stuff into `.deb` packages lately, and even
when the packages are not perfect, I think it would be interesting to
share them.

The [first package][], which works almost fine in Ubuntu Karmic, is for
[Navalplan][], an application designed to improve the production
management of companies from galician naval auxiliary sector (my fellow
Igalians are doing a great work on it, keep rocking!). You will also
need Cutycapt ([i386][], [amd64][]). There are still some rough edges in
the package, so for the momwnt you will need to manually symlink the
PostgreSQL `.jar` bundle. In short, you can install this one with:

```bash
wget http://people.igalia.com/aperez/files/debs/cutycapt_20100108_i386.deb
wget http://people.igalia.com/aperez/files/debs/navalplan_20100324_all.deb
dpkg -i cutycapt_20100108_i386.deb navalplan_20100324_all.deb
apt-get install -f -y
ln -s /usr/share/java/postgresql-jdbc3-8.2.jar /usr/share/tomcat6/lib
```

The second one, which works at least in Debian Lenny and Ubuntu Karmic
(may work on Lenny as well), is a [package][] for the upcoming
[OpenERP][] 5.2 ([patch][]). The packaging patch is a bit rough in the
edges because it hardwires some Debian-specific stuff and the
installation of a `.desktop` file in the `setup.py` script — but the
resulting package does its job perfectly: we can install it easily and
once 5.2 is officially release the official package will smoothly
replace it. One final note: no special instructions are needed to
install this one, apart from the usual mantra:

```bash
wget http://people.igalia.com/aperez/files/debs/openerp-client_5.2-alpha20100324-1_all.deb
dpkg -i openerp-client_5.2-alpha20100324-1_all.deb
apt-get install -f -y
```

Enjoy!

**Note:** This packages are unofficial, and contain bleeding-edge
software, directly picked from the corresponding project repositories.
Even when they have not been thoroughly tested, they should be pretty
safe to use and most likely they will not break your system — but I
cannot make a strong guarantee.

  [updated OpenERP package]: http://people.igalia.com/aperez/files/debs/openerp-client_5.2-alpha20100420-5_all.deb
  [first package]: http://people.igalia.com/aperez/files/debs/navalplan_20100324_all.deb
  [Navalplan]: http://www.navalplan.org/
  [i386]: http://people.igalia.com/aperez/files/debs/cutycapt_20100108_i386.deb
  [amd64]: http://people.igalia.com/aperez/files/debs/cutycapt_20100108_amd64.deb
  [package]: http://people.igalia.com/aperez/files/debs/openerp-client_5.2-alpha20100324-1_all.deb
  [OpenERP]: http://www.openerp.com/
  [patch]: http://people.igalia.com/aperez/files/debs/openobject-client-debian-20100315.patch
