class ShadowView {
    constructor(observer) {
        // init canvas
        this.canvas = document.getElementById('shadow-view')
        this.canvas.width = window.innerWidth * 0.90
        this.canvas.height = window.innerHeight * 0.90
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
        if (mode != MODE.CURSOR) return

        if (this.observer.main.editMode === EDITMODE.RESIZE) {
            if (this.binding[1] === -1) return
            this.clear()
            var canvas = this.canvas
            var entity = this.binding[0]
            var s = this.binding[1]

            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            var coord = [normalizeX(canvas, x), normalizeY(canvas, y)]

            if (
                entity.shape == SHAPE.LINE ||
                entity.shape == SHAPE.POLYGON
            ) {
                s *= 2
                entity.vertices[s] = coord[0]
                entity.vertices[s + 1] = coord[1]
            } else if (entity.shape == SHAPE.SQUARE) {
                s = (s * 2 + 4) % 8
                entity.vertices = createSquare(coord, entity.vertices.slice(s, s + 2))
            }

            // this.unbindCursor()
            this.observer.main.draw()
        } else if (this.binding[1] === -1) {
            const color = this.observer.getColor()
            if (JSON.stringify(color) != JSON.stringify(this.binding[0].color)) {
                return this.observer.changeEntityColor(this.binding[0], color)
            }
        }
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

        // hold press for cursor
        if (mode == MODE.CURSOR) {
            this.hold = true
            return
        }

        // insert vertex to local buffer
        buf.push(normalizeX(canvas, x))
        buf.push(normalizeY(canvas, y))

        var shape
        var color = this.observer.getColor()

        if (mode == MODE.LINE) {
            shape = SHAPE.LINE
            // finish line
            if (buf.length == 4) {
                this.observer.putDrawing(buf, shape, color)
                this.buf = []
            }
        } else if (mode == MODE.SQUARE) {
            shape = SHAPE.SQUARE
            // finish square
            if (buf.length == 4) {
                this.observer.putDrawing(
                    createSquare(buf.slice(2, 4), buf.slice(0, 2)),
                    shape,
                    color,
                )
                this.buf = []
            }
        } else if (mode == MODE.POLYGON) {
            shape = SHAPE.LINE
            if (buf.length > 4) {
                shape = SHAPE.POLYGON
                let length = buf.length
                if (isClose(buf.slice(0, 2), buf.slice(length - 2, length))) {
                    this.observer.putDrawing(
                        buf.slice(0, buf.length - 2),
                        shape,
                        color,
                    )
                    this.buf = []
                }
            }
        }
        if (this.buf) this.draw(shape, this.buf, color)
    }

    processMouseMove(event) {
        // simplify variables
        var canvas = this.canvas
        var buf = this.buf

        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        var coord = [normalizeX(canvas, x), normalizeY(canvas, y)]
        if (mode == MODE.CURSOR) return this.processCursor(coord)

        var shape
        var total_vertices = this.buf

        if (mode == MODE.LINE) {
            // create line
            shape = SHAPE.LINE
            total_vertices = total_vertices.concat(coord)
        } else if (mode == MODE.SQUARE) {
            // create square
            shape = SHAPE.SQUARE
            total_vertices = createSquare(coord, buf)
        } else if (mode == MODE.POLYGON) {
            shape = SHAPE.POLYGON
            if (buf.length < 4) {
                shape = SHAPE.LINE
            }
            total_vertices = total_vertices.concat(coord)
        }

        // draw to canvas
        var shadowColor = shadow(this.observer.getColor())
        this.draw(shape, total_vertices, shadowColor)
        // this.draw(shape, total_vertices, this.observer.getColor())
    }

    draw(shape, vertices, color) {
        // simplify variables
        var gl = this.gl
        var shaderProgram = this.shaderProgram

        // duplicate color (1 color for each entity) - we want to avoid gradient (increase of complexity)
        var colors = []
        for (var i = 0; i < vertices.length / 2; i++) colors = colors.concat(color)

        // create buffer for vertex & color - for shaders
        var vertex_buffer = createBuffer(gl, vertices)
        var color_buffer = createBuffer(gl, colors)

        // bind buffer to attribute in shaders
        bindBuffer(gl, shaderProgram, color_buffer, 3, 'color')
        bindBuffer(gl, shaderProgram, vertex_buffer, 2, 'vPosition')

        // bind
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

        // Enable the depth test
        gl.enable(gl.DEPTH_TEST)

        // Draw the entity
        gl.drawArrays(convertToGLMODE(shape), 0, vertices.length / 2)
    }

    processCursor(coord) {
        if (!this.hold) return this.observer.findV(coord)

        if (this.binding.length == 0 || this.binding[1] == -1) return
        var v_num = this.binding[1]
        var entity = this.binding[0]
        var total_vertices, s

        if (entity.shape == SHAPE.LINE) {
            // get vertex selection
            s = (v_num * 2 + 2) % entity.vertices.length
            total_vertices = coord.concat(entity.vertices.slice(s, s + 2))
        } else if (entity.shape == SHAPE.SQUARE) {
            // get vertex selection
            s = (v_num * 2 + 4) % entity.vertices.length
            total_vertices = createSquare(coord, entity.vertices.slice(s, s + 2))
        } else if (entity.shape == SHAPE.POLYGON) {
            // get vertex selection
            s = (v_num * 2 + 2) % entity.vertices.length
            total_vertices = entity.vertices
                .slice(0, v_num * 2)
                .concat(coord)
                .concat(entity.vertices.slice(s))
        }
        if (this.observer.main.editMode == EDITMODE.RESIZE && mode == MODE.CURSOR) {
            this.draw(entity.shape, total_vertices, entity.color)
        }
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
