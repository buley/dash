Entries are objects in an object store.

#### Working With One Entry At A Time

It's possible to ["`add`"](http://www.w3.org/TR/IndexedDB/#widl-IDBObjectStore-add) (create), ["`get`"](http://www.w3.org/TR/IndexedDB/#widl-IDBObjectStore-get) (read), ["`put`"](http://www.w3.org/TR/IndexedDB/#widl-IDBObjectStore-put) (update an existing object, else create a new one) and ["`delete`"](http://www.w3.org/TR/IndexedDB/#widl-IDBObjectStore-delete) (destroy) single objects in an object store. Generally, to `delete` or `get` a record requires using its `key`, but both `add` and `put` operations do not require a key and will handily return an object's object store key value when added or put (useful when using a [`key generator`](http://www.w3.org/TR/IndexedDB/#dfn-key-generator) and the key is unknown until after insertion).

#### Working With Multiple Entries At The Same Time

When querying for more than one object we must use indexes, and to use indexes we in complex manners we typically need to use a special type of request called a "cursor." When you want to ask for a [`range`](http://www.w3.org/TR/IndexedDB/#dfn-range) of data on an index, what you get back is not the data itself but rather a cursor, which is a reference to a [`position`](http://www.w3.org/TR/IndexedDB/#dfn-position) in the index and fires asyncronous callbacks as that position changes.

When a cursor's callbacks fire, the programmer can place a request and then either "continue" the cursor or abandon it. This process continues until either the programmer is done with the request or the cursor has [exhausted](http://www.w3.org/TR/IndexedDB/#dfn-got-value) the results from its  request [`source`](http://www.w3.org/TR/IndexedDB/#dfn-cursor-source).