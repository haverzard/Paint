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

window.onload = () => {
    observer = new Observer()
}