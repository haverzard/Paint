var vertices = []

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    var gl = window.gl
    var shaderProgram = window.shaderProgram
    console.log("x: " + x + " y: " + y)
    // vertices.push(1.0)
    // vertices.push(1.0)
    console.log(canvas.width)
    vertices.push(x/canvas.width*2-1)
    vertices.push(((-y/canvas.height*2)+1))
    console.log(vertices)

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
    var coord = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    // gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    // var colorRGBA = gl.getAttribLocation(shaderProgram, "color");
    // gl.vertexAttribPointer(colorRGBA, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(colorRGBA);

    /* Step5: Drawing the required object (triangle) */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

    // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 0.9)

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST)

    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Set the view port
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Draw the triangle
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/2)
}

window.onload = () => {
    // init canvas
    var canvas = document.getElementById("gl-view")
    canvas.width = window.innerHeight * 0.95
    canvas.height = window.innerHeight * 0.95
    canvas.addEventListener('mousedown', function(e) {
        getCursorPosition(canvas, e)
    })

    // get GL context
    var gl = getGL(canvas)
    window.gl = gl

    // init GL
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.5, 0.5, 0.5, 0.9)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // load shader
    window.shaderProgram = loadShader(gl)
}