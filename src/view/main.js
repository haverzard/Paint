class MainView {
    constructor() {
        this.canvas = document.getElementById("main-view")
        this.canvas.width = window.innerHeight * 0.95
        this.canvas.height = window.innerHeight * 0.95

        this.bank = new EntityBank()
        this.gl = getGL(this.canvas)
    
        // init GL
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    
        // load shader
        this.shaderProgram = loadShader(this.gl, norm2dVertex, colorFrag)    
    }

    getVertices() {
        var total_vertices = []
        this.bank.entities.forEach((entity) => {
            total_vertices = total_vertices.concat(entity.vertices)
        })
        return total_vertices
    }

    draw() {
        var gl = this.gl
        var shaderProgram = this.shaderProgram

        var vertex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getVertices()), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        var coord = gl.getAttribLocation(shaderProgram, "vPosition")
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(coord)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    
        // gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
        // var colorRGBA = gl.getAttribLocation(shaderProgram, "color")
        // gl.vertexAttribPointer(colorRGBA, 4, gl.FLOAT, false, 0, 0)
        // gl.enableVertexAttribArray(colorRGBA)
    
        /* Step5: Drawing the required object (triangle) */
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    
        // Enable the depth test
        gl.enable(gl.DEPTH_TEST)
    
        // Clear the color buffer bit
        gl.clear(gl.COLOR_BUFFER_BIT)
    
        // Draw the triangle
        this.bank.entities.forEach((entity) => {
            gl.drawArrays(entity.gl_mode, entity.offset, entity.vertices.length/2)
        })
    }

    clear() {
        this.bank.entities = []
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }
}