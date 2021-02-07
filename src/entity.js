class Entity {
  constructor(offset, vertices, gl_mode, color = []) {
    this.offset = offset
    this.vertices = vertices
    this.color = color
    this.gl_mode = gl_mode
  }

  changeColor(color) {
    this.color = [0, 0, 0, 1.0]
  }
}
