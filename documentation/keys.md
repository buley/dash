A [`key`](http://www.w3.org/TR/IndexedDB/#dfn-cursor-key) identifies a record and the value is what's being stored. The list of records associated is represented by a JavaScript object, so there can be only one value per key. A [`valid key`](http://www.w3.org/TR/IndexedDB/#dfn-valid-key-path) can be any of these types: String, Dates, floats and Arrays. The key that identifies a record is found using something called a "[`key path`](http://www.w3.org/TR/IndexedDB/#dfn-key-path)."

To specify a key path, a "plain string" will create a key matching a shallow attribute on a stored record. To specify the key among nested attributes in JavaScript objects, [`valid key path`](http://www.w3.org/TR/IndexedDB/#dfn-valid-key-path) syntax uses "dot notation". For example, "first.second.third" would be the key path for an index on the "third" key in the following JavaScript object:

	{ "first": {
	    "second": {
	      "third": [ "string value 1", "string value 2" ]
	    }
	  }
	}

As shown above, it's possible to put indexes on array objects in addition to primitive values such as numbers. In such cases, the "[`multirow`](http://www.w3.org/TR/IndexedDB/#dfn-multirow)" allow the programmer to specify when creating a database whether an index record will be created on each object in a particular array (multirow set to `true`) or whether a record is created for only the first (multirow set to `false`). When an empty array is passed as the value of a multirow index, no record will be added.