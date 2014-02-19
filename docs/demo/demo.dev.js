var IMDBSystem = (function(THREE){
    /* What the viewer sees */
    var scene = new THREE.Scene(),
        /* How the viewer sees it */
        , camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        /* WebGL vs. Canvas renderer */
        webGLRenderer = new THREE.WebGLRenderer(),
        /* What we'll create: a particle system */
        system,
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
            var geometry = new THREE.Geometry(),
                material = new THREE.ParticleBasicMaterial({
                    size: 5,
                    color: '#ffffff',
                    transparent: true,
                    opacity: .8,
                    sizeAttenuation: true,
                    map: (function () {
                        var texture = new THREE.Texture( (function(height, width, center_x, center_y, radius, points, m, canvas, ctx, ) {
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
                            ctx.fill();
                            ctx.restore();
                            return canvas;
                        }(32, 32, 16, 16, 10)));
                        texture.needsUpdate = true;
                        return texture;
                    }())
                }),
                system;
            geometry.vertices.push(new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2));
            system = new THREE.ParticleSystem(geometry, material);
            system.sortParticles = true;
            system.name = "imdb-particles"; //arbitrary
            scene.add(system);
        },
        /* When properties change we'll need a re-layout */
        relayout = function () {
            if (scene.getChildByName("particles")) {
                scene.remove(scene.getChildByName("particles"));
            }
            layout();
        },
        init = function(node) {
            webGLRenderer.setClearColorHex(0x000000, 1.0);
            webGLRenderer.setSize(window.innerWidth, window.innerHeight); //Fix
            node.addChild(webGLRenderer.domElement);
            camera.position.x = 20;
            camera.position.y = 0;
            camera.position.z = 150;
            layout();
            render();
        };
        return init;
}(window.THREE));
