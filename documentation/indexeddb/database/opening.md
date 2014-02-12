#### Opening A Database Example: Simple Case

http://jsfiddle.net/dashdb/ZCngL/

Opening an existing database and creating a new one work in the same way: if the name passed matches an existing database, that database is opened; if the name doesn't match an existing database, a new one will be created when opened using a unique name. Opening a new database, or opening an existing database with a version greather than the current version, will trigger a `versionchange` event.  