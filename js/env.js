var Detector = {
    webgl: ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )()
}

if(Detector.webgl) {
    document.documentElement.className += 'webgl';

    init();
    animate();
    loadStats();
}

// ThreeJS Setup
var $container, containerX, containerY, scene, camera, renderer, controls;

function init() {
    $container = document.getElementById('model');
    $container.innerHTML = '';

    getContainerSize();

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(25, containerX / containerY);
    camera.position.x = 400;
    camera.position.y = 200;
    camera.position.z = 400;
    camera.lookAt(scene.position);

    // Lights
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // Shaders
    var displace = new THREE.ImageUtils.loadTexture('/img/user/' + userId + '/height-map-' + envId + '.png');
    var texture  = new THREE.ImageUtils.loadTexture('/php/getEnvTexture.php?lat=' + latitude + '&lon=' + longitude);
    var shader   = THREE.ShaderLib['normalmap'];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['enableDisplacement'].value = true;
    uniforms['enableDiffuse'].value      = true;
    uniforms['tDisplacement'].value      = displace;
    uniforms['tDiffuse'].value           = texture;
    uniforms['uDisplacementScale'].value = 20;

    var dispMapShader = new THREE.ShaderMaterial({ fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, wireframe: false });
    var podiumShader  = new THREE.MeshLambertMaterial({ ambient: 0x222222 });

    var cubeFaceMaterials = [podiumShader, podiumShader, dispMapShader, podiumShader, podiumShader, podiumShader];

    // Geometry
    var geometry = new THREE.CubeGeometry(100, 2, 100, 200, 1, 200, cubeFaceMaterials);
    geometry.computeTangents();

    var podium = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(cubeFaceMaterials));

    scene.add(podium);

    // Controls
    controls = new THREE.OrbitControls(camera, $container, '360', containerX);
    controls.addEventListener('change', render);

    // Render
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(containerX, containerY);
    $container.appendChild(renderer.domElement);
}

// Events
window.addEventListener('resize', onWindowResize, false);

// Functions
function animate() {
    requestAnimationFrame(animate);
    render();
    controls.update();
    TWEEN.update();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    getContainerSize();

    camera.aspect = containerX / containerY;
    camera.updateProjectionMatrix();

    renderer.setSize(containerX, containerY);
}

function getContainerSize() {
    containerX = $container.clientWidth;
    containerY = $container.clientHeight;
}