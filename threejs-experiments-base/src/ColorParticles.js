const THREE = require('three')
const GPUComputationRenderer = require('../lib/GPUComputationRenderer')(THREE)
const glsl = require('glslify')
const path = require('path');

class ColorParticles {
    constructor(renderer, option) {
        const {
            rowCount, 
            particleWidth, 
            cubeWidth, 
            isRandomPosition
        } = option

        const textureWidth = Math.sqrt(rowCount * rowCount * rowCount)
        const textureHeight = textureWidth

        const boxIndexes = new Float32Array(textureWidth * textureHeight * 2)
        for(let y = 0; y < textureHeight; y++) {
            for(let x = 0; x < textureWidth; x++) {
                const i = (y * textureWidth + x) * 2

                boxIndexes[i + 0] = x / textureWidth
                boxIndexes[i + 1] = y / textureHeight
            }
        }

        const geometry = new THREE.InstancedBufferGeometry()
        geometry.copy(new THREE.BoxBufferGeometry(particleWidth, particleWidth, particleWidth))
        
        geometry.addAttribute('boxIndex', new THREE.InstancedBufferAttribute(boxIndexes, 2, 1))
     
        const gpuCompute = new GPUComputationRenderer(textureWidth, textureHeight, renderer)

        const initPosTexture= gpuCompute.createTexture()
        const fromPosTexture= gpuCompute.createTexture()
        const toPosTexture= gpuCompute.createTexture()        
        const colorMapTexture = gpuCompute.createTexture()

        if (isRandomPosition) {
           for(let i = 0; i < fromPosTexture.image.data.length; i+=4) {
              const i_ = parseInt(i / 4)
              const xi = Math.random()
              const yi = Math.random()
              const zi = Math.random()
            
              initPosTexture.image.data[i + 0] = (xi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 1] = (yi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 2] = (zi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 3] = 1

              fromPosTexture.image.data[i + 0] = initPosTexture.image.data[i + 0]
              fromPosTexture.image.data[i + 1] = initPosTexture.image.data[i + 1]
              fromPosTexture.image.data[i + 2] = initPosTexture.image.data[i + 2]
              fromPosTexture.image.data[i + 3] = initPosTexture.image.data[i + 3]

              toPosTexture.image.data[i + 0] = initPosTexture.image.data[i + 0]
              toPosTexture.image.data[i + 1] = initPosTexture.image.data[i + 1]
              toPosTexture.image.data[i + 2] = initPosTexture.image.data[i + 2]
              toPosTexture.image.data[i + 3] = initPosTexture.image.data[i + 3]

              colorMapTexture.image.data[i + 0] = xi
              colorMapTexture.image.data[i + 1] = yi
              colorMapTexture.image.data[i + 2] = zi
              colorMapTexture.image.data[i + 3] = 1
            }
        } else {
            for(let i = 0; i < fromPosTexture.image.data.length; i+=4) {
              const i_ = parseInt(i / 4)
              const xi = (i_ % rowCount) / rowCount
              const yi = (parseInt((i_ / rowCount)) % rowCount) / rowCount
              const zi = (parseInt(i_ / (rowCount * rowCount))) / rowCount
            
              initPosTexture.image.data[i + 0] = (xi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 1] = (yi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 2] = (zi - 0.5) * cubeWidth
              initPosTexture.image.data[i + 3] = 1

              fromPosTexture.image.data[i + 0] = initPosTexture.image.data[i + 0]
              fromPosTexture.image.data[i + 1] = initPosTexture.image.data[i + 1]
              fromPosTexture.image.data[i + 2] = initPosTexture.image.data[i + 2]
              fromPosTexture.image.data[i + 3] = initPosTexture.image.data[i + 3]

              toPosTexture.image.data[i + 0] = initPosTexture.image.data[i + 0]
              toPosTexture.image.data[i + 1] = initPosTexture.image.data[i + 1]
              toPosTexture.image.data[i + 2] = initPosTexture.image.data[i + 2]
              toPosTexture.image.data[i + 3] = initPosTexture.image.data[i + 3]

              colorMapTexture.image.data[i + 0] = xi
              colorMapTexture.image.data[i + 1] = yi
              colorMapTexture.image.data[i + 2] = zi
              colorMapTexture.image.data[i + 3] = 1
            }
        }

        const dtPositionLogic = glsl(path.resolve(__dirname, './shaders/dtPosition.glsl'))
        const positionVariable = gpuCompute.addVariable("fromTexture", dtPositionLogic, fromPosTexture)
        gpuCompute.setVariableDependencies(positionVariable, [positionVariable])
        positionVariable.material.uniforms.toTexture = { type: 't', value: toPosTexture }
        positionVariable.material.uniforms.uProgress = { type: 'f', value: 0 }

        gpuCompute.init()

        var material = new THREE.ShaderMaterial({
        vertexShader: glsl(path.resolve(__dirname, './shaders/vertex.glsl')),
        fragmentShader: glsl(path.resolve(__dirname, './shaders/fragment.glsl')),
            uniforms: {
                positionTexture: {
                    type: 't', value: null
                },
                colorMapTexture: {
                    type: 't', value: colorMapTexture
                }
            }
        });

        const cube = new THREE.Mesh(geometry, material );

        this.gpuCompute = gpuCompute
        this.cube = cube
        this.positionVariable = positionVariable
        this.colorMapTexture = colorMapTexture

        this.initPosTexture = initPosTexture
        this.fromPosTexture = fromPosTexture
        this.toPosTexture = toPosTexture
        
        this.cubeWidth = cubeWidth
        this.renderer = renderer
        this.rowCount = rowCount
    }

    addToScene(scene) {
        scene.add(this.cube)
    }

    render(t) {
        let {
             gpuCompute, cube, positionVariable,
             initPosTexture, fromPosTexture, toPosTexture,
             cubeWidth, rowCount } = this
             
        if (positionVariable.material.uniforms.uProgress.value < 1.0)
            positionVariable.material.uniforms.uProgress.value += 0.01
        else
            positionVariable.material.uniforms.uProgress.value = 1.0

        positionVariable.material.uniforms.uProgress.needsUpdate = true
        gpuCompute.compute()
        cube.material.uniforms.positionTexture.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture

        if (positionVariable.material.uniforms.uProgress.value == 1.0) {
            console.log('update')
            
            const t = (Math.random()  - 0.5) * cubeWidth
            const xt = Math.random()
            const zt = Math.random()
            for(let i = 0; i < toPosTexture.image.data.length; i+=4) {
                const i_ = i / 4
                const xi = (i_ % rowCount) / rowCount
                const yi = (parseInt((i_ / rowCount)) % rowCount) / rowCount
                const zi = (parseInt(i_ / (rowCount * rowCount))) / rowCount

                const initY = initPosTexture.image.data[i + 1]
                let y = initPosTexture.image.data[i + 1]
                const padding = cubeWidth * 0.1

                if (initY < t) {
                    y = initPosTexture.image.data[i + 1] - cubeWidth * 0.2
                } else {
                    y = initPosTexture.image.data[i + 1] + cubeWidth * 0.2
                }
                
                const diff = Math.abs(initY - t)
                if (diff < padding) {
                    y += Math.cos(3 * xt * 2 * Math.PI * xi) * padding * xt * 0.5 * (1.0 - diff / padding)
                    y += Math.sin(3 * zt * 2 * Math.PI * zi) * padding * zt * 0.5 * (1.0 - diff / padding)
                }

                toPosTexture.image.data[i + 1] = y

                // toPosTexture.image.data[i + 0] = (xi - 0.5) * cubeWidth
                // toPosTexture.image.data[i + 1] = (t < initPosTexture.image.data[i + 1]) ? initPosTexture.image.data[i + 1] + 0.5 * cubeWidth : initPosTexture.image.data[i + 1] - 0.5 * cubeWidth
                // toPosTexture.image.data[i + 2] = (zi - 0.5) * cubeWidth
                toPosTexture.image.data[i + 3] = 1
            }

            toPosTexture.needsUpdate = true

            positionVariable.material.uniforms.uProgress.value = 0.0;
            positionVariable.material.uniforms.fromTexture.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture
            positionVariable.material.uniforms.toTexture.value = toPosTexture

            positionVariable.material.uniforms.uProgress.needsUpdate = true
            positionVariable.material.uniforms.fromTexture.needsUpdate = true
            positionVariable.material.uniforms.toTexture.needsUpdate = true          
        }
    }
}

export default ColorParticles