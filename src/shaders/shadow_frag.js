function shadowFrag() {
    return `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vec4(vColor[0], vColor[1], vColor[2], 0.5);
    }
    `
}