class Observer {
  constructor() {
    this.main = new MainView()
    this.shadow = new ShadowView(this)
  }

  putDrawing(buf, gl_mode, color) {
    // insert entity to bank
    this.main.bank.addEntity(
      new Entity(this.main.getVertices().length / 2, buf, gl_mode, color),
    )
    // redraw
    this.main.draw()
  }

  clearShadow() {
    this.shadow.buf = []
    this.shadow.clear()
  }

  clearCanvas() {
    this.clearShadow()
    // clear main view
    this.main.bank.entities = []
    this.main.clear()
  }

  getColor() {
    var color = parseInt(
      document.getElementById('color-picker').value.substr(1, 6),
      16,
    )
    return [
      Math.floor(color / 65536) / 255,
      Math.floor((color % 65536) / 256) / 255,
      (color % 256) / 255,
    ]
  }

  findV(coord) {
    var entities = this.main.bank.entities
    for (var i = entities.length - 1; i >= 0; i--) {
      for (var v = 0; v < entities[i].vertices.length / 2; v++) {
        if (isClose(coord, entities[i].vertices.slice(v * 2, v * 2 + 2))) {
          this.clearShadow()
          this.shadow.unbindCursor()
          this.shadow.draw(entities[i].gl_mode, entities[i].vertices, [
            1,
            1,
            1,
            1,
          ])
          this.shadow.bindCursor(entities[i], v)
          return
        }
      }
      if (entities[i].gl_mode != this.main.gl.LINES) {
        var total_vertices = entities[i].vertices
        if (entities[i].gl_mode == this.main.gl.TRIANGLE_STRIP) {
          // special case polygon: square
          total_vertices = entities[i].vertices
            .slice(0, 4)
            .concat(entities[i].vertices.slice(6, 8))
            .concat(entities[i].vertices.slice(4, 6))
        }
        if (this.isVInside(total_vertices, coord)) {
          //Activate Hover color by lowering opacity
          this.shadow.draw(entities[i].gl_mode, entities[i].vertices, [
            1,
            1,
            1,
            1,
          ])
          this.shadow.bindCursor(entities[i], -1)
          return
        } else if (
          this.shadow.binding.length &&
          entities[i] == this.shadow.binding[0]
        ) {
          this.clearShadow()
          this.shadow.unbindCursor()
        }
      }
    }
    this.clearShadow()
    this.shadow.unbindCursor()
  }

  loadModel(file) {
    var draw = () => this.main.draw()
    this.main.bank.loadFromFile(file, draw)
  }

  onSegment(p, q, r) {
    if (
      q[0] <= Math.max(p[0], r[0]) &&
      q[0] >= Math.min(p[0], r[0]) &&
      q[1] <= Math.max(p[1], r[1]) &&
      q[1] >= Math.min(p[1], r[1])
    ) {
      return true
    } else {
      return false
    }
  }

  // return 0 : Colinear Points
  // return 1 : Clockwise points
  // return 2 : Counterclockwise points
  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/amp/
  orient(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
    if (val > 0) {
      return 1
    }
    if (val < 0) {
      return 2
    }
    return 0
  }

  doIntersect(p1, q1, p2, q2) {
    const o1 = this.orient(p1, q1, p2)
    const o2 = this.orient(p1, q1, q2)
    const o3 = this.orient(p2, q2, p1)
    const o4 = this.orient(p2, q2, q1)
    if (o1 !== o2 && o3 !== o4) {
      return true
    }
    if (o1 === 0 && this.onSegment(p1, p2, q1)) {
      return true
    }
    if (o2 === 0 && this.onSegment(p1, q2, q1)) {
      return true
    }
    if (o3 === 0 && this.onSegment(p2, p1, q2)) {
      return true
    }
    if (o4 === 0 && this.onSegment(p2, q1, q2)) {
      return true
    }
    return false
  }

  isVInside(vertices, p) {
    const points = []
    for (let i = 0; i < vertices.length; i += 2) {
      points.push([vertices[i], vertices[i + 1]])
    }
    const n = points.length
    if (n < 3) {
      return false
    }
    const extreme = [Number.MAX_SAFE_INTEGER, p[1]]
    let count = 0
    let i = 0

    while (true) {
      let next = (i + 1) % n
      if (this.doIntersect(points[i], points[next], p, extreme)) {
        if (this.orient(points[i], p, points[next]) === 0) {
          return this.onSegment(points[i], p, points[next])
        }
        count += 1
      }
      i = next
      if (i === 0) {
        break
      }
    }
    return count % 2 == 1
  }
}
