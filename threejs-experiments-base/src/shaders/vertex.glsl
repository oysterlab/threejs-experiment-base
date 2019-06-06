
attribute vec2 boxIndex;
uniform sampler2D positionTexture;
uniform sampler2D colorMapTexture;

varying vec2 vUv;
varying vec3 vColor;

void main() {
    vUv = uv;
    vec3 boxColor = texture2D(colorMapTexture, boxIndex).xyz;
    vec3 boxPos = texture2D(positionTexture, boxIndex).xyz;
    vec3 pos = position + boxPos;
    vColor = boxColor;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}