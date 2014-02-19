var IMDBSystem = (function(THREE){
    /* What the viewer sees */
    var scene = new THREE.Scene(),
        /* How the viewer sees it */
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000),
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
                    opacity: 1,
                    sizeAttenuation: true,
                    map: (function () {
                        var texture = new THREE.Texture( (function(height, width, center_x, center_y, radius, canvas, ctx) {
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
                            ctx.strokeStyle = 'black';
                            ctx.beginPath();
                            ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI, false);
                            ctx.stroke();
                            return canvas;
                        }(32, 32, 16, 16, 5)));
                        texture.needsUpdate = true;
                        return texture;
                    }())
                }),
                system;
            
            var finish = function(context) {
                console.log('Added particles', context.entries.length);
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
        init = function(node) {
            webGLRenderer.setClearColor(0x000000, 1.0);
            webGLRenderer.setSize(node.offsetWidth, node.offsetHeight);
            node.appendChild(webGLRenderer.domElement);
            console.log('init', webGLRenderer.domElement);
            camera.position.x = 20;
            camera.position.y = 0;
            camera.position.z = 150;
            layout();
            render();
            return relayout;
        };
        return init;
}(window.THREE));
