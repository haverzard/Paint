function loadShader(gl, vertCoder, fragCoder) {
  var vertShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertShader, vertCoder())
  gl.compileShader(vertShader)

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragShader, fragCoder())
  gl.compileShader(fragShader)

  // create shader program
  var shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertShader)
  gl.attachShader(shaderProgram, fragShader)

  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  return shaderProgram
}
