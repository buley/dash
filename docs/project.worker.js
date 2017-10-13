if (self) {
  importScripts('/dist/dash.js');
  self.addEventListener('message', function(e) {
	  var input = e.data;
          self.postMessage(input);
  }, false);
}
