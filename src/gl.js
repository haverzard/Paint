var observer

function createBuffer(gl, data, DataClass=Float32Array, bufferType=gl.ARRAY_BUFFER, draw=gl.DYNAMIC_DRAW) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(bufferType, buffer)
  gl.bufferData(bufferType, new DataClass(data), draw)
  return buffer
}

function bindBuffer(gl, shaderProgram, buffer, dimension, attrName, bufferType=gl.ARRAY_BUFFER, dataType=gl.FLOAT) {
  gl.bindBuffer(bufferType, buffer)
  var attr = gl.getAttribLocation(shaderProgram, attrName)
  gl.vertexAttribPointer(attr, dimension, dataType, false, 0, 0)
  gl.enableVertexAttribArray(attr)
}

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

window.onload = () => {
  var canvasBg = document.getElementById('canvas-background')
  canvasBg.style.minWidth = window.innerHeight * 0.95 + 'px'
  canvasBg.style.minHeight = window.innerHeight * 0.95 + 'px'

  observer = new Observer()

  var fileUploader = document.getElementById('file-uploader')
  fileUploader.onchange = (e) => {
    observer.loadModel(e.target.files[0])
  }
}

window.onkeydown = (e) => {
  var code = e.keyCode
  if (code == 27) {
    observer.clearShadow()
  }
}
