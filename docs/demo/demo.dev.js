var IMDBSystem = (function(THREE){        
        var last_intersected,
            ran_once = false,
	    node_width = null,
            node_height = null,
            canvasStarProgram = function(ctx) {
                var height = 20, width = 20, center_x = 10, center_y = 10, radius = 7, points = 5, m = .5;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
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
                // super-clever algo via http://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/ 
                // m = "fraction of radius for inset" 
                for ( x = 0; x < points; x += 1) {
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, (0 - (radius * m)));
                    ctx.rotate(Math.PI / points);
                    ctx.lineTo(0, 0 - radius);
                }
                ctx.fillStyle = 'transaprent';
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
                var step = .0005;
                if(system) {
                    //system.rotation.y += step;
                    //system.rotation.x += step;
                    //system.rotation.z += step;
                }
                /* 60fps goodness */
                requestAnimationFrame(render);
                stats.update();
		controls.update();
                camera.updateMatrixWorld();
                var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
                projector.unprojectVector( vector, camera );
                var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
                var intersects = raycaster.intersectObjects( scene.children );
                var INTERSECTED;
                if ( intersects.length > 0 ) {
                    if ( INTERSECTED != intersects[ 0 ].object ) {
                        if ( INTERSECTED ) INTERSECTED.material.program = canvasStarProgram;
                        INTERSECTED = intersects[ 0 ].object;
                        INTERSECTED.material.program = canvasFilledStarProgram;
                    }
                } else {
                    if ( INTERSECTED ) INTERSECTED.material.program = canvasStarProgram;
                    INTERSECTED = null;
                }
                if (INTERSECTED && INTERSECTED.id !== last_intersected) {
                    last_intersected = INTERSECTED.id;
		    console.log("INSERSECT",INTERSECTED);
                }
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
            renderer = new THREE.CanvasRenderer(),
            //renderer = new THREE.WebGLRenderer(),
            /* What we'll create: a particle system */
            system,
            range,
	    stats,
            //geometry = new THREE.Geometry(),
	    geometry = new THREE.SphereGeometry(2), 
            material = new THREE.ParticleBasicMaterial({
                size: 8,
                color: 0xFFFFFF,
                transparent: true,
                opacity: .6,
                sizeAttenuation: true,
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
                        ctx.fillStyle = '#C3CBC1';
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
			console.log('canvas',canvas,ctx);
                        return canvas;
                    }(256, 256, 128, 128, 64, 7, .5)));
                    texture.needsUpdate = true;
                    return texture;
                }())
            }),
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
                    //system = new THREE.ParticleSystem(geometry, material);
                    //system.sortParticles = true;
                    //system.name = "dash-demo";
                    //scene.add(system);
		    console.log('system',system,scene);
                }, function(context) {
                    console.log('dash error',context);
                }, function(context) {


		    //var particle = new THREE.Sprite( material );
		    var particle = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programStroke } ) );
		    particle.position = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
		    scene.add( particle );
                    //geometry.vertices.push(new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2));
                });

            },
            /* When properties change we'll need a re-layout */
            relayout = function () {
		console.log('relayout');
                if (scene.getObjectByName("particles")) {
                    scene.remove(scene.getObjectByName("particles"));
                }
                layout();
            },
            onMouseMove = function(event) {
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
            range = ( width > height ) ? height : width;
            renderer.setClearColor(0x000000, 1.0);
            renderer.setSize(width, height);
            node_width = width;
            node_height = height;
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
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
            node.appendChild(renderer.domElement);
	    if (stats) {
            	document.getElementsByTagName('body')[0].appendChild( stats.domElement );
            }
            camera.position.set( 0, 300, 500 );
            render();
            return relayout;
        };
}(window.THREE));
