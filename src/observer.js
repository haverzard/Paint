class Observer {
    constructor() {
        this.main = new MainView()
        this.shadow = new ShadowView(this)    
    }

    putDrawing(buf, gl_mode, color) {
        // insert entity to bank
        this.main.bank.addEntity(new Entity(this.main.getVertices().length/2, buf, gl_mode, color))
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
        var color = parseInt(document.getElementById("color-picker").value.substr(1, 6), 16)
        // var opacity = document.getElementById("opacity-slider").value
        return [Math.floor(color / 65536)/255, Math.floor((color % 65536) / 256)/255, (color % 256)/255, 1.0]
    }

    findV(coord) {
        this.clearShadow()
        this.shadow.unbindCursor()
        var entities = this.main.bank.entities.reverse()
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].gl_mode == this.main.gl.LINES) {
                // line
                for (var v = 0; v < 2; v++) {
                    if (isClose(coord, entities[i].vertices.slice(v*2, v*2 + 2))) {
                        this.shadow.draw(entities[i].gl_mode, entities[i].vertices, [1,1,1,1])
                        this.shadow.bindCursor(entities[i], v)
                        return
                    }
                }
            } else if (entities[i].gl_mode == this.main.gl.TRIANGLE_STRIP) {
                // square
            } else if (entities[i].gl_mode == this.main.gl.TRIANGLE_FAN) {
                // polygon
            }
        }
    }

    loadModel(file) {
        var draw = () => this.main.draw()
        this.main.bank.loadFromFile(file, draw)
    }
}