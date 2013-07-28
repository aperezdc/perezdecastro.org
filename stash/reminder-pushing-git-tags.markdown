Title: Reminder: Pushing GIT tags
Date: 2009-01-30 14:40
Author: aperez
Category: Igalia
Tags: cli, git, scm

Just a quick reminder for myself and for my fellow colleagues which also
do use [GIT][]: **use `--tags` when pusing for sending information about
tagged revisions when pushing**. So, for example, if I tag a new
[Bill][] release, like I am doing right now, I have to push data to
Gitorious this way in order for the tag to appear:

      git tag v0.1-2
      git push gitorious master:master --tags

(Just in case you are wondering: I like to be explicit about which
branch to push and its destination ;-))

  [GIT]: http://git.or.cz
  [Bill]: http://people.igalia.com/aperez/bill
