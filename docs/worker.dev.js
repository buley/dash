importScripts('/lib/dash.dev.js');
self.addEventListener('message', function(e) {
  var input = e.data,
      output = { start: new Date().getTime(), context: input, dashq: typeof dash },
      method = input.method.split('.'),
      x = 0,
      xlen = method.length, curr = dash, thou = self;
  for ( x = 0; x < xlen; x += 1 ) {
	if ( undefined !== dash[ method[ x ] ] ) {
		curr = curr[ method[ x ] ];
	}
  }
  var end = function(ctx) {
	output.context = ctx;
	output.end = new Date().getTime();
	output.lag = output.end - output.start;
	thou.postMessage(output);
  };
  curr( input.context )(
	function(context) {
		output.type = 'success';
		end(context);	
	}, function(context) {
		output.type = 'error';
		end(context);	
	}, function(context) {
		output.type = 'notify';
		end(context);	
	},
  );
}, false);
