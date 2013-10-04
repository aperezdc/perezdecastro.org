Title: Factor out your Apache-fu with mod_macro
Date: 2009-10-19 13:23
Author: aperez
Tags: apache, igalia, connectical

For nearly all HTTP-serving related work, our software of choice is the
[Apache][] web server. Lately, we have been moving some old setups which
were still running Apache 1.3 to the latest version in the 2.x series.
This may be a lot of work when the number of virtual hosts you are
serving is far from low, or if you have some lengthy, repetitive
configuration blocks which must be modified everytime you want introduce
some change. One may be tempted to auto-generate configuration snippets
from something else using some quick Bash/Perl/Python/Whatever script,
but there is a more elegant solution: meet [mod\_macro][].

As the name suggests, it is an Apache 2.x module which allows for
defining snippets with customizable optional parameters. Take this
real-world example from `/etc/apache2/mods-available/macro.conf`:

```apache
AuthType basic
AuthBasicProvider ldap
AuthLDAPUrl ldap://ldap.local/dc=yoursite,dc=com?uid
AuthLDAPGroupAttribute uniqueMember
AuthLDAPGroupAttributeIsDN On
Require ldap-group cn=$group,ou=Group,dc=yoursite,dc=com
```

This is a common setup in most of our services, so now everytime one
wants to add autentication against the LDAP server, it is only a matter
of adding an `Use` clause in the proper place:

```apache
# Put this into the virtual host configuration block:
Use AuthLDAPSetup wwwusers
```

Ta-da! This is 5 lines shorter, and less error-prone. Also, if some day
some extra configuration is needed to authenticate using LDAP, it is
enough to change the macro definition, and changes will be automatically
propagated to all places where it is used.

Wrapping up, you may consider installing [mod\_macro][] in your Apache
installs for the following reasons:

-   <span style="background-color: #ffffff">Greatly simplifies repeated
    code snippets in configuration files.</span>
-   <span style="background-color: #ffffff">It is integrated with the
    web server: no external tools are needed.</span>
-   <span style="background-color: #ffffff">Is especially useful to make
    changes to big sites in a single shot.</span>
-   <span style="background-color: #ffffff">Does not add overhead to
    request processing, only to initial configuration file parsing at
    server startup.</span>
-   <span style="background-color: #ffffff">It is simple enough to learn
    and use in a couple of minutes.</span>


  [Apache]: http://httpd.apache.org/
  [mod\_macro]: http://www.cri.ensmp.fr/~coelho/mod_macro/
