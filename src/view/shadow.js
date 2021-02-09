class ShadowView {
  constructor(observer) {
    // init canvas
    this.canvas = document.getElementById('shadow-view')
    this.canvas.width = window.innerHeight * 0.95
    this.canvas.height = window.innerHeight * 0.95
    this.canvas.addEventListener('mousedown', (e) => this.processMousePress(e))
    this.canvas.addEventListener('mouseup', (e) => this.processMouseRelease(e))
    this.canvas.addEventListener('mousemove', (e) => this.processMouseMove(e))

    // attributes
    this.buf = []
    this.binding = []
    this.hold = false
    this.gl = getGL(this.canvas)
    this.observer = observer

    // init GL
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    // load shader
    this.shaderProgram = loadShader(this.gl, norm2dVertex, shadowFrag)
  }

  processMouseRelease(event) {
    this.hold = false
    if (this.binding.length == 0) return
    if (mode != MODE.CURSOR || this.binding[1] == -1) return

    this.clear()
    var canvas = this.canvas
    var entity = this.binding[0]
    var s = this.binding[1]

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    var coord = [(x / canvas.width) * 2 - 1, (-y / canvas.height) * 2 + 1]

    if (
      entity.gl_mode == this.gl.LINES ||
      entity.gl_mode == this.gl.TRIANGLE_FAN
    ) {
      s *= 2
      entity.vertices[s] = coord[0]
      entity.vertices[s + 1] = coord[1]
    } else {
      s = (s * 2 + (s % 2 == 0 ? 3 : 1) * 2) % 8
      entity.vertices = createSquare(coord, entity.vertices.slice(s, s + 2))
    }

    // this.unbindCursor()
    this.observer.main.draw()
  }

  processMousePress(event) {
    // simplify variables
    var canvas = this.canvas
    var gl = this.gl
    var buf = this.buf

    this.hold = false
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log('x: ' + x + ' y: ' + y)
    if (mode == MODE.CURSOR) {
      this.hold = true
      return
    }

    // insert vertex to local buffer
    buf.push((x / canvas.width) * 2 - 1)
    buf.push((-y / canvas.height) * 2 + 1)

    var gl_mode
    var color = this.observer.getColor()
    if (mode == MODE.LINE) {
      gl_mode = gl.LINES
      // finish line
      if (buf.length == 4) {
        this.observer.putDrawing(buf, gl.LINES, color)
        this.buf = []
      }
    } else if (mode == MODE.SQUARE) {
      gl_mode = gl.TRIANGLE_STRIP
      // finish square
      if (buf.length == 4) {
        this.observer.putDrawing(
          createSquare(buf.slice(2, 4), buf.slice(0, 2)),
          gl.TRIANGLE_STRIP,
          color,
        )
        this.buf = []
      }
    } else if (mode == MODE.POLYGON) {
      gl_mode = gl.LINES
      if (buf.length > 4) {
        gl_mode = gl.TRIANGLE_FAN
        const tolerance = 0.01
        length = buf.length
        if (
          isSamePointWithTolerance(buf[0], buf[length - 2], tolerance) &&
          isSamePointWithTolerance(buf[1], buf[length - 1], tolerance)
        ) {
          this.observer.putDrawing(
            buf.slice(0, buf.length - 2),
            gl.TRIANGLE_FAN,
            color,
          )
          this.buf = []
        }
      }
    }
    console.log(this.buf)
    if (this.buf) this.draw(gl_mode, this.buf, color)
  }

  processMouseMove(event) {
    // simplify variables
    var canvas = this.canvas
    var gl = this.gl
    var buf = this.buf

    // ignore empty buf to reduce computation
    if (buf == []) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    var coord = [(x / canvas.width) * 2 - 1, (-y / canvas.height) * 2 + 1]
    if (mode == MODE.CURSOR) return this.processCursor(coord)

    var gl_mode
    var total_vertices = this.buf

    if (mode == MODE.LINE) {
      // create line
      gl_mode = gl.LINES
      total_vertices = total_vertices.concat(coord)
    } else if (mode == MODE.SQUARE) {
      // create square
      gl_mode = gl.TRIANGLE_STRIP
      total_vertices = createSquare(coord, buf)
    } else if (mode == MODE.POLYGON) {
      if (buf.length < 4) {
        gl_mode = gl.LINES
        total_vertices = total_vertices.concat(coord)
      } else {
        gl_mode = gl.TRIANGLE_FAN
        total_vertices = total_vertices.concat([
          (x / canvas.width) * 2 - 1,
          (-y / canvas.height) * 2 + 1,
        ])
      }
    }

    // draw to canvas
    this.draw(gl_mode, total_vertices, this.observer.getColor())
  }

  draw(gl_mode, vertices, color) {
    // simplify variables
    var gl = this.gl
    var shaderProgram = this.shaderProgram

    // duplicate color (1 color for each entity) - we want to avoid gradient (increase of complexity)
    var colors = []
    for (var i = 0; i < vertices.length / 2; i++) colors = colors.concat(color)

    // create buffer for vertex & color - for shaders
    var vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)

    var color_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW)

    // send buffer to attribute in shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    var colorRGBA = gl.getAttribLocation(shaderProgram, 'color')
    gl.vertexAttribPointer(colorRGBA, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorRGBA)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    var coord = gl.getAttribLocation(shaderProgram, 'vPosition')
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(coord)

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST)

    // Draw the entity
    gl.drawArrays(gl_mode, 0, vertices.length / 2)
  }

  processCursor(coord) {
    if (!this.hold) return this.observer.findV(coord)
    if (this.binding.length == 0 || this.binding[1] == -1) return
    var v_num = this.binding[1]
    var entity = this.binding[0]
    var total_vertices, s

    if (entity.gl_mode == this.gl.LINES) {
      s = (v_num * 2 + 2) % 4
      total_vertices = coord.concat(entity.vertices.slice(s, s + 2))
    } else if (entity.gl_mode == this.gl.TRIANGLE_STRIP) {
      s = (v_num * 2 + (v_num % 2 == 0 ? 3 : 1) * 2) % 8
      total_vertices = createSquare(coord, entity.vertices.slice(s, s + 2))
    } else {
      s = (v_num * 2 + 2) % entity.vertices.length
      total_vertices = entity.vertices
        .slice(0, v_num * 2)
        .concat(coord)
        .concat(entity.vertices.slice(s))
    }
    this.draw(entity.gl_mode, total_vertices, entity.color)
  }

  bindCursor(entity, v_num) {
    this.binding = [entity, v_num]
  }

  unbindCursor() {
    this.binding = []
  }

  clear() {
    // delete buffer
    this.buf = []
    // delete entities in canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
}
