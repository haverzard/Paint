var observer

function clearBank() {
  observer.clearCanvas()
}

function saveModel() {
  observer.main.bank.saveToFile()
}

function isSamePointWithTolerance(p1, p2, tolerance) {
  return p2 > p1 - tolerance && p2 < p1 + tolerance
}

function isClose(p1, p2) {
  return (
    isSamePointWithTolerance(p1[0], p2[0], 0.01) &&
    isSamePointWithTolerance(p1[1], p2[1], 0.01)
  )
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
