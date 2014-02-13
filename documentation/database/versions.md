#### Database Versions

[`Version`](http://www.w3.org/TR/IndexedDB/#dfn-version) numbers are positive whole numbers greater than zero. A programmer can set a database's version manually or implictly by opening an existing database name with a greater version number than the database contains. While a database's name can never change, the database version changes all the time. 

Speficying a version greather than the current allows us to entry a "version change" transaction that enables database schema changes. When no version is specified, the database will open with the most recent database version.

Database version numbers are stored as [8-byte "int long long"](https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Opening_a_database) in the underlying C programming language implementation of IDB  and can number anywhere between `1` and `18446744073709551615`.