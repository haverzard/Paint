function loadShader(gl) {
    // init vertex shader
    var vertCode = `
    attribute vec2 vPosition;
    attribute vec4 color;
    varying vec4 vColor;

    void main() {
        gl_Position = vec4(vPosition, 0.0, 1.0);
        vColor = color;
    }
    `
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode)
    gl.compileShader(vertShader)

    // init fragment shader
    // add vertex color
    var fragCode = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
    `
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShader, fragCode)
    gl.compileShader(fragShader)

    // create shader program
    var shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    return shaderProgram
}