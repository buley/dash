##### `versionchange` transactions

A version number can represent only one schema for particular database, but a programmer can change a database's layout by incrementing its version number, triggering something called a "`versionchange`" transaction. [Version changes](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction#VERSION_CHANGE) preserve databases object stores and indexes, but from within a `versionchange` callback the programmer is allowed to make modifications to a database schema.

Database operations that require a version change include both creating and deleting object stores, and both creating and deleting indexes. 

#### Opening Databases

To get to objects, you have to through object stores, and to get to object stores you have to go through databases. So the first step in interaction with `IndexedDB` is almost always to open a database. Database open requests are instances of [`IDBOpenDBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest).