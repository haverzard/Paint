class MainView {
  constructor() {
    // init canvas
    this.canvas = document.getElementById('main-view')
    this.canvas.width = window.innerHeight * 0.95
    this.canvas.height = window.innerHeight * 0.95

    // attributes
    this.bank = new EntityBank()
    this.gl = getGL(this.canvas)

    // init GL
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    // load shader
    this.shaderProgram = loadShader(this.gl, norm2dVertex, colorFrag)
  }

  getVertices() {
    // merge all entities into single array
    var total_vertices = []
    this.bank.entities.forEach((entity) => {
      total_vertices = total_vertices.concat(entity.vertices)
    })
    return total_vertices
  }

  getVerticesInfo() {
    // merge all entities into single array
    var total_vertices = []
    var colors = []
    var depth = []
    this.bank.entities.forEach((entity, x) => {
      total_vertices = total_vertices.concat(entity.vertices)
      for (var i = 0; i < entity.vertices.length / 2; i++) {
        colors = colors.concat(entity.color)
        depth.push(-x / this.bank.entities.length)
      }
    })
    return [total_vertices, colors, depth]
  }

  draw() {
    // simplify variables
    var gl = this.gl
    var shaderProgram = this.shaderProgram

    // create buffer for vertex & color - for shaders
    var vertex_buffer = gl.createBuffer()
    var vertices_info = this.getVerticesInfo()
    console.log(vertices_info)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices_info[0]),
      gl.STATIC_DRAW,
    )

    var color_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices_info[1]),
      gl.STATIC_DRAW,
    )

    var depth_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, depth_buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices_info[2]),
      gl.STATIC_DRAW,
    )

    // send buffer to attribute in shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    var colorRGBA = gl.getAttribLocation(shaderProgram, 'color')
    gl.vertexAttribPointer(colorRGBA, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorRGBA)

    gl.bindBuffer(gl.ARRAY_BUFFER, depth_buffer)
    var depth = gl.getAttribLocation(shaderProgram, 'depth')
    gl.vertexAttribPointer(depth, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(depth)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    var coord = gl.getAttribLocation(shaderProgram, 'vPosition')
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(coord)

    /* Step5: Drawing the required object (triangle) */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST)

    // Draw the triangle
    this.bank.entities.forEach((entity) => {
      gl.drawArrays(entity.gl_mode, entity.offset, entity.vertices.length / 2)
    })
  }

  clear() {
    // delete entities in bank
    this.bank.entities = []
    // delete entities in canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
}
