const THREE = require('n3d-threejs')
const Noise = require('noisejs').Noise
const WIDTH = 600
const HEIGHT = 600

const noise = new Noise(Math.random())
let scene, camera, renderder

scene = new THREE.Scene()
camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 10000)
renderder = new THREE.WebGLRenderer()
renderder.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderder.domElement)

const g = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({color: 0xffffff})
)
//g.scale.set(0.1, 0.1, 0.1)
//scene.add(g)

const particleSize = 100;
const particles = [];

class Particle {

  constructor(x, y) {
    this.v = 0;

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent:true})

    const p = new THREE.Mesh(geometry, material)
    p.scale.set(0.01, 0.01, 0.01)
    p.position.x = x;
    p.position.y = y;

    this.vx = 0;
    this.vy = 0;
    scene.add(p)
    this.p = p;

    this.lifeCount = Math.random() * 100 + 1
    this.life = this.lifeCount
  }

  update(f) {
    const { p, lifeCount } = this

    p.material.opacity = 1.0 - this.life / this.lifeCount

    let nx = noise.simplex2(p.position.y, p.position.x) * 0.0001;
    let ny = noise.simplex2(p.position.x, p.position.y) * 0.0001;

    this.vx += nx;
    this.vy += ny;

    p.position.x += this.vx;
    p.position.y += this.vy;

    this.life--;

    if(this.life < 0) {
      for(let i = 0 ; i < particles.length; i++) {
        if(particles[i] == this)
          particles.splice(i, 1);
          scene.remove(p)
      }
    }
  }

}

for(let i = 0; i < particleSize; i++) {
  particles.push(new Particle(i))
}

camera.position.z = 5

function update(f) {

  particles.forEach((p, i) => {
    p.update(f)
  })

  const x = Math.cos(-2 * Math.PI * f * 0.0001)
  const y = Math.sin(-2 * Math.PI * f * 0.0001)

  const bornCount = 10 * Math.random()
  for(let i = 0; i < bornCount; i++) {
    particles.push(new Particle(x + Math.random() * 0.1, y + Math.random() * 0.1))
  }
}

function render(f) {
  requestAnimationFrame(render)
  renderder.render(scene, camera)
  update(f)
}

render()
