const THREE = require('n3d-threejs')
const OrbitControls = require('three-orbit-controls')(THREE)
import StyleParticles from './StyleParticles'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setSize(WIDTH, HEIGHT)
renderer.setClearColor(0x000000, 1)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(120, WIDTH / HEIGHT, 1, 10000)
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));
camera.rotation.set(0.08527637827622801, 0.07939923273348698, 0.07042089804446282)
camera.position.set(-51.49491723759695, -506.5706870604613, 400.8359262485214)

const MAX_WIDTH = 800
const scene = new THREE.Scene()

const img = new Image()
img.src = 'sample.jpg'

img.onload = () => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if(img.width > MAX_WIDTH) {
    const r = img.height / img.width
    img.width = MAX_WIDTH
    img.height = MAX_WIDTH * r
  }

  canvas.width = img.width
  canvas.height = img.height

  context.fillStyle = context.drawImage(img, 0, 0, img.width, img.height)
  const imgData = context.getImageData(0, 0, img.width, img.height).data

  const imgInfo = {
    width: img.width,
    height: img.height,
    data: imgData,
  }

  const styleParticles1 = new StyleParticles(imgInfo, [0, 0, 0])
  scene.add(styleParticles1.particles)

  function render() {
    requestAnimationFrame(render)

    styleParticles1.update()
    renderer.render(scene, camera)
  }

  requestAnimationFrame(render)
}


const controls = new OrbitControls(camera, renderer.domElement)
