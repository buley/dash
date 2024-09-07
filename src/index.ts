/*
      ▀██                 ▀██      
    ▄▄ ██   ▄▄▄▄    ▄▄▄▄   ██ ▄▄   
  ▄▀  ▀██  ▀▀ ▄██  ██▄ ▀   ██▀ ██  
  █▄   ██  ▄█▀ ██  ▄ ▀█▄▄  ██  ██  
  ▀█▄▄▀██▄ ▀█▄▄▀█▀ █▀▄▄█▀ ▄██▄ ██▄ 

  Dash is a simple, lightweight wrapper around the IndexedDB API.
  There are four main modules: database, store, index, and entry.
  Each module has a get, put, and remove method.
  The library is designed to be used in a promise chain.

  Version -> 0.0.1
  Repo -> http://github.com/buley/dash
  Author -> Taylor Buley (@taylorbuley)
  Copyright -> (c) 2011-2024 Taylor Buley
  License -> MIT (https://opensource.org/licenses/MIT)
*/

import behaviorMethods from './behaviors';
import databaseMethods from './database';
import databasesMethods from './databases';
import storesMethods from './stores';
import entryMethods from './entry';
import indexMethods from './index';
import indexesMethods from './indexes';
import storeMethods from './store';

const dash = ((internal: any) => {
  'use strict';

  var Public: any = {};
  var names: string[] = [];
  var name: string;

  // Function to safely iterate over internal API and build the Public API
  function safeIterate(obj: any, callback: (sig: string, fnref: Function) => void) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        callback(key, obj[key]);
      }
    }
  }

  // Function to wrap each request (assuming wrapRequest provides promise handling or similar)
  function wrapRequest(fnref: Function, sig: string) {
    return (...args: any[]) => {
      try {
        return fnref.apply(null, args);
      } catch (error) {
        console.error(`Error in ${sig}:`, error);
        throw error;
      }
    };
  }

  // Iterate over the internal API object and construct the Public API
  safeIterate(internal, function (sig: string, fnref: Function) {
    names = sig.split('.');
    name = names[0];
    Public[name] = Public[name] || {};
    Public[name][names[1]] = wrapRequest(fnref, sig);
  });

  return Public;
})({
  'add.entry': entryMethods.put,
  'add.behavior': behaviorMethods.add,
  'clear.store': storeMethods.clear,
  'count.entries': entryMethods.count,
  'get.behaviors': behaviorMethods.get,
  'get.database': databaseMethods.get,
  'get.databases': databasesMethods.get,
  'get.store': storeMethods.get,
  'get.stores': storesMethods.get,
  'get.index': indexMethods.get,
  'get.indexes': indexesMethods.get,
  'get.entries': entryMethods.get,
  'get.entry': entryMethods.get,
  'remove.database': databaseMethods.remove,
  'remove.entries': entryMethods.remove,
  'remove.index': indexMethods.remove,
  'remove.entry': entryMethods.remove,
  'remove.store': storeMethods.remove,
  'update.entries': entryMethods.update,
  'update.entry': entryMethods.put,
  '$$': behaviorMethods.process
});

// Export the dash library
export default dash;