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
        var entities = this.main.bank.entities.reverse()
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].gl_mode == this.main.gl.LINES) {
                // line
            } else if (entities[i].gl_mode == this.main.gl.TRIANGLE_STRIP) {
                // square
            } else if (entities[i].gl_mode == this.main.gl.TRIANGLE_FAN) {
                // polygon
            }
        }
    }
}