const img = new Image()

img.src = './styled.jpg'
img.onload = () => {
  const width = img.width
  const height = img.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)

  const context = canvas.getContext('2d')

  context.drawImage(img, 0, 0, width, height);

  const imageData = canvas.getContext('2d').getImageData(0, 0, width, height)
  const pixelData = imageData.data;

  const lumi = [0.2126, 0.7152, 0.0722]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      const r = pixelData[i + 0]
      const g = pixelData[i + 1]
      const b = pixelData[i + 2]

      const l = parseInt(r * lumi[0]) + parseInt(g * lumi[1]) + parseInt(b * lumi[2])

      imageData.data[i + 0] = imageData.data[i + 1] = imageData.data[i + 2] = l
    }
  }

  context.putImageData(imageData, 0, 0);

  const vectorField = []
  const step = 16
  for (let y = step / 2; y < height - step / 2; y += step) {
    for (let x = step / 2; x < width - step / 2; x += step) {
      const i = (y * width + x) * 4

      let r = imageData.data[i + 0]
      let g = imageData.data[i + 1]
      let b = imageData.data[i + 2]

      const l = parseInt(r * lumi[0]) + parseInt(g * lumi[1]) + parseInt(b * lumi[2])

      let minIdx = -1;
      let minVal = 255;
      let pos = {x:0, y:0}
      for (let y_ = y - step / 2; y_ < y + step / 2; y_++) {
        for (let x_ = x - step / 2; x_ < x + step / 2; x_++) {
          const i_ = (y_ * width + x_) * 4

          if(i_ == i) continue

          r = imageData.data[i_ + 0]
          g = imageData.data[i_ + 1]
          b = imageData.data[i_ + 2]

          const l_ = parseInt(r * lumi[0]) + parseInt(g * lumi[1]) + parseInt(b * lumi[2])

          const v = Math.sqrt(Math.pow(l_ - l, 2))

          if (v < minVal) {
            minVal = v
            minIdx = i_
            pos.x = x_
            pos.y = y_
          }
        }
      }

      vectorField.push({
        start: {x, y},
        end: {x: pos.x, y: pos.y}
      })

      context.strokeStyle = '#f00'
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(pos.x, pos.y)
      context.closePath()
      context.stroke()
    }
  }

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vel = [0, 0];
      this.acc = [0, 0];
    }

    update() {
      this.vel[0] += this.acc[0]
      this.vel[1] += this.acc[1]

      this.x += this.vel[0]
      this.y += this.vel[1]

      this.acc[0] = 0
      this.acc[1] = 0
    }

    draw() {
      context.fillStyle = '#0f0'
      context.beginPath()
      context.ellipse(this.x, this.y, 2, 2, 0, 0, 2 * Math.PI)
      context.closePath()
      context.fill()
    }
  }

  const particles = []
  function render(t) {
    context.fillRect(0, 0, width, height)
    context.putImageData(imageData, 0, 0);

    particles.forEach((particle) => {
      const w = parseInt(width / step)
      const x_ = parseInt((particle.x - step / 2)/ step)
      const y_ = parseInt((particle.y - step / 2) / step)

      const {start, end} = vectorField[y_ * w + x_]
      context.fillStyle = '#f00'
      context.fillRect(start.x, start.y, step, step)

      const len = Math.sqrt(Math.pow((end.x - start.x), 2) + Math.pow((end.y - start.y), 2))

      particle.vel[0] = (end.x - start.x) / len * 0.1
      particle.vel[1] = (end.y - start.y) / len * 0.1

      particle.update()
      particle.draw()
    })
    requestAnimationFrame(render)
  }

   requestAnimationFrame(render)


  window.addEventListener('click', (e) => {
    const x = e.clientX
    const y = e.clientY
    particles.push(new Particle(x, y))
  })
}
