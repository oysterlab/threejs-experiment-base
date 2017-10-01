
attribute vec2 boxIndex;
uniform sampler2D positionTexture;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 boxPos = texture2D(positionTexture, boxIndex).xyz;
    vec3 pos = position + boxPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}