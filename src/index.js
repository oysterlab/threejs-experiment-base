const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
const GPUComputationRenderer = require('../lib/GPUComputationRenderer')(THREE)
const glsl = require('glslify')
const path = require('path');

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer()
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 1, 10000)
camera.position.z = 2000;

const boxCount = Math.pow(2, 18)
const computeWidth = Math.sqrt(boxCount)
const computeHeight = computeWidth

const boxIndexes = new Float32Array(boxCount * 2)
for(let y = 0; y < computeHeight; y++) {
  for(let x = 0; x < computeWidth; x++) {
    const i = (y * computeWidth + x) * 2

    boxIndexes[i + 0] = x / computeWidth
    boxIndexes[i + 1] = y / computeHeight
  }
}

const geometry = new THREE.InstancedBufferGeometry()
geometry.copy(new THREE.BoxBufferGeometry(2, 2, 2))

geometry.addAttribute('boxIndex', new THREE.InstancedBufferAttribute(boxIndexes, 2, 1))

const gpuCompute = new GPUComputationRenderer(computeWidth, computeHeight, renderer)
const dtPosition = gpuCompute.createTexture()

for(let i = 0; i < dtPosition.image.data.length; i+=4) {
  dtPosition.image.data[i + 0] = (Math.random() - 0.5) * 600
  dtPosition.image.data[i + 1] = (Math.random() - 0.5) * 600
  dtPosition.image.data[i + 2] = (Math.random()) * 600
  dtPosition.image.data[i + 3] = 1
}

const dtPositionLogic = glsl(path.resolve(__dirname, './shaders/dtPosition.glsl'))
const positionVariable = gpuCompute.addVariable("positionTexture", dtPositionLogic, dtPosition)
gpuCompute.setVariableDependencies(positionVariable, [positionVariable])

gpuCompute.init()

var material = new THREE.ShaderMaterial({
  vertexShader: glsl(path.resolve(__dirname, './shaders/vertex.glsl')),
  fragmentShader: glsl(path.resolve(__dirname, './shaders/fragment.glsl')),
  uniforms: {
    positionTexture: {
      type: 't', value: null
    }
  }
});

const cube = new THREE.Mesh(geometry, material );
scene.add(cube)

function render(t) {
  gpuCompute.compute()
  cube.material.uniforms.positionTexture.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

requestAnimationFrame(render)

const control = new OrbitControls(camera, renderer.domElement)