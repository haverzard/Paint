function norm2dVertex() {
    return `
    attribute vec2 vPosition;
    attribute vec4 color;
    varying vec4 vColor;

    void main() {
        gl_Position = vec4(vPosition, 0.0, 1.0);
        vColor = color;
    }
    `
}