function norm2dVertex() {
  return `
    attribute vec2 vPosition;
    attribute vec3 color;
    attribute float depth;
    varying vec3 vColor;

    void main() {
        gl_Position = vec4(vPosition, depth, 1.0);
        vColor = color;
    }
    `
}
