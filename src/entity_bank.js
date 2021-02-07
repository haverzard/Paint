class EntityBank {
    constructor() {
        this.entities = []
    }
 
    addEntity(entity) {
        this.entities.push(entity)
    }

    loadFromFile(file, callback) {
        try {
            const reader = new FileReader(file)
            reader.addEventListener("load", (e) => {
                this.entities = JSON.parse(e.target.result)["entities"]
                callback()
            })
            reader.readAsText(file)
        } catch {
            console.log("Please use valid model file.")
        }
    }

    saveToFile() {
        var a = document.createElement("a")
        a.download = "model.json"
        a.href = window.URL.createObjectURL(new Blob([JSON.stringify(this)], { type: "application/json" }))
        a.click()
    }
}