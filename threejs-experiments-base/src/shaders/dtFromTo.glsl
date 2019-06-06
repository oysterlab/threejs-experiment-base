
uniform sampler2D toTexture;
uniform float uProgress;


void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;



    vec4 fromPos = texture2D(fromTexture, uv);
    vec4 toPos = texture2D(toTexture, uv);

    vec4 pos = fromPos + (toPos - fromPos) * uProgress;
    gl_FragColor = pos;
}