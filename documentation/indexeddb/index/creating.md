#### Creating An Index

The options for creating a new `index` are similar to those when creating an object store: a `key path` is given using the standard key syntax and the `unique` and `multirow` options can both be used. The ["`unique`"](http://www.w3.org/TR/IndexedDB/#dfn-multirow#dfn-unique) parameter tells the browser not to allow two values to correspond to the same key and the ["multirow"](http://www.w3.org/TR/IndexedDB/#dfn-multirow) flag controls how the index behaves when dealing with `Array` values.

##### Creating An Index Example: Simple Case

http://jsfiddle.net/dashdb/kM4sQ/