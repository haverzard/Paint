function clearBank(gl, bank) {
  delete bank.entities
  bank.entities = []
  gl.clearColor(0.5, 0.5, 0.5, 0.9)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

function processMousePress(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  console.log('x: ' + x + ' y: ' + y)
  if (mode == MODE.CURSOR) return

  // buf element value rangin from -1 to 1
  buf.push((x / canvas.width) * 2 - 1)
  buf.push((-y / canvas.height) * 2 + 1)

  var total_vertices = []
  bank.entities.forEach((entity) => {
    total_vertices = total_vertices.concat(entity.vertices)
  })
  var entity
  if (mode == MODE.LINE) {
    entity = new Entity(total_vertices.length / 2, buf, gl.LINES)
    if (buf.length == 4) {
      //buf : [x1,y1,x2,y2]
      console.log(entity.vertices)
      bank.addEntity(entity)
      total_vertices = total_vertices.concat(buf)
      buf = []
    }
  } else if (mode == MODE.SQUARE) {
    entity = new Entity(total_vertices.length / 2, buf, gl.TRIANGLE_STRIP)
    if (buf.length == 4) {
      entity.vertices = [
        buf[0],
        buf[1],
        buf[0],
        buf[3],
        buf[2],
        buf[1],
        buf[2],
        buf[3],
      ]
      bank.addEntity(entity)
      total_vertices = total_vertices.concat(entity.vertices)
      buf = []
    }
  } else if (mode == MODE.POLYGON) {
    entity = new Entity(total_vertices.length / 2, buf, gl.TRIANGLE_STRIP)
    length = buf.length
    // tolerance = 0.02
    tolerance = 0.01
    if (length > 4) {
      console.log(isSamePointWithTolerance(buf[0], buf[length - 2], tolerance))
      console.log(isSamePointWithTolerance(buf[1], buf[length - 1], tolerance))
    }
    if (
      length > 4 &&
      isSamePointWithTolerance(buf[0], buf[length - 2], tolerance) &&
      isSamePointWithTolerance(buf[1], buf[length - 1], tolerance)
    ) {
      entity.vertices = []
      for (let i = 0; i < length; i++) {
        entity.vertices.push(buf[i])
      }
      entity.vertices[length - 2] = buf[0]
      entity.vertices[length - 1] = buf[1]
      bank.addEntity(entity)
      total_vertices = total_vertices.concat(entity.vertices)
      buf = []
    }
  }
  total_vertices = total_vertices.concat(buf)

  draw(canvas, total_vertices, bank.entities)
}

function isSamePointWithTolerance(p1, p2, tolerance) {
  return p2 > p1 - tolerance && p2 < p1 + tolerance
}

window.onload = () => {
  observer = new Observer()
}
