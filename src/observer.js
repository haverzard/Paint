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
        if (isVInside(total_vertices, coord)) {
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

  // If the click area doesn't belong to any entity then return null
  // changeEntityColor(p) {
  //   const color = this.getColor()
  //   console.log('--')
  //   console.log(color)
  //   var entities = this.main.bank.entities
  //   for (var i = entities.length - 1; i >= 0; i--) {
  //     for (var v = 0; v < entities[i].vertices.length / 2; v++) {
  //       var total_vertices = entities[i].vertices
  //       if (isVInside(total_vertices, p)) {
  //         if (color !== entities[i].color) {
  //           entities[i].color = [...color]
  //           this.main.draw()
  //         }
  //         return
  //       }
  //     }
  //   }
  //   return null
  // }
}
