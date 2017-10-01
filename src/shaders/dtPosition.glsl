
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(positionTexture, uv);
    gl_FragColor = pos;
}