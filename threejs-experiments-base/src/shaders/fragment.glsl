varying vec2 vUv;
varying vec3 vColor;

void main() {
    vec3 vc = vColor;
    // vc.r = (vc.r + 300.) / 600.;
    // vc.g = (vc.g + 300.) / 600.;    
    // vc.b = vc.b / 600.;

    gl_FragColor = vec4(vc, 1.);
}