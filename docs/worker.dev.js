importScripts('/lib/dash.dev.js');
self.addEventListener('message', function(e) {
  var input = e.data,
      output = { start: new Date().getTime(), context: input, dashq: typeof dash },
      method = input.method.split('.'),
      x = 0,
      xlen = method.length, curr = dash, thou = self, error = false;
  for ( x = 0; x < xlen; x += 1 ) {
	if ( undefined !== dash[ method[ x ] ] ) {
		curr = curr[ method[ x ] ];
	} else { 
		error = true;
	}
  }
  var end = function(ctx) {
	output.context = ctx;
	output.end = new Date().getTime();
	output.lag = output.end - output.start;
	thou.postMessage(output);
  };
  if ( error ) {
        output.type = 'error';
 	end(null);
  } else { 
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
		}
	  );
  } 
}, false);
