function shadowFrag() {
  return `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 0.5);
    }
    `
}
