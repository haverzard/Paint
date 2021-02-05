function getGL(canvas) {
    var gl = canvas.getContext("webgl")
    if (!gl) {
        gl = canvas.getContext("experimental-webgl")
        if (!gl) alert("Your browser doesn't support WebGL")
        console.log("[Paint] Using experimental WebGL")
    }
    return gl
}