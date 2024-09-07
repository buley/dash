# Dash
## Version: 0.0.30

Dash is a simple, lightweight wrapper around the IndexedDB API. It provides a promise-based interface for working with IndexedDB, making it easier to perform database operations in web applications.

## Features

- Promise-based API for IndexedDB operations
- Modular design with separate modules for databases, stores, indexes, and entries
- Built-in error handling and type safety with TypeScript
- Support for custom behaviors and extensions
- Lightweight and easy to integrate into existing projects

## Installation

```bash
npm install @buley/dash
```

## Usage

Here's a basic example of how to use Dash:

```javascript
import dash from '@buley/dash';

// Open a database
dash.get.database({ database: 'myDB', version: 1 })
  .then(ctx => {
    // Create an object store
    return dash.add.store({
      ...ctx,
      store: 'myStore',
      store_key_path: 'id',
      auto_increment: true
    });
  })
  .then(ctx => {
    // Add an entry to the store
    return dash.add.entry({
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

Dash provides methods for working with databases, stores, indexes, and entries. The API is structured as `dash.<action>.<target>`. Here are some key operations:

- Database operations:
  - `dash.get.database`: Open a database
  - `dash.remove.database`: Delete a database
- Store operations:
  - `dash.add.store`: Create a new object store
  - `dash.remove.store`: Delete an object store
  - `dash.get.stores`: Get all object stores
- Index operations:
  - `dash.add.index`: Create a new index
  - `dash.remove.index`: Delete an index
  - `dash.get.indexes`: Get all indexes for a store
- Entry operations:
  - `dash.add.entry`: Add a new entry
  - `dash.get.entry`: Get an entry
  - `dash.update.entry`: Update an entry
  - `dash.remove.entry`: Delete an entry
  - `dash.count.entries`: Count entries in a store

Each method returns a promise, allowing for easy chaining of operations.

## Behaviors

Dash supports custom behaviors that can be added to modify or extend its functionality. Behaviors can be used to implement logging, validation, or any custom logic you need.

```javascript
dash.add.behavior((ctx) => {
  console.log('Operation:', ctx.type, ctx.method);
  return ctx;
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Taylor Buley (@taylorbuley)
