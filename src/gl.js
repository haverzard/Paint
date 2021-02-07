var observer

function clearBank() {
    observer.clearCanvas()
}

function isSamePointWithTolerance(p1, p2, tolerance) {
    return p2 > p1 - tolerance && p2 < p1 + tolerance
}

window.onload = () => {
    var canvasBg = document.getElementById("canvas-background")
    canvasBg.style.minWidth = window.innerHeight * 0.95 + "px"
    canvasBg.style.minHeight = window.innerHeight * 0.95 + "px"
    observer = new Observer()
}

window.onkeydown = (e) => {
    var code = e.keyCode
    if (code == 27) {
        observer.clearShadow()
    }
}