class MainView {
  constructor() {
    // init canvas
    this.canvas = document.getElementById('main-view')
    this.canvas.width = window.innerHeight * 0.95
    this.canvas.height = window.innerHeight * 0.95

    // attributes
    this.bank = new EntityBank()
    this.gl = getGL(this.canvas)
    this.editMode = EDITMODE.RESIZE
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

    var vertices_info = this.getVerticesInfo()
    // console.log(vertices_info)

    // create buffer for vertex, color, & depth - for shaders
    var vertex_buffer = createBuffer(gl, vertices_info[0])
    var color_buffer = createBuffer(gl, vertices_info[1])
    var depth_buffer = createBuffer(gl, vertices_info[2])

    // bind buffer to attribute in shaders
    bindBuffer(gl, shaderProgram, color_buffer, 3, 'color')
    bindBuffer(gl, shaderProgram, depth_buffer, 1, 'depth')
    bindBuffer(gl, shaderProgram, vertex_buffer, 2, 'vPosition')

    /* Step5: Drawing the required object (triangle) */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST)

    // Draw the triangle
    var offset = 0
    this.bank.entities.forEach((entity) => {
      var total = entity.vertices.length / 2
      gl.drawArrays(convertToGLMODE(entity.shape), offset, total)
      offset += total
    })
  }

  clear() {
    // delete entities in bank
    this.bank.entities = []
    // delete entities in canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
}
