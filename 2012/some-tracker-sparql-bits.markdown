Title: Some Tracker + SPARQL bits
Date: 2012-02-20 18:32
Author: aperez
Tags: igalia, tracker

Those are some notes about [Tracker][] with links and information which
has been useful to me when using Tracker as data storage backend in a
project. Maybe those will be useful to someone else out there :)

**Reference documentation**

The basics are the [W3C][] standards:

-   [SPARQL query syntax][]
-   [SPARQL update syntax][]
-   The [examples section in the Tracker wiki][] is easier to digest
    than the W3C documents, so it is usually better to search there for
    something similar to what one is trying to achieve.
-   If one knows the basic SPARQL syntax, reading the [ontologies][] is
    the way to know what Tracker has stored and under which names.

**Tracker-specific info**

-   Tracker adds some [extra features][] which can be used in SPARQL
    queries. Some of them can be used to make queries faster (see
    below).
-   It is possible to subscribe to [notifications of changes][] to the
    Tracker database. However, using the low-level D-Bus support is
    crude, therefore it is better to use something like
    [TrackerLiveQuery][].

**Optimizing queries**

At some point one may realize that a particular query is not running
fast enough, and usually the first thought would be to blame Tracker
being slow: as a matter of fact Tracker tends to be quite fast, but
sometimes the way it translates the SPARQL queries to SQL makes them be
slower than they could be. And the good news is that most of the queries
can be tweaked to facilitate the job of the query optimizer. There are
some hints in the Tracker wiki:

-   [SPARQL Tips & Tricks][]

Also, I would recommend reading those two nice articles by [Adrien
Bustany][]:

-   [Optimizing SPARQL queries for Tracker, part 1][]
-   [Optimizing SPARQL queries for Tracker, part 2][]

**Undocumented behavior**

Undocumented behavior exists in Tracker to a certain degree. Some of the
undocumented behavior is caused by the fact that [SQLite][] is used
underneath and that the SPARQL parser included in Tracker is quite
permissive and will just pass-through certain constructs when generating
the SQL queries.

As an example, the [regular expression syntax used by SPARQL][] does not
include predefined character classes, but as SQLite uses [POSIX regular
expressions][] internally, the following filter expression works:

```sql
SELECT ?name
WHERE { ?urn nco:imNickname ?name
        FILTER (bound(?name) && !REGEX(?name, "[[:space:]]+")) }
```

*(Obtains the nick names of instant messaging contacts which **do not**
have spaces in them.)*

Another example of undocumented behaviour is the fact that aggregate
functions (e.g. `COUNT`) can be used on the result of a property
function. For example, take this query:

```sql
SELECT nie:url(?urn) COUNT(?regions)
WHERE { ?urn rdf:type nmm:Photo .
        OPTIONAL { ?urn nfo:hasRegionOfInterest ?region } }
GROUP BY ?urn
```

*(Obtains the URLs of images and the number of associated regions of
interest.)*

The above query would run faster if it would be possible to get rid of
the `OPTIONAL` clause, by [using a property function][], but when an
attribute has multiple values, the property function returns the
concatenation of the values separated by commas, so `COUNT` would be
expected choke when applied to that... No! Actually, the following works
as expected:

```sql
SELECT nie:url(?urn) COUNT(nfo:hasRegionOfInterest(?urn))
WHERE { ?urn rdf:type nmm:Photo }
GROUP BY ?urn
```

*(Obtains the URLs of images and the number of associated regions of
interest — faster version.)*

  [Tracker]: http://live.gnome.org/Tracker
  [W3C]: http://www.w3.org
  [SPARQL query syntax]: http://www.w3.org/TR/rdf-sparql-query/
  [SPARQL update syntax]: http://www.w3.org/Submission/SPARQL-Update/
  [examples section in the Tracker wiki]: https://live.gnome.org/Tracker/Documentation#Examples
  [ontologies]: http://developer.gnome.org/ontology/unstable/
  [extra features]: https://live.gnome.org/Tracker/Documentation/SparqlFeatures
  [notifications of changes]: https://live.gnome.org/Tracker/Documentation/SignalsOnChanges
  [TrackerLiveQuery]: http://blogs.igalia.com/aperez/2011/02/live-is-live-tracker-qt-uptodate/
  [SPARQL Tips & Tricks]: https://live.gnome.org/Tracker/Documentation/SparqlTipsTricks
  [Adrien Bustany]: http://blogs.gnome.org/abustany
  [Optimizing SPARQL queries for Tracker, part 1]: http://blogs.gnome.org/abustany/2011/01/15/optimizing-sparql-queries-for-tracker-part-1/
  [Optimizing SPARQL queries for Tracker, part 2]: http://blogs.gnome.org/abustany/2011/01/20/optimizing-sparql-queries-for-tracker-part-2/
  [SQLite]: http://sqlite.org/
  [regular expression syntax used by SPARQL]: http://www.w3.org/TR/xpath-functions/#regex-syntax
  [POSIX regular expressions]: https://en.wikipedia.org/wiki/Regular_expression#POSIX
  [using a property function]: https://live.gnome.org/Tracker/Documentation/SparqlTipsTricks#Use_property_functions
