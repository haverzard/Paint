const SCREEN_RESOLUTION = 5
const MODE = Object.freeze({ CURSOR: 0, LINE: 1, SQUARE: 2, POLYGON: 3 })
var mode = MODE.CURSOR

function normalizeX(canvas, x) {
  return x * SCREEN_RESOLUTION * 2 / canvas.width - SCREEN_RESOLUTION
}

function normalizeY(canvas, y) {
  return - y * SCREEN_RESOLUTION * 2 / canvas.height + SCREEN_RESOLUTION
}

function clearBank() {
  observer.clearCanvas()
}

function saveModel() {
  observer.main.bank.saveToFile()
}

function switchMode(new_mode) {
  mode = new_mode
  observer.clearShadow()
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
    Math.min(Math.abs(1 - p2[1] - 2 * neg[1]), Math.abs(p1[0] - p2[0])),
    Math.min(Math.abs(1 - p2[0] - 2 * neg[0]), Math.abs(p1[1] - p2[1])),
  )
  // calculate vertex
  var temp_buf = [p2[0] + d * (1 - neg[0] * 2), p2[1] + d * (1 - neg[1] * 2)]
  return [
    p2[0],
    p2[1],
    p2[0],
    temp_buf[1],
    temp_buf[0],
    p2[1],
    temp_buf[0],
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

function convertToShape(gl_mode) {
  if (gl_mode == 1) return "line"
  else if (gl_mode == 5) return "square"
  else return "polygon"
}

function convertToGLMODE(shapeType) {
  if (shapeType == "line") return 1
  else if (shapeType == "square") return 5
  else return 6
}

function validPoints(points) {
  for (var i = 0; i < points.length; i++) {
    let p = points[i]
    if (p[0] > 1.0 || p[0] < 0.0 || p[1] > 1.0 || p[1] < 0.0) return false
  }
  return true
}

function validColor(color) {
  let colors = ["RED", "GREEN", "BLUE"]
  for (var i = 0; i < 3; i++) {
    let c = colors[i]
    if (!color[c] || color[c] < 0.0 || color > 1.0) return false
  }
  return true
}

function isSamePointWithTolerance(p1, p2, tolerance) {
  return p2 > p1 - tolerance && p2 < p1 + tolerance
}

function isClose(p1, p2) {
  return (
    isSamePointWithTolerance(p1[0], p2[0], SCREEN_RESOLUTION/100.0) &&
    isSamePointWithTolerance(p1[1], p2[1], SCREEN_RESOLUTION/100.0)
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