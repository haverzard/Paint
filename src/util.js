const MODE = Object.freeze({"CURSOR": 0, "LINE": 1, "SQUARE": 2, "POLYGON": 3})
var mode = MODE.CURSOR

function switchMode(new_mode) {
    mode = new_mode
    observer.clearShadow()
}

function getGL(canvas) {
    var gl = canvas.getContext("webgl")
    if (!gl) {
        gl = canvas.getContext("experimental-webgl")
        if (!gl) alert("Your browser doesn't support WebGL")
        console.log("[Paint] Using experimental WebGL")
    }
    return gl
}