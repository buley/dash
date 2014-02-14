Say for example there's an index with 26 records containing the alphabet "A" to "Z". Here are some ways we could query it: 
* "only" "Z" would return just one object.
* lower "A", upper "Z" would return 24 objects
* lower "A", upper "Z", with "lowerOpen" and "upperOpen" set to `true` would return 26 objects
* lower "A", with "lowerOpen" set to `true` and the direction `next` would return 26 objects
* lower "A", with "lowerOpen" set to `true` and the direction `previous` would return 1 object
* lower "Z", with "lowerOpen" set to `true` would return one object
* lower "Z", with "lowerOpen" set to `false` would return no objects
* lower "Z", with "upperOpen" set to `false` would return no objects
* lower "A", upper "Z", with "lowerOpen" and "upperOpen" set to `false` would return 24 objects
* lower "A", upper "Z", with "lowerOpen" set to `true` and and "upperOpen" set to `false` would return 25 objects