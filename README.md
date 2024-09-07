# Dash

Dash is a simple, lightweight wrapper around the IndexedDB API. It provides a promise-based interface for working with IndexedDB, making it easier to perform database operations in web applications.

## Features

- Promise-based API for IndexedDB operations
- Modular design with separate modules for databases, stores, indexes, and entries
- Built-in error handling and type safety with TypeScript
- Support for custom behaviors and extensions
- Lightweight and easy to integrate into existing projects

## Installation

```bash
npm install dash-indexeddb
```

## Usage

Here's a basic example of how to use Dash:

```javascript
import dash from 'dash-indexeddb';

// Open a database
dash.database.open({ database: 'myDB', version: 1 })
  .then(ctx => {
    // Create an object store
    return dash.stores.add({
      ...ctx,
      store: 'myStore',
      store_key_path: 'id',
      auto_increment: true
    });
  })
  .then(ctx => {
    // Add an entry to the store
    return dash.entry.add({
      ...ctx,
      data: { name: 'John Doe', age: 30 }
    });
  })
  .then(ctx => {
    console.log('Entry added successfully:', ctx.entry);
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });
```

## API Reference

Dash provides methods for working with databases, stores, indexes, and entries. Here are some of the key modules:

- `dash.database`: Methods for working with databases (open, close, delete)
- `dash.stores`: Methods for working with object stores (add, remove, get)
- `dash.indexes`: Methods for working with indexes (add, remove, get)
- `dash.entry`: Methods for working with individual entries (add, get, put, remove, update, count)

Each module provides methods that return promises, allowing for easy chaining of operations.

## Behaviors

Dash supports custom behaviors that can be added to modify or extend its functionality. Behaviors can be used to implement logging, validation, or any custom logic you need.

```javascript
dash.behaviors.add((ctx) => {
  console.log('Operation:', ctx.type, ctx.method);
  return ctx;
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

[Taylor Buley](https://buley.info) (@taylorbuley)

---

Version: 0.0.30
