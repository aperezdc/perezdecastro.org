+++
title = "Databases: “id” attributes are a bad idea"
date = 2008-07-24

[taxonomies]
categories = ["igalia"]
tags = ["php"]
+++

Never, never ever have a column named `id` in your relational database.
They work most of the time, but it such a common used name that it is
likely that it will clash with something else. Want an example? Here it
is: PHP behaves oddly when fetching rows. In your database:

```sql
create table foo ( id bigint not null primary key );
insert into foo ( id ) values ( 1 );
insert into foo ( id ) values ( 2 );
insert into foo ( id ) values ( 3 );
```

Then the following PHP snippet

```php
$result = pg_fetch_all(pg_query('select * from foo'));
echo $result[0]['id'];
```

will not work at all. My guess is that some PHP internal code or its
database functions use `id` for their own purposes, so there is no way
of directly retrieving values in columns with such a name. I was stuck
yesterday for an hour with an absurd thing like this.
