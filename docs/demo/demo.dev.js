var IMDBSystem = (function(THREE){        
        var last_intersected,
	    last_chosen,
            ran_once = false,
	    hasStarted = false,
	    node_width = null,
            node_height = null,
            canvasStarProgram = function(ctx) {
                var height = 20, width = 20, center_x = 10, center_y = 10, radius = 7, points = 5, m = .5;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = '#ffffff';
                //ctx.translate(center_x, center_y);
                ctx.moveTo(0, (0 - radius));
                //points = Math.floor( Math.random() * 100 ) % 15;
                // super-clever algo via http://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/ 
                // m = "fraction of radius for inset" 
                for ( x = 0; x < points; x += 1) {
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, (0 - (radius * m)));
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, 0 - radius);
                }
                ctx.fillStyle = 'transparent';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                return ctx;
            }, canvasFilledStarProgram = function(ctx) {
                var height = 20, width = 20, center_x = 10, center_y = 10, radius = 7, points = 5, m = .5;
                ctx.save();
                ctx.beginPath();
                //ctx.translate(center_x, center_y);
                ctx.moveTo(0, (0 - radius));
                points = Math.floor( Math.random() * 100 ) % 15;
                ctx.strokeStyle = '#FFFFFF';
                // super-clever algo via http://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/ 
                // m = "fraction of radius for inset" 
                for ( x = 0; x < points; x += 1) {
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, (0 - (radius * m)));
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, 0 - radius);
                }
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                return ctx;
            }, programFill = function ( ctx ) {
                ctx.beginPath();
                ctx.arc( 0, 0, 0.5, 0, PI2, true );
                ctx.fill();
            }, programStroke = function ( ctx ) {
                ctx.lineWidth = 0.025;
                ctx.beginPath();
                ctx.arc( 0, 0, 0.5, 0, Math.PI2, true );
                ctx.stroke();
            }, render = function() {
                var step = .05;
                if(camera) {
                    camera.position.y += step;
                    camera.position.x += step;
                    camera.position.z += step;
                }
                /* 60fps goodness */
                requestAnimationFrame(render);
                stats.update();
		controls.update();
		if (hasStarted) {
			camera.updateMatrixWorld();
			var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
			projector.unprojectVector( vector, camera );
			var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			var intersects = raycaster.intersectObjects( scene.children );
			var INTERSECTED = null, CHOSEN = null;
			if ( intersects.length > 0 ) {
			    if ( INTERSECTED != intersects[ 0 ].object ) {
				if ( INTERSECTED ) INTERSECTED.material.program = canvasStarProgram;
				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.material.color = 0xFFFFFF;
			    }
			} else {
			    if ( INTERSECTED ) INTERSECTED.material.program = canvasStarProgram;
			    INTERSECTED = null;
			}
			if ( INTERSECTED && (!last_intersected || INTERSECTED && INTERSECTED.id !== last_intersected.id)) {
			    INTERSECTED.start = new Date().getTime();
				if (!!last_intersected) {
				    delete last_intersected.start;
				}
			    last_intersected = INTERSECTED;
			} else if (INTERSECTED) {
				if (null === CHOSEN || INTERSECTED.id !== CHOSEN.id) {
					console.log(nulll === CHOSEN, INTERSECTED.id,'elapsed', new Date().getTime() - INTERSECTED.start);
					if ((new Date().getTime() - INTERSECTED.start) > 1000) {
						if (!!last_chosen) {
						    last_chosen.material.color = new THREE.Color( 0x333333 );
						    last_chosen.material.needsUpdate = true;
						}
						last_chosen = CHOSEN;
					    CHOSEN = INTERSECTED;
					    console.log("CHOSEN", CHOSEN);
					    INTERSECTED.material.color = new THREE.Color( 0x336699 );
					    INTERSECTED.material.needsUpdate = true;
					}
				}
			}
		}
	      	camera.lookAt(scene.position);
                /* WebGL render */
                renderer.render(scene, camera);

            },
            scene = new THREE.Scene(),
            camera,
	    controls,
            /* What the viewer sees */
            scene,
            /* How the viewer sees it */
            camera,
            projector = new THREE.Projector(),
            /* WebGL vs. Canvas renderer */
            //renderer = new THREE.CanvasRenderer(),
            renderer = new THREE.WebGLRenderer(),
            /* What we'll create: a particle system */
            system,
            range,
	    stats,
	    geometry = new THREE.SphereGeometry(3, 32, 32), 
            material = new THREE.MeshLambertMaterial({color: new THREE.Color( 0x333333 ), sizeAttenuation: true }),
            mouse = { x: 0, y: 0 },
            layout = function() {
                if (true === ran_once) {
                    return;
                }
                ran_once = true;
                dash.get.entries({
                    database: 'dash-demo',
                    store: 'imdb',
                    key: null,
                    store_key_path: null,
                    auto_increment: true
                })
                (function(context) {
		    console.log('system',system,scene);
		    hasStarted = true;
		    /*var x = 0,
			entries = context.entries,
			xlen = context.entries.length,
			xitem;
		    for ( x = 0; x < xlen; x += 1 ) {
		        xitem = context.entries[ x ];
                    }*/
                }, function(context) {
                    console.log('dash error',context);
                }, function(context) {
		    var particle = new THREE.Mesh( geometry, material ); 
		    particle.name = context.key;
                    particle.position = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
		    scene.add( particle );
                });
            },
            /* When properties change we'll need a re-layout */
            relayout = function () {
                if (scene.getObjectByName("particles")) {
                    scene.remove(scene.getObjectByName("particles"));
                }
                layout();
            },
            onMouseMove = function(event) {
		hasStarted = true;
                event.preventDefault();
                mouse.x = ( event.clientX / node_width ) * 2 - 1;
                mouse.y = - ( event.clientY / node_height ) * 2 + 1;
            },
            onResize = function(event) {
                camera.aspect = node_width / node_height;
                camera.updateProjectionMatrix();
                renderer.setSize( node_width, node_height );
            };
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'resize', onResize, false );

        return function(node, width, height) {
            range = ( ( width > height ) ? height : width ) * 10;
            renderer.setClearColor(0xFFFFFF, 1.0);
            renderer.setSize(width, height);
            node_width = width;
            node_height = height;
            camera = new THREE.PerspectiveCamera(45, width / height, 1, 500000);
	    //camera.position.set( new THREE.Vector3(100000, 0, 0) );
	    camera.position.set( 1, width/height, width/height );
	    //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 500, 1000 );
	    controls = new THREE.TrackballControls( camera );
	    controls.rotateSpeed = 1.0;
	    controls.zoomSpeed = 1.2;
	    controls.panSpeed = 0.8;
	    controls.noZoom = false;
	    controls.noPan = false;
	    controls.staticMoving = true;
	    controls.dynamicDampingFactor = 0.3;
	    controls.keys = [ 65, 83, 68 ];
	    controls.addEventListener( 'change', relayout );
	    /*light = new THREE.DirectionalLight( 0x000000 );
	    light.position.set( 1, 1, 1 );
	    scene.add( light );*/

	    /*light = new THREE.DirectionalLight( 0x111111 );
	    light.position.set( -1, -1, -1 );
	    scene.add( light );*/

	    /*light = new THREE.AmbientLight( 0x333333 );
	    scene.add( light );*/
            node.appendChild(renderer.domElement);
	    if (stats) {
            	document.getElementsByTagName('body')[0].appendChild( stats.domElement );
            }
            render();
            return relayout;
        };
}(window.THREE));
