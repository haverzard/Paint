class Observer {
    constructor() {
        this.main = new MainView()
        this.shadow = new ShadowView(this)
    }

    putDrawing(buf, shape, color) {
        // insert entity to bank
        this.main.bank.addEntity(
            new Entity(buf, shape, color),
        )
        // redraw
        this.main.draw()
    }

    clearShadow() {
        this.shadow.buf = []
        this.shadow.clear()
    }

    clearCanvas() {
        this.clearShadow()
        // clear main view
        this.main.bank.entities = []
        this.main.clear()
    }

    getColor() {
        var color = parseInt(
            document.getElementById('color-picker').value.substr(1, 6),
            16,
        )
        return [
            Math.floor(color / 65536) / 255,
            Math.floor((color % 65536) / 256) / 255,
            (color % 256) / 255,
        ]
    }

    findV(coord) {
        var entities = this.main.bank.entities
        for (var i = entities.length - 1; i >= 0; i--) {
            for (var v = 0; v < entities[i].vertices.length / 2; v++) {
                if (isClose(coord, entities[i].vertices.slice(v * 2, v * 2 + 2))) {
                    this.clearShadow()
                    this.shadow.unbindCursor()
                    var maskColor = mask(entities[i].color)
                    this.shadow.draw(entities[i].shape, entities[i].vertices, [
                        maskColor[0],
                        maskColor[1],
                        maskColor[2]
                    ])
                    this.shadow.bindCursor(entities[i], v)
                    return
                }
            }
            // square is polygon, so we can think them as one
            if (entities[i].shape == SHAPE.SQUARE || entities[i].shape == SHAPE.POLYGON) {
                var total_vertices = entities[i].vertices
                if (isVInside(total_vertices, coord)) {
                    // Activate Hover color by adding mask in shadow view
                    var maskColor = mask(entities[i].color)
                    this.shadow.draw(entities[i].shape, entities[i].vertices, [
                        maskColor[0],
                        maskColor[1],
                        maskColor[2]
                    ])
                    this.shadow.bindCursor(entities[i], -1)
                    return
                } else if (
                    this.shadow.binding.length &&
                    entities[i] == this.shadow.binding[0]
                ) { // clear selection
                    this.clearShadow()
                    this.shadow.unbindCursor()
                }
            }
        }
        this.clearShadow()
        this.shadow.unbindCursor()
    }

    loadModel(file) {
        var draw = () => this.main.draw()
        this.main.bank.loadFromFile(file, draw)
    }

    changeEntityColor(entity, color) {
        const entities = this.main.bank.entities
        for (var i = entities.length - 1; i >= 0; i--) {
            if (JSON.stringify(entities[i]) === JSON.stringify(entity)) {
                entities[i].color = [...color]
                this.main.draw()
                return
            }
        }
    }

    changeEditMode() {
        this.main.editMode = (this.main.editMode + 1) % 2
    }
}
