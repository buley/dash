var IMDBSystem = (function(THREE){
        
        var render = function() {
                var step = .0005;
                if(system) {
                    system.rotation.y += step;
                    //system.rotation.x += step;
                    //system.rotation.z += step;
                }
                /* 60fps goodness */
                requestAnimationFrame(render);
                /* WebGL render */
                renderer.render(scene, camera);
            },
            finish = function(context) {
                system = new THREE.ParticleSystem(geometry, material);
                system.sortParticles = true;
                console.log('dash context',context.entries ? context.entries.length : NaN);
                system.name = "imdb-particles"; //arbitrary
                if (scene) {
                    scene.add(system);
                }
            },
            scene = new THREE.Scene(),
            camera,
            /* What the viewer sees */
            scene,
            /* How the viewer sees it */
            camera,
            /* WebGL vs. Canvas renderer */
            renderer = new THREE.WebGLRenderer(),
            /* What we'll create: a particle system */
            system,
            range,
            geometry = new THREE.Geometry(),
            material = new THREE.ParticleBasicMaterial({size: 3, vertexColors: false, color: 0xffffff});
            /*material = new THREE.ParticleBasicMaterial({
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
                        points = Math.floor( Math.random() * 100 ) % 15;
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
                        return canvas;
                    }(256, 256, 128, 128, 64, 7, .5)));
                    texture.needsUpdate = true;
                    return texture;
                }())
            }),*/
            layout = function(system, camera, scene, renderer, width, height) {

                dash.get.entries({
                    database: 'dash-demo',
                    store: 'imdb',
                    key: 'id',
                    store_key_path: null,
                    auto_increment: true
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

        return function(node, width, height) {
            range = ( width > height ) ? height : width;
            renderer.setClearColor(0x000000, 1.0);
            renderer.setSize(width, height);
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            node.appendChild(renderer.domElement);
            camera.position.x = 20;
            camera.position.y = 0;
            camera.position.z = 150;
            console.log('init once');
            render(system, camera, scene, renderer, width, height);
            return relayout;
        };
}(window.THREE));
