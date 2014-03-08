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
            directionVector = new THREE.Vector3(),
	    INTERSECTED = null,
	    start_time = new Date().getTime(),
	    CHOSEN = null,
            render = function() {
		//console.log(camera.position.x,camera.position.y,camera.position.z);
                /* 60fps goodness */
                requestAnimationFrame(render);
		if ( camera.position.z > ( range * 20 ) ) {
			camera.position.z = range * 20;
		}
		if ( camera.position.x < 1 ) {
			camera.position.x = 1;
		}
		if ( camera.position.y < 1 ) {
			camera.position.y = 1;
		}
		controls.update( new Date().getTime() - start_time );
		//var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		notime = true; //e.g. 20ms hover
                renderer.render(scene, camera);

            },
            scene = new THREE.Scene(),
            camera,
	    raycaster = new THREE.Raycaster(),
            direction1,
	    direction2,
            mouse = { x: 0, y: 0 },
	    controls,
            pointerlockctls,
            ambient,
            cube1,
            cube2,
            /* What the viewer sees */
            scene,
            /* How the viewer sees it */
            camera,
            projector = new THREE.Projector(),
            /* WebGL vs. Canvas renderer */
            renderer = new THREE.CanvasRenderer(),
            //renderer = new THREE.WebGLRenderer(),
            /* What we'll create: a particle system */
            range,
	    geometry = new THREE.PlaneGeometry(16, 16),
	    spheregeometry = new THREE.SphereGeometry(6, 6, 6),
            spherematerial = new THREE.MeshBasicMaterial({color: '#FFFFFF', sizeAttenuation: true }),
	    material = new THREE.MeshBasicMaterial({
                size: 32,
		overdraw: true,
                color: 0x555555,
                transparent: true,
                opacity: 1,
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
                        return canvas;
                    }(256, 256, 128, 128, 64, 7, .5)));
		    texture.side = THREE.DoubleSide;
                    texture.needsUpdate = true;
                    return texture;
                }())
            }),
            /* When properties change we'll need a re-layout */
            onMouseMove = function(event) {
		hasStarted = true;
                //event.preventDefault();
                mouse.x = ( event.clientX / node_width ) * 2 - 1;
                mouse.y = - ( event.clientY / node_height ) * 2 + 1;
		directionVector.set(mouse.x, mouse.y, 1);
		camera.updateMatrixWorld();
                camera.updateProjectionMatrix();
                projector.unprojectVector( directionVector, camera);
		directionVector.sub(camera.position);
                directionVector.normalize();
		raycaster.ray.origin.copy( camera.position );
                raycaster.set(camera.position, directionVector);
		var intersects = raycaster.intersectObjects( scene.children, true ), obj;
		if ( intersects.length > 0 ) {
			if ( 1 === intersects.length ) {
				obj = intersects[ 0 ]; 

			} else {
				var inc = 0;
				obj =  intersects[ inc ].object;
				while( ( !obj || !!obj.object || "" === obj.name ) && !!intersects[ inc + 1 ] ) {
					inc += 1;
					obj = intersects[ inc ].object; 
				}
				if ( !obj || "" === obj.name || !!obj.object ) {
					obj = null;
				}
			}

		    if ( !!obj && INTERSECTED != obj && !obj.object) {
			//if ( INTERSECTED ) INTERSECTED.material.program = canvasFilledStarProgram;
			INTERSECTED = obj;
		    } else {
			INTERSECTED = null;
		    }
		}
		if ( INTERSECTED ) { //&& (!last_intersected || INTERSECTED && INTERSECTED.id !== last_intersected.id)) {
		    INTERSECTED.start = new Date().getTime();
			if (!!last_intersected) {
			    delete last_intersected.start;
			}
			if (notime || (new Date().getTime() - INTERSECTED.start) > 20) {
				if (!!last_chosen) {
					if (last_chosen.id === INTERSECTED.id) {
						return;
					}
				    //last_chosen.material.color = new THREE.Color( 0x333333 );
				    //last_chosen.material.needsUpdate = true;
				}
				last_chosen = INTERSECTED;
			    if ( 'function' === typeof on_data && !!INTERSECTED.name ) {
				on_data.apply(on_data, [ INTERSECTED.name ] );
			    }
			    //INTERSECTED.material.color = new THREE.Color( 0x336699 );
			    //INTERSECTED.material.needsUpdate = true;
			}
		} else if ( !!last_chosen ) {
			    if ( 'function' === typeof on_data ) {
				on_data.apply(on_data, [ null ] );
			    }
			last_chosen = null;
		}
                /* WebGL render */

            },
            onResize = function(event) {
                camera.aspect = node_width / node_height;
                camera.updateProjectionMatrix();
                renderer.setSize( node_width, node_height );
            };
	return function(node, width, height, cb) {
		    range = ( ( width > height ) ? height : width );
		    renderer.setClearColor(0x111111, 1.0);
		    renderer.setSize(width, height);
		    node_width = width;
		    node_height = height;

		    node.addEventListener( 'mousemove', onMouseMove, false );
		    window.addEventListener( 'resize', onResize, false );

		    on_data = cb;
		    camera = new THREE.PerspectiveCamera(45, width / height, 1, range * 20);
		    geometry.doubleSided = true;
		    //camera.position.set( new THREE.Vector3(100000, 0, 0) );
		    camera.position.set( 0, 0, range - 1  );
 	      	    //camera.lookAt(scene.position);
		    //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 500, 1000 );
			//Start pointer lock

			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document, is_locked = false;

			if ( havePointerLock ) {


				var pointerlockchange = function ( event ) {

					if ( document.pointerLockElement === node || document.mozPointerLockElement === node || document.webkitPointerLockElement === node ) {

						controls.enabled = false;
						pointerlockctls.enabled = true;
						is_locked = true;

					} else {

						pointerlockctls.enabled = false;
						controls.enabled = true;
						is_locked = false;
					}
				}

				var pointerlockerror = function ( event ) {
					pointerlockctls.enabled = false;
					controls.enabled = true;
					is_locked = false;
				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				window.addEventListener( 'keyup', function ( event ) {
					if ( 32 === event.keyCode ) {
						if ( true === is_locked ) {
							document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
							document.exitPointerLock();
							controls.enabled = true;
							return;
						}
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
					}

				}, false );

			} else {
				//TODO: No API
			}
	                        starttime = new Date().getTime();
				controls = new THREE.TrackballControls( camera );
				pointerlockctls = new THREE.PointerLockControls( camera );
				scene.add( controls );
				scene.add( pointerlockctls.getObject() );


			//End pointer lock

		    //controls.addEventListener( 'change', relayout );
		    direction1 = new THREE.DirectionalLight( 0xD5D5D5 );
		    direction1.position.set( 1, 1, 1 );
		    //scene.add( light );

		    direction2 = new THREE.DirectionalLight( 0xCCCCCC );
		    direction2.position.set( -1, -1, -1 );
		    //scene.add( light );

		    light = new THREE.AmbientLight( 0xD5D5D5 );
		    scene.add( light );
	            bounding1 = new THREE.CubeGeometry( range, range, range, 8,8,8 );
		    bounding_material1 = new THREE.MeshBasicMaterial( {color: 0x333333, wireframe: true, transparent: true, opacity: .1 } ),
		    cube1 = new THREE.Mesh( bounding1, bounding_material1 );
		    scene.add(cube1);
	            bounding2 = new THREE.CubeGeometry( range + 100, range + 100, range + 100, 2, 2, 2 );
		    bounding_material2 = new THREE.MeshBasicMaterial( {color: 0x222222, wireframe: true, transparent: true, opacity: .5 } );
		    cube2 = new THREE.Mesh( bounding2, bounding_material2 );
		    scene.add(cube2);

		    node.appendChild(renderer.domElement);
		    render();
			var highlighted = [];
		    return {
			clear: function() {
			},
			add: function(context) {
			    var particle = new THREE.Mesh( geometry, material ); 
			    particle.name = context.id;
			    particle.position = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
		            particle.rotation.z = Math.random() % (Math.PI * 2);
		            particle.rotation.y = Math.random() % (Math.PI * 2);
		            particle.rotation.x = Math.random() % (Math.PI * 2);
			    var sphere = new THREE.Mesh( spheregeometry, spherematerial ); 
			    sphere.position = particle.position;
		            sphere.position.x += 1;
		            sphere.position.y += 1;
		            sphere.position.z += 1;
			    sphere.name = 'sphere-' + context.id;
			    scene.add( sphere );
			    scene.add( particle );

			},
			remove: function(context) {
			    var key = context.primary_key,
				particle = scene.getObjectByName( key );
		            if ( particle ) { 
			    	scene.remove( particle );
			    }
			},
			layout: function() {

			},
			controls: function(enabled) {
				controls.enabled = enabled;
			},
			reset: function() {
				var x = 0, xlen = scene.children.length, xitem;
				for ( x = xlen; x >= 0; x -= 1 ) {
					xitem = scene.children[x];
					if(!!xitem && xitem !== camera && xitem !== controls && xitem !== pointerlockctls && xitem !== cube1 && xitem !== cube2) {
						scene.remove(xitem);
					}
				}

			},
			highlight: function(context) {
			    var key = context.primary_key || context.key || context.entry.id,
				particle = scene.getObjectByName( key );
				if ( particle ) {
					particle.material.color = '#00ff00';
					highlighted.push(context);
				}
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
