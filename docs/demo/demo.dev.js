var IMDBSystem = (function(THREE){
        
        var render = (function(sys, sce, cam, rend) {
            console.log('render start',sys, sce, cam, rend);
            render = function() {
                var step = .01;
                if(sys) {
                    sys.rotation.x += step;
                    sys.rotation.z += step;
                    console.log('step',sys.rotation);
                } else {
                    console.log('emtpy',sys);
                }
                /* 60fps goodness */
                requestAnimationFrame(render);
                /* WebGL render */
                rend.render(sce, cam);
            };
            return render;
        });

        return function(node, width, height) {
            var scene = new THREE.Scene(),
                camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000),
                /* What the viewer sees */
                scene,
                /* How the viewer sees it */
                camera,
                /* WebGL vs. Canvas renderer */
                webGLRenderer = new THREE.WebGLRenderer(),
                /* What we'll create: a particle system */
                system,
                /* The bread and butter: the setup for init or when properties change. */
                layout = function(system, camera, scene, renderer, width, height) {
                    var range = ( width > height ) ? height : width,
                        geometry = new THREE.Geometry(),
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
                                    /* super-clever algo via http://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/ */
                                    /* m = "fraction of radius for inset" */
                                    for ( x = 0; x < points; x += 1) {
                                        ctx.rotate(Math.PI / points);
                                        ctx.lineTo(0, (0 - (radius * m)));
                                        ctx.rotate(Math.PI / points);
                                        ctx.lineTo(0, 0 - radius);
                                    }
                                    ctx.fillStyle = 'black';
                                    ctx.fill();
                                    ctx.stroke();
                                    ctx.restore();
                                    return canvas;
                                }(256, 256, 128, 128, 64, 5, .5)));
                                texture.needsUpdate = true;
                                return texture;
                            }())
                        }),
                        //material = new THREE.ParticleBasicMaterial({size: 4, vertexColors: true, color: 0xFFFF00}),
                        finish = function(sys, cam, sce, rend) {
                            return function(context) {
                                console.log('Added particles', context.entries.length, geometry, material);
                                sys = new THREE.ParticleSystem(geometry, material);
                                render = render(sys, sce, cam, rend);
                                sys.sortParticles = true;
                                sys.name = "imdb-particles"; //arbitrary
                                if (sce) {
                                    sce.add(sys);
                                }
                            };
                        }(system, camera, scene, renderer);

                    dash.get.entries({
                        database: 'dash-demo',
                        store: 'imdb',
                        key: 'id'
                    })
                    (function(context) {
                        finish(context);
                    }, function(context) {
                        console.log('dash error',context);
                    }, function(context) {
                        geometry.vertices.push(new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2));
                    });

                },
                /* When properties change we'll need a re-layout */
                relayout = function () {
                    console.log('relaying out');
                    if (scene.getObjectByName("particles")) {
                        scene.remove(scene.getObjectByName("particles"));
                    }
                    layout();
                };
            webGLRenderer.setClearColor(0xFFFFFF, 1.0);
            webGLRenderer.setSize(width, height);
            node.appendChild(webGLRenderer.domElement);
            camera.position.x = 20;
            camera.position.y = 0;
            camera.position.z = 150;
            layout(system, camera, scene, webGLRenderer, width, height);
            render(system, camera, scene, webGLRenderer, width, height);
            return relayout;
        };
}(window.THREE));
