const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
import  ColorPaticles from './ColorParticles'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 1, 10000)
camera.position.z = 2000;

const colorParticles = new ColorPaticles(renderer, {
  rowCount: Math.pow(2, 6), 
  particleWidth: 10.0, 
  cubeWidth: 600, 
  isRandomPosition: false
})
colorParticles.addToScene(scene)

function render(t) {
  colorParticles.render(t)
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

requestAnimationFrame(render)

const control = new OrbitControls(camera, renderer.domElement)