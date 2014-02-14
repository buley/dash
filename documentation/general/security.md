IDB is typically available in both the main `window` and in Web Workers thanks to an abstracted [`IDBEnvironment`](https://developer.mozilla.org/en-US/docs/Web/API/IDBEnvironment) interface. It is restricted to a given [`origin`](http://www.w3.org/TR/IndexedDB/#dfn-origin), and
[`same-origin`](http://www.w3.org/TR/IndexedDB/#dfn-same-origin) security restrictions apply. 

Most browsers will ask a user's permission before allowing IDB to store data locally. Although the specification does not specify a size limit, some browsers enforce one.

Firefox has no size limit but will ask permission before storing data larger than 50 megabytes. It exposes "quota" information via the `dom.indexedDB.warningQuota` factory attribute for the programmer to judge utilization.

Chrome automatically grants "[`temporary`](https://developers.google.com/chrome/whitepapers/storage#temporary)" storage to IDB and allocates a maximum of 20% of its "shared storage pool". Chrome also allows a "[`persistent`](https://developers.google.com/chrome/whitepapers/storage#persistent)" storage mode that asks the user to authorize a host for offline storage but enforces no size limitations other than user disk space.

IE allows IDB up to 250 megabytes of space and provides the [`window.indexedDB.remainingSpace`](http://msdn.microsoft.com/en-us/library/windows/apps/cc197016.aspx) factory attribute for the programmer to judge utilization.
