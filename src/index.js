const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
import GPUComuptationRenderer from '../lib/GPUComuptationRenderer'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 1, 10000)

function render(t) {

  requestAnimationFrame(render)
}

const control = new OrbitControls(camera, renderer.domElement)