function norm2dVertex() {
  return `
    attribute vec2 vPosition;
    attribute vec4 color;
    attribute float depth;
    varying vec4 vColor;

    void main() {
        gl_Position = vec4(vPosition, depth, 1.0);
        vColor = color;
    }
    `
}
