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

function createSquare(p1, p2) {
    // direction
    var neg = [(p1[0] - p2[0]) < 0, (p1[1] - p2[1]) < 0]
    // calculate max distance
    // make sure it's within the canvas
    var d = Math.max(
        Math.min(Math.abs(1 - p2[1] - 2 * neg[1]), Math.abs(p1[0] - p2[0])),
        Math.min(Math.abs(1 - p2[0] - 2 * neg[0]), Math.abs(p1[1] - p2[1]))
    )
    // calculate vertex
    var temp_buf = ([p2[0] + d * (1 - neg[0] * 2), p2[1] + d * (1 - neg[1] * 2)])
    return [p2[0], p2[1], p2[0], temp_buf[1], temp_buf[0], p2[1], temp_buf[0], temp_buf[1]]    
}