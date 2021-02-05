var buf = []
var bank = new EntityBank()
var gl
var shaderProgram

function clearBank() {
    delete bank.entities
    bank.entities = []
    gl.clearColor(0.5, 0.5, 0.5, 0.9)
    gl.clear(gl.COLOR_BUFFER_BIT)
}

function processMousePress(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    if (mode == MODE.CURSOR) return

    buf.push(x/canvas.width*2-1)
    buf.push(((-y/canvas.height*2)+1))

    var total_vertices = []
    bank.entities.forEach((entity) => {
        total_vertices = total_vertices.concat(entity.vertices)
    })
    var entity
    if (mode == MODE.LINE) {
        entity = new Entity(total_vertices.length/2, buf, gl.LINES)
        if (buf.length == 4) {
            console.log(entity.vertices)
            bank.addEntity(entity)
            total_vertices = total_vertices.concat(buf)
            buf = []
        }
    } else if (mode == MODE.SQUARE) {
        entity = new Entity(total_vertices.length/2, buf, gl.TRIANGLE_STRIP)
        if (buf.length == 4) {
            entity.vertices = [buf[0], buf[1], buf[0], buf[3], buf[2], buf[1], buf[2], buf[3]]
            bank.addEntity(entity)
            total_vertices = total_vertices.concat(entity.vertices)
            buf = []
        }
    } else if (mode == MODE.POLYGON) {
        entity = new Entity(total_vertices.length/2, buf, gl.TRIANGLE_STRIP)
    }
    total_vertices = total_vertices.concat(buf)

    draw(canvas, total_vertices, bank.entities)
}

function draw(canvas, vertices, entities) {
    // add to buffer
    var vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    // var color_buffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW)
    // gl.bindBuffer(gl.ARRAY_BUFFER, null)

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
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

    // Clear the canvas

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST)

    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Set the view port
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Draw the triangle
    entities.forEach((entity) => {
        gl.drawArrays(entity.gl_mode, entity.offset, entity.vertices.length/2)
    })
}

window.onload = () => {
    // init canvas
    var canvas = document.getElementById("gl-view")
    canvas.width = window.innerHeight * 0.95
    canvas.height = window.innerHeight * 0.95
    canvas.addEventListener('mousedown', (e) => processMousePress(canvas, e))

    // get GL context
    gl = getGL(canvas)

    // init GL
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.5, 0.5, 0.5, 0.9)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // load shader
    shaderProgram = loadShader(gl)
}