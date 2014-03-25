A [`database`](http://www.w3.org/TR/IndexedDB/#dfn-database) houses object stores and have two distinguishing characteristics: a [`name`](http://www.w3.org/TR/IndexedDB/#dfn-object-store-name) (string) and [`version`](http://www.w3.org/TR/IndexedDB/#dfn-version) (number). They are reached through an instance of [`IDBFactory`](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory) object at the `window.indexedDB` namespace

##### Names

When opening a database, a programmer must specify a databases [`name`](http://www.w3.org/TR/IndexedDB/#dfn-object-store-name) and optionally its version. A database name is case-sensitive and cannot change.

##### Versions

#### Database Versions

[`Version`](http://www.w3.org/TR/IndexedDB/#dfn-version) numbers are positive whole numbers greater than zero. A programmer can set a database's version manually or implictly by opening an existing database name with a greater version number than the database contains. While a database's name can never change, the database version changes all the time.

Specifying a version greater than the current allows us to entry a "version change" transaction that enables database schema changes. When no version is specified, the database will open with the most recent database version.

Database version numbers are stored as [8-byte "int long long"](https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Opening_a_database) in the underlying C programming language implementation of IDB  and can number anywhere between `1` and `18446744073709551615`.

##### `versionchange` transactions

A version number can represent only one schema for particular database, but a programmer can change a database's layout by incrementing its version number, triggering something called a "`versionchange`" transaction. [Version changes](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction#VERSION_CHANGE) preserve databases object stores and indexes, but from within a `versionchange` callback the programmer is allowed to make modifications to a database schema.

Database operations that require a version change include both creating and deleting object stores, and both creating and deleting indexes.
