if (self) {
  importScripts('/lib/dash.dev.js');
  self.addEventListener('message', function(e) {
	  var input = e.data,
	      method = input.dash.split('.'),
	      verb = method[ 0 ],
              noun = method[ 1 ],
	      thou = self;
	  var end = function(ctx) {
		input.context = ctx;
		thou.postMessage(input);
	  };
          if ( undefined !== dash[ verb ] && undefined !== dash[ verb ][ noun ] ) {
		  dash[ verb ][ noun ]( input.context )(
			function(context) {
				input.type = 'success';
				end(context);	
			}, function(context) {
				input.type = 'error';
				end(context);	
			}, function(context) {
				input.type = 'notify';
				end(context);	
			}
		  );
	} else {
		input.type = 'error';
		end( { error: 'No such method' } );
	}
  }, false);
}
