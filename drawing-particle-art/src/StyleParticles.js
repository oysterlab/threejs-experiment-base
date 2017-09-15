const THREE = require('n3d-threejs')

class StyleParticles {

  constructor(img, position) {
    this.img = img
    const vertexShader = `
      varying vec4 vColor;

      attribute vec3 position_;
      attribute vec3 color_;

      void main() {

        vec4 pos = vec4(position + position_, 1.0);
        vColor = vec4(color_, 1.0);

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * pos;
      }
    `
    const fragmentShader = `
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }
    `

    const geom = new THREE.InstancedBufferGeometry()
    geom.copy(new THREE.PlaneBufferGeometry(2, 2))
//    geom.copy(new THREE.BoxBufferGeometry(1, 1, 1))
    geom.dynamics = false

    const imgHeight = img.height
    const imgWidth = img.width

    const vertices = new Float32Array(imgHeight * imgWidth * 3)
    const colors = new Float32Array(imgHeight * imgWidth * 3)
    const fromVertices = new Float32Array(imgHeight * imgWidth * 3)
    const toVertices = new Float32Array(imgHeight * imgWidth * 3)

    const vels = new Float32Array(imgHeight * imgWidth)

    const lumi = [0.2126, 0.7152, 0.0722]

    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const z = 300
        const i = (y * imgWidth + x)
        const i3 = i * 3
        const xv = x - imgWidth / 2 + position[0]
        const yv = y - imgHeight / 2 + position[1]
        const zv = z + position[2]

        const r = img.data[(y * imgWidth + x) * 4 + 0] / 255
        const g = img.data[(y * imgWidth + x) * 4 + 1] / 255
        const b = img.data[(y * imgWidth + x) * 4 + 2] / 255

        const l = 1 - r * lumi[0] + g * lumi[1] + b * lumi[2]

        fromVertices[i3 + 0] = xv
        fromVertices[(imgHeight * imgWidth * 3 - i3) + 1] = yv
        fromVertices[i3 + 2] = 10 * Math.random() + zv * Math.pow(l, 4)

        vertices[i3 + 0] = fromVertices[i3 + 0]
        vertices[(imgHeight * imgWidth * 3 - i3) + 1] = fromVertices[(imgHeight * imgWidth * 3 - i3) + 1]
        vertices[i3 + 2] = fromVertices[i3 + 2]

        toVertices[i3 + 0] = xv
        toVertices[(imgHeight * imgWidth * 3 - i3) + 1] = yv
        toVertices[i3 + 2] = 0

        vels[i] = 0.2 * Math.pow(l, 10) + 0.1

        colors[i3 + 0] = r
        colors[i3 + 1] = g
        colors[i3 + 2] = b
      }
    }

    this.vels = vels
    this.fromVertices = fromVertices
    this.toVertices = toVertices

    geom.addAttribute('position_', new THREE.InstancedBufferAttribute(vertices, 3, 1));
    geom.addAttribute('color_', new THREE.InstancedBufferAttribute(colors, 3, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader
    })

    this.particles = new THREE.Mesh(
      geom,
      material
    )
  }

  update() {
    const { particles, fromVertices, toVertices, vels, img } = this
    const position = particles.geometry.attributes.position_
    const imgHeight = img.height
    const imgWidth = img.width

    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const i = (y * imgWidth + x)
        const i3 = i * 3

       if(toVertices[i3 + 2] < position.array[i3 + 2]) {
         position.array[i3 + 2] -= vels[i];

        } else {
          position.array[i3 + 2] = toVertices[i3 + 2]
          fromVertices[i3 + 2] = toVertices[i3 + 2]
        }
      }
    }

    position.needsUpdate = true
  }
}

export default StyleParticles
