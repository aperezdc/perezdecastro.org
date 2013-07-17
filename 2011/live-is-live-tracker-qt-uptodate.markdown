Title: Live is live: How to use Tracker from Qt apps and have your view of the world up to date
Date: 2011-02-28 02:01
Author: aperez
Category: Hacking, Recipes
Tags: c, qt, qtsparql, tracker

I have been working lately with the [Qt][] framework and the [Tracker][]
store. The first thing I noticed once got to know about the current
Tracker incarnations is that it not just another metadata crawler with
full-text search support for letting users locate content afterwards: it
is also a *structured storage system*. Yes, you have read that
correctly, and that means that additional data about items, or even your
own data can be managed using Tracker. Now, imagine that you are
developing an image viewer, with the following hypotheses:

-   The application is coded in C++, using Qt.
-   The application asks Tracker for the images it has indexed, to
    display them. This means that the user probably can choose among
    different filtering criteria, and could have extras like tagging,
    favorites, etc. stored in Tracker.
-   You want to take advantage of the ability that Tracker has to notify
    applications about changes in the stored items and their metadata.
    For example, this means that when an external application adds a tag
    to some image, your application will get a notification and can
    update its view (cool! :P)

The last one is what this post is about: how to get live updates from
Tracker conveniently. For this, the idea is to use the [QtSparql][]
library, and more precisely `TrackerLiveQuery` from the
[tracker-extensions][] package.

What follows is an example, which is a C++ source file (you can download
it: [liveexample.cpp][], [liveexample.pro][]) which I prepared for this
post with a lot of comments intertwined with the code. Make sure you
read the comments:

```cpp
/*
 * liveexample.cpp
 * Copyright (C) 2011 Adrian Perez 
 *
 * Distributed under terms of the MIT license.
 */

#include <QAbstractItemModel>
#include <QSparqlConnection>
#include <TrackerLiveQuery>
#include <QCoreApplication>
#include <QStringList>
#include <QString>
#include <cstdio>


static const QString DRIVER(
  "QTRACKER_DIRECT"
);

/*
 * This is a regular SPARQL query that will fetch the URLs of the photos
 * indexed by Tracker. Note that we add a column to the result that contains
 * the Tracker unique identifier: it will be used by LiveQuery to merge the
 * updates in the model. For live updates to work, it is mandatory to have
 * the identifier in one of the columns.
 *
 * By the way, for a real-world application queries would be more complex,
 * but the main point here is to get a taste of how live queries work.
 */
static const QString QUERY(
  "SELECTn"
  "  tracker:id(?urn) AS ?trackeridn"
  "  nie:url(?urn) AS ?urln"
  "WHERE {n"
  "  ?urn rdf:type nmm:Photo .n"
  "}n"
  "ORDER BY ?url"
);

/*
 * This is the SPARQL query for getting the actual data of updated items.
 * It must contain the same result columns and in the same order as the
 * above query. The "%FILTER" string will be replaced by an expression like
 * the following:
 *
 *    FILTER( IN (, , ... , ))
 *
 * Where "" is an expression that results in a Tracker identifier
 * whilst "" will be the Tracker identifiers of the updated items. How
 * the "" part looks like is to be defined.
 *
 * Note that order of the results is not relevant for the update query.
 */
static const QString QUERY_UPDATE(
  "SELECTn"
  "  tracker:id(?urn) AS ?trackeridn"
  "  nie:url(?urn) AS ?urln"
  "WHERE {n"
  "  ?urn rdf:type nmm:Photo .n"
  "  %FILTERn"
  "}n"
  "ORDER BY ?url"
);


class LiveExample: public QObject
{
    Q_OBJECT

private:
    QSparqlConnection m_connection;
    TrackerLiveQuery  m_liveQuery;

public:
    /*
     * Initialize the LiveQuery object. Apart from the query used to get the
     * initial data set, we pass the number of columns in the result and the
     * connection to use. Note that the total number of columns must be
     * passed, the column that contains the Tracker identifier is accounted
     * for, too.
     */
    LiveExample():
        QObject(),
        m_connection(DRIVER),
        m_liveQuery(QUERY, 2, m_connection)
    {
        /*
         * TrackerLiveQuery::model() returns a subclass of QAbstractItemModel,
         * we can connect to its modification signals:
         *
         *   - rowsInserted() is emitted when a new item is added.
         *   - rowsAboutToBeRemoved() is emitted just before an item is
         *     removed.
         *
         * We could listen to more signals, e.g. dataChanged().
         */
        connect(m_liveQuery.model(),
                SIGNAL(rowsInserted(const QModelIndex&, int, int)),
                SLOT(onRowsInserted(const QModelIndex&, int, int)));

        connect(m_liveQuery.model(),
                SIGNAL(rowsAboutToBeRemoved(const QModelIndex&, int, int)),
                SLOT(onRowsAboutToBeRemoved(const QModelIndex&, int, int)));

        /*
         * Instantiate a TrackerPartialUpdater with the update query. Then
         * ask it for listening to changes using the ::watchClass() method:
         *
         *    - First argument is the name of the class (nmm:Photo) to
         *      listen to. Note live updates only work with classes that
         *      have the "tracker:notify true" attribute in its ontology.
         *    - Next we pass a list of attributes to watch for changes.
         *      The default behavior, passsing an empty list, will get
         *      notifications for all properties.
         *    - Remember about the "" snippet used to construct
         *      the replacement for "%FILTER" in the update query? Here we
         *      pass the "" part.
         *    - For updates, put subjects in the %LIST.
         *    - Finally, we specify which column contains the Tracker unique
         *      identifier.
         */
        TrackerPartialUpdater updater(QUERY_UPDATE);
        updater.watchClass("nmm:Photo",
                           QStringList(),
                           "tracker:id(?urn) in %LIST",
                           TrackerPartialUpdater::Subject,
                           0);
        m_liveQuery.addUpdater(updater);

        /*
         * TrackerLiveQuery can maintain the model sorted when processing
         * updates. We need to specify a list of columns that are to be used
         * for sorting. In this case, the URL column is used.
         */
        m_liveQuery.setCollationColumns(QList()
            << TrackerLiveQuery::CollationColumn(1, QVariant::String,
                                                 Qt::AscendingOrder));

        /*
         * We also need to tell LiveQuery which column in the main SPARQL
         * query contains the Tracker unique identifier.
         */
        m_liveQuery.setIdentityColumns(QList() << 0);

        /*
         * Bxplicitly enable processing updates. This is the default so in
         * reality this call is not needed, but it serves to let you know
         * that updates can be temporarily paused.
         */
        m_liveQuery.setUpdatesEnabled(true);

        /*
         * Finally, use TrackerLiveQuery::start() to let it make its magic.
         * This will make an initial query to get information about the
         * watched classes, then the main query to get the initial data set,
         * and finally it will connect to the D-Bus signal used by Tracker
         * to notify about updates.
         */
        m_liveQuery.start();
    }

public Q_SLOTS:
    /*
     * This slot will be called when new elements are added to the model.
     * It just prints a plus sign and the URL of the item.
     */
    void onRowsInserted(const QModelIndex&, int start, int end)
    {
        QAbstractItemModel *model = m_liveQuery.model();
        for (int row = start; row index(row, 1));
            std::printf("+ %sn", qPrintable(model->data(idx).toString()));
        }
    }

    /*
     * This slot will be called just before elements are removed from the
     * model. It just pinrts a minus sign and the URL of the item.
     */
    void onRowsAboutToBeRemoved(const QModelIndex&, int start, int end)
    {
        QAbstractItemModel *model = m_liveQuery.model();
        for (int row = start; row index(row, 1));
            std::printf("- %sn", qPrintable(model->data(idx).toString()));
        }
    }
};


int main(int argc, char *argv[])
{
    /*
     * Having a QCoreApplication or a QApplication is needed to have an
     * event loop and using D-Bus. LiveQuery uses the later to get
     * update notifications from Tracker.
     */
    QCoreApplication application(argc, argv);
    LiveExample liveExample;
    return application.exec();
}

#include "moc_liveexample.cpp"
```

Actually, you can build the above code (downloads: [liveexample.cpp][],
[liveexample.pro][]) and try it out in your computer. By the way, you
will need to have Tracker installed, and the QtSparql libraries. One of
the nicest things of this method is that the value returned
by `m_liveQuery.model()` is a subclass of [QAbstractItemModel][], and
that means that it is nicely integrated with the rest of Qt, so for
example you can put that model as source for a [QTableView][], and the
table will be automagically updated as items are added and removed to
the Tracker store.

Nice, huh?

  [Qt]: http://qt.nokia.com/
  [Tracker]: http://live.gnome.org/Tracker
  [QtSparql]: http://maemo.gitorious.org/maemo-af/qsparql
  [tracker-extensions]: http://maemo.gitorious.org/maemo-af/libqtsparql-tracker/
  [liveexample.cpp]: http://people.igalia.com/aperez/files/liveexample.cpp
  [liveexample.pro]: http://people.igalia.com/aperez/files/liveexample.pro
  [QAbstractItemModel]: http://doc.qt.nokia.com/4.7/qabstractitemmodel.html
  [QTableView]: http://doc.qt.nokia.com/4.7/qtableview.html
