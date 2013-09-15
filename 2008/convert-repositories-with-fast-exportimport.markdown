Title: Convert repositories with fast-{export,import}
Date: 2008-11-20 13:44
Author: aperez
Tags: bzr, git, scm, igalia

**Update 2010-01-23:** Nowadays the plugin is packaged in Debian
(package `bzr-fastimport`) and Ubuntu (package `bzr-fastexport`). Once
installed you can just go and use `bzr fast-export` instead of the
alias. Thanks to the people that commented about this update :)

Those days I faced the need of moving a set of [Bazaar][] branches into
a set of [Git][] repository, and althought I already knew about
[Tailor][], but I wanted a one-shot conversion and Tailor is more, ahem,
*tailored* for periodic synchronization. So I decided to try [git
fast-import][], because I already knew about [bzr fast-import][] plugin
which is inspired by the Git version of the thing. The Bazaar plugin
includes a `bzr-fast-export` script which can be used to feed input data
to `git fast-import`.

First, we need to install the Bazaar plugin. This one is easy:

```bash
mkdir -p ~/.bazaar/plugins
cd ~/.bazaar/plugins
bzr get lp:bzr-fastimport fastimport
```

I will be importing three branches into a Git repository, so we need to
create a Git repository:

```bash
mkdir ~/myproject.git
cd ~/myproject.git
git --bare init
```

I suppose you have three related Bazaar branches:

- `~/myproject` is the main branch of the project. It will be imported
  as `master` branch in Git.
- `~/myproject.branch-a` and `~/myproject.branch-b` are two branched
  whose parent is the first one.


The, in a shell, do:

```bash
alias bzrexp="~/.bazaar/plugins/fastimport/exporters/bzr-fast-export"
bzrexp --export-marks=../marks.bzr ../myproject    \
   | git fast-import --export-marks=../marks.git
bzrexp --marks=../marks.bzr --git-branch=branch-a  \
   ../myproject.branch-a | git-fast-import         \
   --import-marks=../marks.git --export-marks=../marks.git
bzrexp --marks=../marks.bzr --git-branch=branch-b  \
   ../myproject.branch-b | git-fast-import         \
   --import-marks=../marks.git --export-marks=../marks.git
```

Voilà! It will run in a snap, the limit will be your disk speed, as both
the exporter and the importer are very fast.

  [Bazaar]: http://bazaar-vcs.org
  [Git]: http://git.or.cz
  [Tailor]: http://progetti.arstecnica.it/tailor
  [git fast-import]: http://www.kernel.org/pub/software/scm/git/docs/git-fast-import.html
  [bzr fast-import]: http://bazaar-vcs.org/BzrFastImport
