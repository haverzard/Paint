class Observer {
    constructor() {
        this.main = new MainView()
        this.shadow = new ShadowView(this)    
    }

    putDrawing(buf, gl_mode) {
        this.main.bank.addEntity(new Entity(this.main.getVertices().length/2, buf, gl_mode))
        this.main.draw()
    }

    clearCanvas() {
        this.shadow.buf = []
        this.shadow.clear()
        this.main.bank.entities = []
        this.main.clear()
    }
}