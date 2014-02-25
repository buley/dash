if (self) {
  importScripts('/lib/dash.dev.js');
  self.addEventListener('message', function(e) {
	  var input = e.data;
          self.postMessage(input);
  }, false);
}
