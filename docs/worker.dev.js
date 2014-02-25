self.addEventListener('message', function(e) {
  var input = e.data,
      output = { start: new Date().getTime(), data: input };
  setTimeout(function() {
    output.end = new Date().getTime();
    output.lag = output.end - output.start;
    self.postMessage(output);
  }, Math.floor(Math.random() * 10000));
}, false);
