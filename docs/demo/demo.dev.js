var IMDBSystem = (function(THREE){        
        var last_intersected,
	    last_chosen,
	    on_data,
	    starttime,
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
            },
	    canvasFilledStarProgram = function(ctx) {
                var height = 20, width = 20, center_x = 10, center_y = 10, radius = 7, points = 5, m = .5;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = '#00ff00';
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
                ctx.fillStyle = '#00ff00';
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                return ctx;
            },

            ran_once = false,
	    hasStarted = false,
	    node_width = null,
            node_height = null,
	    INTERSECTED = null,
	    CHOSEN = null,
            render = function() {
		//console.log(camera.position.x,camera.position.y,camera.position.z);
                /* 60fps goodness */
                requestAnimationFrame(render);
                stats.update();
		//controls.update( new Date().getTime() - starttime );
		camera.updateMatrixWorld();
		//var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0 ),
			notime = true; //e.g. 20ms hover
		projector.unprojectVector( vector, camera );
 		raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		console.log('checking',mouse.x,mouse.y);
		var intersects = raycaster.intersectObjects( scene.children );
		if ( intersects.length > 0 ) {
		    if ( INTERSECTED != intersects[ 0 ].object ) {
			//if ( INTERSECTED ) INTERSECTED.material.program = canvasFilledStarProgram;
			INTERSECTED = intersects[ 0 ].object;
		    }
		} else {
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
				if (notime || (new Date().getTime() - INTERSECTED.start) > 20) {
					if (!!last_chosen) {
						if (last_chosen.id === INTERSECTED.id) {
							return;
						}
					    //last_chosen.material.color = new THREE.Color( 0x333333 );
					    //last_chosen.material.needsUpdate = true;

					}
					last_chosen = CHOSEN;
				    CHOSEN = INTERSECTED;
				    console.log("CHOSEN", last_chosen, CHOSEN);
				    if ( 'function' === typeof on_data ) {
					on_data.apply(on_data, [ CHOSEN.name ] );
				    }
				    //INTERSECTED.material.color = new THREE.Color( 0x336699 );
				    //INTERSECTED.material.needsUpdate = true;
				}
			}
		}
                /* WebGL render */
                renderer.render(scene, camera);

            },
            scene = new THREE.Scene(),
            camera,
	    raycaster,
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
            range,
	    stats,
	    geometry = new THREE.PlaneGeometry(64, 64),
	    spheregeometry = new THREE.SphereGeometry(6, 6, 6),
            spherematerial = new THREE.MeshBasicMaterial({color: '#FFFFFF', sizeAttenuation: true }),
	    material = new THREE.MeshBasicMaterial({
                size: 128,
		overdraw: true,
                color: 0xFFFFFF,
                transparent: true,
                opacity: .7,
                sizeAttenuation: true,
		side: THREE.DoubleSide,
                map: (function () {
                    var texture = new THREE.Texture( (function(height, width, center_x, center_y, radius, points, m, canvas, ctx ) {
                        var x;
                        if (!canvas || !ctx) {
                            if (!canvas) {
                                canvas = document.createElement('canvas');
                            }
                            if (!ctx) {
                                ctx = canvas.getContext('2d');
                            }
                            canvas.height = height;
                            canvas.width = width;
                        }
                        ctx.save();
                        ctx.beginPath();
                        ctx.translate(center_x, center_y);
                        ctx.moveTo(0, (0 - radius));
                        // super-clever algo via http://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/ 
                        // m = "fraction of radius for inset" 
                        for ( x = 0; x < points; x += 1) {
                            ctx.rotate(Math.PI / points);
                            ctx.lineTo(0, (0 - (radius * m)));
                            ctx.rotate(Math.PI / points);
                            ctx.lineTo(0, 0 - radius);
                        }
                        ctx.fillStyle = '#d5d5d5';
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
			console.log('canvas',canvas,ctx);
                        return canvas;
                    }(256, 256, 128, 128, 64, 7, .5)));
		    texture.side = THREE.DoubleSide;
                    texture.needsUpdate = true;
                    return texture;
                }())
            }),
            mouse = { x: 0, y: 0 },
            /* When properties change we'll need a re-layout */
            onMouseMove = function(event) {
		hasStarted = true;
                //event.preventDefault();
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
	return function(node, width, height, cb) {
		    range = ( ( width > height ) ? height : width ) * 10;
		    renderer.setClearColor(0x111111, 1.0);
		    renderer.setSize(width, height);
		    node_width = width;
		    node_height = height;

			node.addEventListener( 'mousemove', onMouseMove, false );
			node.addEventListener( 'resize', onResize, false );


		    on_data = cb;
		    camera = new THREE.PerspectiveCamera(45, width / height, 1, range * 10);
		    geometry.doubleSided = true;
		    //camera.position.set( new THREE.Vector3(100000, 0, 0) );
		    camera.position.set( 0, 0, range + 10000 );
 	      	    camera.lookAt(scene.position);
		    //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 500, 1000 );
			//Start pointer lock

			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if ( havePointerLock ) {

				var pointerlockchange = function ( event ) {
					console.log('lock change',event);

					if ( document.pointerLockElement === node || document.mozPointerLockElement === node || document.webkitPointerLockElement === node ) {

						controls.enabled = true;

					} else {

						controls.enabled = false;
					}
				}

				var pointerlockerror = function ( event ) {
					console.log('pointer error',event);
				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				node.addEventListener( 'click', function ( event ) {

					// Ask the browser to lock the pointer
					node.requestPointerLock = node.requestPointerLock || node.mozRequestPointerLock || node.webkitRequestPointerLock;

					if ( /Firefox/i.test( navigator.userAgent ) ) {

						var fullscreenchange = function ( event ) {

							if ( document.fullscreenElement === node || document.mozFullscreenElement === node || document.mozFullScreenElement === node ) {

								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

								node.requestPointerLock();
							}

						}

						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

						node.requestFullscreen = node.requestFullscreen || node.mozRequestFullscreen || node.mozRequestFullScreen || node.webkitRequestFullscreen;

						node.requestFullscreen();

					} else {

						node.requestPointerLock();

					}

				}, false );

			} else {

				node.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

			}

	                        starttime = new Date().getTime();
				controls = new THREE.PointerLockControls( camera );
				//scene.add( controls.getObject() );


			//End pointer lock

		    //controls.addEventListener( 'change', relayout );
		    light = new THREE.DirectionalLight( 0xD5D5D5 );
		    light.position.set( 1, 1, 1 );
		    //scene.add( light );

		    light = new THREE.DirectionalLight( 0xCCCCCC );
		    light.position.set( -1, -1, -1 );
		    //scene.add( light );

		    light = new THREE.AmbientLight( 0xD5D5D5 );
		    scene.add( light );
	            var bounding = new THREE.CubeGeometry( range, range, range, 8,8,8 ),
			bounding_material = new THREE.MeshBasicMaterial( {color: 0x333333, wireframe: true, transparent: true, opacity: .1 } ),
			cube = new THREE.Mesh( bounding, bounding_material );
		    scene.add(cube);
	            var bounding = new THREE.CubeGeometry( range + 100, range + 100, range + 100, 2, 2, 2 ),
			bounding_material = new THREE.MeshBasicMaterial( {color: 0x222222, wireframe: true, transparent: true, opacity: .5 } );
			cube = new THREE.Mesh( bounding, bounding_material );
		    scene.add(cube);


		    node.appendChild(renderer.domElement);
		    if (stats) {
			document.getElementsByTagName('body')[0].appendChild( stats.domElement );
		    }
		    render();
		    return {
			clear: function() {
			},
			add: function(context) {
			    var particle = new THREE.Mesh( geometry, material ); 
			    particle.name = context.id;
			    particle.position = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
		            particle.rotation.z = Math.random();
		            particle.rotation.y = Math.random();
		            particle.rotation.x = Math.random();
			    //var sphere = new THREE.Mesh( spheregeometry, spherematerial ); 
			    //sphere.position = particle.position;
			    //sphere.name = context.id;
			    //scene.add( sphere );
			    scene.add( particle );

			},
			layout: function() {

			},
			camera: function(x,y,z) {
				camera.position.x = x || camera.position.x;
				camera.position.y = y || camera.position.y;
				camera.position.z = z || camera.position.z;
			},
			cameraMod: function(type, val, max, min) {
				camera.position[ type ] += val;
				if ( camera.position[ type ] > max ) {
					camera.position[ type ] = max;
				}
				if ( camera.position[ type ] < min ) {
					camera.position[ type ] = min;
				}
			},
			zoom: function(val) {
				camera.translateZ(val);
			},
		    };
	}
}(window.THREE));
