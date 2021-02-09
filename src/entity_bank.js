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
      reader.addEventListener('load', (e) => {
        let entities = JSON.parse(e.target.result)['entities']
        let new_entities = []
        entities.forEach((ent) => {
          if (!validColor(ent.color)) throw Error("Bad color")
          if (!validPoints(ent.vertices)) throw Error("Bad points")
          console.log(convertToVertices(ent.vertices))
          new_entities.push(new Entity(
            ent.offset,
            convertToVertices(ent.vertices),
            convertToGLMODE(ent.type),
            [ent.color["RED"], ent.color["GREEN"], ent.color["BLUE"]],
          ))
        })
        this.entities = new_entities
        console.log(this.entities)
        callback()
      })
      reader.readAsText(file)
    } catch {
      console.log('Please use valid model file.')
    }
  }

  beautify() {
    let data = {"entities": []}
    this.entities.forEach((e) => {
      data["entities"].push({
        "offset": e.offset,
        "type": convertToShape(e.gl_mode),
        "color": {
          "RED": e.color[0],
          "GREEN": e.color[1],
          "BLUE": e.color[2],
        },
        "vertices": convertToPoints(e.vertices),
      })
    })
    return data
  }

  saveToFile() {
    var a = document.createElement('a')
    a.download = 'model.json'
    a.href = window.URL.createObjectURL(
      new Blob([JSON.stringify(this.beautify(), null, 2)], { type: 'application/json' }),
    )
    a.click()
  }
}
