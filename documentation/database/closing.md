Databases can be [`close`d](http://www.w3.org/TR/IndexedDB/#dfn-database-close-1).

Databases are browser resources and, like all resources, expensive for the brower to maintain. Just as opening a database is the first step to doing anything in IndexedDB, closing a database is usually a good last step.