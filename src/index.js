const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
import GPUComuptationRenderer from '../lib/GPUComuptationRenderer'
var glsl = require('glslify')
const path = require('path');

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 1, 10000)
camera.position.z = 500;

var geometry = new THREE.CubeGeometry( 200, 200, 200 );

var material = new THREE.ShaderMaterial({
  vertexShader: glsl(path.resolve(__dirname, './shaders/vertex.glsl')),
  fragmentShader: glsl(path.resolve(__dirname, './shaders/fragment.glsl'))
});

const cube = new THREE.Mesh(geometry, material );
scene.add(cube)

function render(t) {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

requestAnimationFrame(render)

const control = new OrbitControls(camera, renderer.domElement)