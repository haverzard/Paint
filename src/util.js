const SCREEN_RESOLUTION = 5
const ASPECT_RATIO = window.innerWidth / window.innerHeight
const MODE = Object.freeze({ CURSOR: 0, LINE: 1, SQUARE: 2, POLYGON: 3 })
const SHAPE = Object.freeze({ LINE: 1, SQUARE: 2, POLYGON: 3 })
const EDITMODE = Object.freeze({ RESIZE: 0, RECOLOR: 1 })
var mode = MODE.CURSOR

function normalizeX(canvas, x) {
    return (x * SCREEN_RESOLUTION * 2) / canvas.width - SCREEN_RESOLUTION
}

function normalizeY(canvas, y) {
    return (-y * SCREEN_RESOLUTION * 2) / canvas.height + SCREEN_RESOLUTION
}

function clearBank() {
    observer.clearCanvas()
}

function saveModel() {
    observer.main.bank.saveToFile()
}

function switchMode(newMode) {
    var btnContainer = document.getElementById('myDIV')
    var btns = btnContainer.getElementsByClassName('btn')
    btns[mode].classList.toggle('active')
    btns[newMode].classList.toggle('active')
    mode = newMode
    observer.clearShadow()
}

function toggleEditMode() {
    observer.changeEditMode()
    const cur_mode = observer.main.editMode
    const toggle_btn = document.getElementById('edit-toggle-btn')
    if (toggle_btn) {
        if (cur_mode === EDITMODE.RESIZE) {
            toggle_btn.innerHTML = 'Resize Mode'
        } else {
            toggle_btn.innerHTML = 'Recolor Mode'
        }
    }
}

function getGL(canvas) {
    var gl = canvas.getContext('webgl')
    if (!gl) {
        gl = canvas.getContext('experimental-webgl')
        if (!gl) alert("Your browser doesn't support WebGL")
        console.log('[Paint] Using experimental WebGL')
    }
    return gl
}

function createSquare(p1, p2) {
    // direction
    var neg = [p1[0] - p2[0] < 0, p1[1] - p2[1] < 0]
    // calculate max distance
    // make sure it's within the canvas
    var d = Math.max(
        Math.min(
            Math.abs(SCREEN_RESOLUTION - p2[1] - SCREEN_RESOLUTION * 2 * neg[1]) / ASPECT_RATIO,
            Math.abs(p1[0] - p2[0]),
        ),
        Math.min(
            Math.abs(SCREEN_RESOLUTION - p2[0] - SCREEN_RESOLUTION * 2 * neg[0]),
            Math.abs(p1[1] - p2[1]) / ASPECT_RATIO,
        ),
    )
    // calculate vertex
    var temp_buf = [p2[0] + d * (1 - neg[0] * 2), p2[1] + d * (1 - neg[1] * 2) * ASPECT_RATIO]
    return [
        p2[0],
        p2[1],
        temp_buf[0],
        p2[1],
        temp_buf[0],
        temp_buf[1],
        p2[0],
        temp_buf[1],
    ]
}

function convertToPoints(vertices) {
    let points = []
    for (let i = 0; i < vertices.length; i += 2) {
        points.push([vertices[i], vertices[i + 1]])
    }
    return points
}

function convertToVertices(points) {
    let vertices = []
    for (let i = 0; i < points.length; i++) {
        vertices = vertices.concat(points[i])
    }
    return vertices
}

function convertShapeToStr(shape) {
    if (shape == SHAPE.LINE) return 'line'
    else if (shape == SHAPE.SQUARE) return 'square'
    else if (shape == SHAPE.POLYGON) return 'polygon'
    else return -1
}

function convertStrToShape(shape) {
    if (shape == 'line') return SHAPE.LINE
    else if (shape == 'square') return SHAPE.POLYGON
    else if (shape == 'polygon') return SHAPE.POLYGON
    else return -1
}

function convertToGLMODE(shape) {
    if (shape == SHAPE.LINE) return 1
    else if (shape == SHAPE.SQUARE) return 6
    else if (shape == SHAPE.POLYGON) return 6
    else return -1
}

function validPoints(points) {
    for (var i = 0; i < points.length; i++) {
        let p = points[i]
        if (
            p[0] > SCREEN_RESOLUTION ||
            p[0] < -SCREEN_RESOLUTION ||
            p[1] > SCREEN_RESOLUTION ||
            p[1] < -SCREEN_RESOLUTION
        )
            return false
    }
    return true
}

function validColor(color) {
    let colors = ['RED', 'GREEN', 'BLUE']
    for (var i = 0; i < 3; i++) {
        let c = colors[i]
        if (color[c] === undefined || color[c] < 0.0 || color > 1.0) return false
    }
    return true
}

function isSamePointWithTolerance(p1, p2, tolerance) {
    return p2 > p1 - tolerance && p2 < p1 + tolerance
}

function isClose(p1, p2) {
    return (
        isSamePointWithTolerance(p1[0], p2[0], SCREEN_RESOLUTION / 100.0) &&
        isSamePointWithTolerance(p1[1], p2[1], SCREEN_RESOLUTION / 100.0)
    )
}

/* Polygon cursor detection */
function onSegment(p, q, r) {
    if (
        q[0] <= Math.max(p[0], r[0]) &&
        q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) &&
        q[1] >= Math.min(p[1], r[1])
    ) {
        return true
    } else {
        return false
    }
}

// return 0 : Colinear Points
// return 1 : Clockwise points
// return 2 : Counterclockwise points
// See https://www.geeksforgeeks.org/orientation-3-ordered-points/amp/
function orient(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
    if (val > 0) {
        return 1
    }
    if (val < 0) {
        return 2
    }
    return 0
}

function doIntersect(p1, q1, p2, q2) {
    const o1 = orient(p1, q1, p2)
    const o2 = orient(p1, q1, q2)
    const o3 = orient(p2, q2, p1)
    const o4 = orient(p2, q2, q1)
    if (o1 !== o2 && o3 !== o4) {
        return true
    }
    if (o1 === 0 && onSegment(p1, p2, q1)) {
        return true
    }
    if (o2 === 0 && onSegment(p1, q2, q1)) {
        return true
    }
    if (o3 === 0 && onSegment(p2, p1, q2)) {
        return true
    }
    if (o4 === 0 && onSegment(p2, q1, q2)) {
        return true
    }
    return false
}

function isVInside(vertices, p) {
    const points = convertToPoints(vertices)
    const n = points.length
    if (n < 3) {
        return false
    }
    const extreme = [Number.MAX_SAFE_INTEGER, p[1]]
    let count = 0
    let i = 0

    while (true) {
        let next = (i + 1) % n
        if (doIntersect(points[i], points[next], p, extreme)) {
            if (orient(points[i], p, points[next]) === 0) {
                return onSegment(points[i], p, points[next])
            }
            count += 1
        }
        i = next
        if (i === 0) {
            break
        }
    }
    return count % 2 == 1
}

function toggleHelpMenu() {
    const helpMenu = document.getElementById('help')
    if (helpMenu) {
        helpMenu.classList.toggle('hide-menu')
    }
}

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

function getLuminance(r, g, b) {
    return (r + r + b + g + g + g) / 6
}

function HSLtoRGB(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s
    var h1 = h / 60
    var x = c * (1 - Math.abs(h1 % 2 - 1))

    var r1
    var g1
    var b1
    if (0 <= h1 && h1 <= 1) {
        r1 = c; g1 = x; b1 = 0;
    } else if (1 <= h1 && h1 <= 2) {
        r1 = x; g1 = c; b1 = 0;
    } else if (2 <= h1 && h1 <= 3) {
        r1 = 0; g1 = c; b1 = x;
    } else if (3 <= h1 && h1 <= 4) {
        r1 = 0; g1 = x; b1 = c;
    } else if (4 <= h1 && h1 <= 5) {
        r1 = x; g1 = 0; b1 = c;
    } else if (5 <= h1 && h1 <= 6) {
        r1 = c; g1 = 0; b1 = x;
    } else {
        r1 = 0; g1 = 0; b1 = 0;
    }
    var m = l - (c / 2)
    return [r1 + m, g1 + m, b1 + m]
}


function RGBtoHSL(r, g, b) {
    var xmax = Math.max(r, g, b)
    var xmin = Math.min(r, g, b)
    var c = xmax - xmin
    var l = (xmax + xmin) / 2
    var h
    if (c == 0) {
        h = 0
    } else if (xmax == r) {
        h = 60 * (0 + ((g - b) / c))
    } else if (xmax == g) {
        h = 60 * (2 + ((b - r) / c))
    } else if (xmax == b) {
        h = 60 * (4 + ((r - g) / c))
    }
    var s = (l == 0 || l == 1) ? 0 : c / (1 - Math.abs(2 * xmax - c - 1))
    return [h, s, l]
}

function mask(color) {
    var r = color[0]
    var g = color[1]
    var b = color[2]
    var hsl = RGBtoHSL(r, g, b)
    var h = hsl[0]
    var s = hsl[1]
    var l = hsl[2]
    l += l > 0.5 ? -0.8 : 0.7 - l
    var rgb = HSLtoRGB(h, s, l)
    r = rgb[0]
    g = rgb[1]
    b = rgb[2]
    return [r, g, b]
}

function shadow(color) {
    var r = color[0]
    var g = color[1]
    var b = color[2]
    var hsl = RGBtoHSL(r, g, b)
    var h = hsl[0]
    var s = hsl[1]
    var l = hsl[2]
    if (l > 0.7) {
        l += -l + 0.2
        var rgb = HSLtoRGB(h, s, l)
        r = rgb[0]
        g = rgb[1]
        b = rgb[2]
        return [r, g, b]
    } else {
        return color
    }
}