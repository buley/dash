var IMDBSystem = (function(THREE){
    /* What the viewer sees */
    var scene,
        /* How the viewer sees it */
        camera,
        /* WebGL vs. Canvas renderer */
        webGLRenderer = new THREE.WebGLRenderer(),
        /* What we'll create: a particle system */
        system = { rotation: {} },
        /* Our looped render method */
        render = function() {
            var step = 0.01;
            system.rotation.x = step;
            system.rotation.z = step;
            /* 60fps goodness */
            requestAnimationFrame(render);
            /* WebGL render */
            webGLRenderer.render(scene, camera);
        },
        /* The bread and butter: the setup for init or when properties change. */
        layout = function() {
            console.log('laying out');
            var range = 50,
                geometry = new THREE.Geometry(),
                material = new THREE.ParticleBasicMaterial({
                    size: 32,
                    color: 0x000000,
                    transparent: true,
                    opacity: .8,
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
                        }(32, 32, 16, 16, 90, 5, .5)));
                        texture.needsUpdate = true;
                        return texture;
                    }())
                }),
                //material = new THREE.ParticleBasicMaterial({size: 4, vertexColors: true, color: 0xFFFF00}),
                system;
            
            var finish = function(context) {
                console.log('Added particles', context.entries.length, geometry, material);
                system = new THREE.ParticleSystem(geometry, material);
                system.sortParticles = true;
                system.name = "imdb-particles"; //arbitrary
                scene.add(system);
            };

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
        },
        init = function(node, width, height) {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
            webGLRenderer.setClearColor(0xFFFFFF, 1.0);
            webGLRenderer.setSize(width, height);
            node.appendChild(webGLRenderer.domElement);
            //$(node).append(webGLRenderer.domElement);
            camera.position.x = 20;
            camera.position.y = 0;
            camera.position.z = 150;
            layout();
            render();
            return relayout;
        };
        return init;
}(window.THREE));
