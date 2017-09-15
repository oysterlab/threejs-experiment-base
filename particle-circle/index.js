const THREE = require('n3d-threejs')
const Noise = require('noisejs').Noise
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

const noise = new Noise(Math.random())
let scene, camera, renderder

scene = new THREE.Scene()
camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 10000)
renderder = new THREE.WebGLRenderer()
renderder.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderder.domElement)
camera.position.z = 1

const particleCount = 100000;

const geometry = new THREE.InstancedBufferGeometry()
geometry.copy(new THREE.PlaneBufferGeometry(0.0005, 0.0005))

const positions = new Float32Array(particleCount * 3)
const opacities = new Float32Array(particleCount)

for(let i = 0; i < particleCount; i++) {
  const pi = i * 3;

  positions[pi + 0] = 0
  positions[pi + 1] = 0
  positions[pi + 2] = 0

  opacities[i] = 0;
}



geometry.addAttribute('position_', new THREE.InstancedBufferAttribute(positions, 3, 1))
geometry.addAttribute('opacity', new THREE.InstancedBufferAttribute(opacities, 1, 1))

const vertexShader = `
  precision highp float;

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  attribute vec3 position_;
  attribute vec3 position;
  attribute float opacity;

  varying float vOpacity;

  void main() {
    vOpacity = opacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + position_, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  varying float vOpacity;

  void main() {
    gl_FragColor = vec4(1.0, vec3(vOpacity));
  }
`

const material = new THREE.RawShaderMaterial({
  vertexShader,
  fragmentShader
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

class Particle {
  constructor(i, pos) {
    this.oi = i
    this.pi = i * 3

    this.reset(pos)
  }

  update(f) {
    let { oi, pi, lifeCount, life, vx, vy, n } = this;

    const opacity = life / lifeCount
    const x = positions[pi + 0]
    const y = positions[pi + 1]

    vx += noise.simplex2((x + n * 10 + f * 0.1) * 0.01 , y * 10. + f * 0.001) * 0.004 * n
  //  vy = noise.simplex2(x * 0.1, Math.random() - 0.5) * 0.01
    vy += 0.002

    // console.log(vy)
    positions[pi + 0] += vx
    positions[pi + 1] += vy

    opacities[oi] = opacity

    this.life--;
    if(this.life < 0) this.life = 0;
  }

  reset(pos) {
    this.initPos = pos

    positions[this.pi + 0] = pos.x
    positions[this.pi + 1] = pos.y
    positions[this.pi + 2] = pos.z

    this.lifeCount = Math.pow(Math.random(), 2) * 100
    this.life = this.lifeCount

    this.n = Math.random()
    this.vx = 0.0
    this.vy = 0.001
  }

  isAlive() {
    return this.life > 0
  }
}


const particles = []

for(let i = 0; i < particleCount; i++) {
  const pos = {
    x: Math.cos(i / particleCount * 2 * Math.PI) * 0.3,
    y: Math.sin(i / particleCount * 2 * Math.PI) * 0.3,
    z: 0
  }
  particles.push(new Particle(i, pos))
}

function update(f) {

  const position_ = mesh.geometry.attributes.position_
  const opacity = mesh.geometry.attributes.opacity

  const x = Math.cos(2 * Math.PI * f) * 0.001
  const y = Math.sin(2 * Math.PI * f) * 0.001


  particles.forEach((particle) => {
    particle.update(f)
   if (!particle.isAlive()) {
    const x = Math.cos(Math.PI * f * 0.001 + particle.oi / particleCount * Math.PI * 0.01) * 0.05
    const y = Math.sin(Math.PI * f * 0.001 + particle.oi / particleCount * Math.PI * 0.01) * 0.05
    particle.reset({x, y, z: 0})
//    particle.reset(particle.initPos)
   }
  })

  opacity.needsUpdate = true;
  position_.needsUpdate = true
}

function render(f) {
  requestAnimationFrame(render)
  renderder.render(scene, camera)
  update(f)
}

render()
