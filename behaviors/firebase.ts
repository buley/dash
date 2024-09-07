/**
 * @summary
 * `dashFirebase` handles interactions with Firebase Realtime Database, including setting, updating, and removing entries.
 * 
 * The main features include:
 * 1. **Set**: Adds or overwrites data at a specific reference.
 * 2. **Update**: Updates specific fields of an entry.
 * 3. **Remove**: Deletes data at a specific reference.
 * 4. **Child Reference**: Retrieves a child reference.
 * 
 * This system works in both a browser and worker environment, with support for Firebase Realtime Database.
 */

import { getDatabase, ref, set, update, remove } from "@firebase/database"; // Updated Firebase imports

interface FirebaseContext {
  firebase: string;
  database: string;
  store: string;
  primary_key: string;
  entry?: any;
  method?: string;
  params?: any;
}

const dashFirebase = (function (environment: any) {
  "use strict";

  let that: any;

  /**
   * Retrieves a child reference (updated to use modern Firebase Realtime Database API).
   * @param context - The Firebase context object.
   */
  const child = function (context: FirebaseContext) {
    const deferred = that.deferred();
    context.method = "child";
    return deferred.promise;
  };

  /**
   * Sets data at the specified Firebase reference.
   * @param context - The Firebase context containing the data to set.
   */
  const setEntry = function (context: FirebaseContext) {
    const deferred = that.deferred();
    const db = getDatabase();
    const dbRef = ref(db, `${context.firebase}/${context.database}/${context.store}/${context.primary_key}`);

    context.method = "set";
    set(dbRef, context.entry)
      .then(() => deferred.resolve(context.entry))
      .catch((err) => deferred.reject(err));

    return deferred.promise;
  };

  /**
   * Updates specific fields at the Firebase reference.
   * @param context - The Firebase context with the fields to update.
   */
  const updateEntry = function (context: FirebaseContext) {
    const deferred = that.deferred();
    const db = getDatabase();
    const dbRef = ref(db, `${context.firebase}/${context.database}/${context.store}/${context.primary_key}`);

    context.method = "update";
    update(dbRef, context.entry)
      .then(() => deferred.resolve(context.entry))
      .catch((err) => deferred.reject(err));

    return deferred.promise;
  };

  /**
   * Removes data at the Firebase reference.
   * @param context - The Firebase context for the entry to be removed.
   */
  const removeEntry = function (context: FirebaseContext) {
    const deferred = that.deferred();
    const db = getDatabase();
    const dbRef = ref(db, `${context.firebase}/${context.database}/${context.store}/${context.primary_key}`);

    context.method = "remove";
    remove(dbRef)
      .then(() => deferred.resolve(context.entry))
      .catch((err) => deferred.reject(err));

    return deferred.promise;
  };

  /**
   * Determines the correct Firebase method based on the given signature.
   * @param signature - The signature of the method (e.g., 'get.entry', 'remove.entry').
   */
  const whichMethod = function (signature: string) {
    if (that.contains(['get.entry', 'get.entries', 'get.index', 'get.database', 'get.store'], signature)) {
      return "child";
    } else if (that.contains(['remove.entry', 'remove.entries', 'remove.index', 'remove.database', 'remove.store'], signature)) {
      return "remove";
    } else if (that.contains(['add.entry'], signature)) {
      return "set";
    } else if (that.contains(['update.entry', 'update.entries'], signature)) {
      return "update";
    } else {
      return null;
    }
  };

  // Additional worker-related logic (unchanged but modernized)
  const workQueue: { [key: string]: any } = {};
  let firebases: { [key: string]: any } = {};

  if (true === !!environment.WorkerGlobalScope) {
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js');

    environment.addEventListener(
      "message",
      (e: MessageEvent) => {
        const input = e.data;
        const context = input.context;
        const method = input.method;

        if (!firebases[input.context.firebase]) {
          firebases[input.context.firebase] = getDatabase();
        }

        if (method === "set") {
          setEntry(context);
        } else if (method === "child") {
          child(context);
        } else if (method === "update") {
          updateEntry(context);
        } else if (method === "remove") {
          removeEntry(context);
        } else {
          environment.postMessage({ type: "error", error: "No such method" });
        }
      },
      false
    );
  } else {
    return [
      function (state: any) {
        that = this;
        if (!state.context.firebase || state.context.firebaseing) return state;
        state.context.firebaseid = this.random();
        firebases[state.context.firebaseid] = { url: state.context.url, params: state.context.params || null };
        delete state.context.url;
        delete state.context.params;
        return state;
      },
      function (state: any) {
        if (!state.context.firebase || state.context.firebaseing) return state;

        const promise = state.promise;
        const outward = this.deferred();
        let args = firebases[state.context.firebaseid];

        if (this.contains(["add.entry", "update.entry", "update.entries", "remove.entry", "remove.entries"], state.method)) {
          promise((ste: any) => {
            outward.resolve(ste);
          });
        }

        return state;
      },
    ];
  }
})(self);

export { dashFirebase };
export default dashFirebase;
