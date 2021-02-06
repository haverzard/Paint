class ShadowView {
    constructor(observer) {
        this.observer = observer
        this.canvas = document.getElementById("shadow-view")
        this.canvas.width = window.innerHeight * 0.95
        this.canvas.height = window.innerHeight * 0.95
        this.canvas.addEventListener('mousedown', (e) => this.processMousePress(e))
        this.canvas.addEventListener('mousemove', (e) => this.processMouseMove(e))

        this.buf = []
        this.gl = getGL(this.canvas)
    
        // init GL
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    
        // load shader
        this.shaderProgram = loadShader(this.gl, norm2dVertex, shadowFrag)    
    }

    processMousePress(event) {
        var canvas = this.canvas
        var gl = this.gl
        var buf = this.buf

        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
        if (mode == MODE.CURSOR) return
    
        buf.push(x/canvas.width*2-1)
        buf.push(((-y/canvas.height*2)+1))
    
        var gl_mode
        if (mode == MODE.LINE) {
            gl_mode = gl.LINES
            if (buf.length == 4) {
                this.observer.putDrawing(buf, gl.LINES)
                this.buf = []
            }
        } else if (mode == MODE.SQUARE) {
            gl_mode = gl.TRIANGLE_STRIP
            if (buf.length == 4) {
                this.observer.putDrawing([buf[0], buf[1], buf[0], buf[3], buf[2], buf[1], buf[2], buf[3]], gl.TRIANGLE_STRIP)
                this.buf = []
            }
        } else if (mode == MODE.POLYGON) {
            gl_mode = gl.TRIANGLE_STRIP
        }
        console.log(this.buf)
        this.draw(gl_mode, this.buf)
    }

    processMouseMove(event) {
        var canvas = this.canvas
        var gl = this.gl
        var buf = this.buf

        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        if (mode == MODE.CURSOR) return
        if (buf == []) return
    
        var gl_mode
        var total_vertices = this.buf
        if (mode == MODE.LINE) {
            gl_mode = gl.LINES
            total_vertices = total_vertices.concat([x/canvas.width*2-1, ((-y/canvas.height*2)+1)])
        } else if (mode == MODE.SQUARE) {
            gl_mode = gl.TRIANGLE_STRIP
            buf = buf.concat([x/canvas.width*2-1, ((-y/canvas.height*2)+1)])
            total_vertices = [buf[0], buf[1], buf[0], buf[3], buf[2], buf[1], buf[2], buf[3]]
        } else if (mode == MODE.POLYGON) {
            gl_mode = gl.TRIANGLE_STRIP
        }
    
        this.draw(gl_mode, total_vertices)
    }

    draw(gl_mode, vertices) {
        var gl = this.gl
        var shaderProgram = this.shaderProgram

        var vertex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        var coord = gl.getAttribLocation(shaderProgram, "vPosition")
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(coord)
    
        // Enable the depth test
        this.gl.enable(gl.DEPTH_TEST)
    
        // Draw the triangle
        gl.drawArrays(gl_mode, 0, vertices.length/2)
    }

    clear() {
        this.buf = []
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }
}