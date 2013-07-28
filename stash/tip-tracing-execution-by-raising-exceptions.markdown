Title: Tip: Tracing execution by raising exceptions
Date: 2008-10-22 22:56
Author: aperez
Category: Igalia
Tags: debug, php

This is a quick tip which I have found to be very useful when adding
[SQLite][] support to a PHP application which was running on
[PostgreSQL][].

It is nice to have different levels of debugging which can be enabled
and disabled independently. Currently I have three debugging facilities:

-   Echoing text messages to a log file. It is nicer than just spitting
    out text. Also, a file can be easily followed with the help of
    `grep`, `tail` and the plethora of Unix command line tools.
-   Logging of SQL queries and their results. This one is extremely
    useful to know what the database manager is receiving as input and
    its raw results. I usually have this disabled, but can avoid serious
    headache when touching the database schema.
-   Re-raise unhandled exceptions instead of silently logging them. A
    traceback is sometimes a valuable resource, but you do not want your
    users to see them when deploying your application.

I have just added the third feature today, and a pair of lines saved me
from some hours debugging the exact place where a database error which
appeared when using SQLite was triggered. Of course once the application
enters production phase, all the debugging code can be disabled by just
changing a single variable for each of them :-)

Those were my two cents for today.

  [SQLite]: http://sqlite.org
  [PostgreSQL]: http://postgresql.org
