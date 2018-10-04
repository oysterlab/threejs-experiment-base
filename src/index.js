document.body.style.padding = '0px'
document.body.style.maring = '0px'
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const canvas = document.createElement('canvas')
canvas.width = WIDTH
canvas.height = HEIGHT
document.body.appendChild(canvas)

const context = canvas.getContext('2d')

const DIGONAL_SIZE = 20  // must be odd number

const w = (WIDTH > HEIGHT) ? HEIGHT / parseInt((DIGONAL_SIZE * 1.6)) : WIDTH / parseInt((DIGONAL_SIZE * 1.6))
const h = (WIDTH > HEIGHT) ? HEIGHT / parseInt((DIGONAL_SIZE * 1.6)) : WIDTH / parseInt((DIGONAL_SIZE * 1.6))
const BLOCK_MAX_HEIGHT = h * 3
const p1 = [0. * w, -0.5 * h]
const p2 = [1. * w, 0. * h]
const p3 = [0. * w, 0.5 * h]
const p4 = [-1. * w, 0. * h]

const blocks = []
const countMap = {}
for (let r = 0; r <= DIGONAL_SIZE; r++) {
  const t = Math.sin(r / DIGONAL_SIZE * Math.PI).toFixed(2)
  let colCount = countMap[t]

  if (!colCount) {
    const countArr = Object.keys(countMap).map((key) => countMap[key])
    countMap[t] = (countArr.length == 0) ? 1 : Math.max.apply(null, countArr) + 1
    colCount = countMap[t]
  }

  let sc = w * 0.5 -(colCount * w)
  for (let c = 0; c < colCount; c++) {
    blocks.push({
      x: sc + c * w * 2, y: r * h * 0.5
    })
  }
}

const r = parseInt(Math.random() * 255)
const g = parseInt(Math.random() * 255)
const b = parseInt(Math.random() * 255)

const render = (t) => {
  context.clearRect(0, 0, WIDTH, HEIGHT)

  context.save()
  context.translate(WIDTH * 0.5 + w * 0.25, HEIGHT * 0.5 - DIGONAL_SIZE * 0.25 * h)

  blocks.forEach(({x, y}, i) => {
    const h = -(BLOCK_MAX_HEIGHT * 0.3) - (BLOCK_MAX_HEIGHT * 0.7) * Math.abs(Math.sin(0.8 * Math.PI * i / blocks.length + t * 0.004))

    context.beginPath()
    context.moveTo(x + p1[0], y + p1[1] + h)
    context.lineTo(x + p2[0], y + p2[1] + h)
    context.lineTo(x + p3[0], y + p3[1] + h)
    context.lineTo(x + p4[0], y + p4[1] + h)
    context.closePath()
    context.fillStyle = `rgb(${r}, ${g}, ${b})`
    context.fill()

    context.beginPath()
    context.moveTo(x + p3[0], y + p3[1] + h)
    context.lineTo(x + p4[0], y + p4[1] + h)
    context.lineTo(x + p4[0], y + p4[1])
    context.lineTo(x + p3[0], y + p3[1])
    context.closePath()
    context.fillStyle = `rgb(${r - 10}, ${g - 10}, ${b - 10})`
    context.fill()

    context.beginPath()
    context.moveTo(x + p2[0], y + p2[1] + h)
    context.lineTo(x + p2[0], y + p2[1])
    context.lineTo(x + p3[0], y + p3[1])
    context.lineTo(x + p3[0], y + p3[1] + h)
    context.closePath()
    context.fillStyle = `rgb(${r + 10}, ${g + 10}, ${b + 10})`
    context.fill()
  })
  context.restore()
  requestAnimationFrame(render)  
}

requestAnimationFrame(render)