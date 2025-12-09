// it was harder than i think
// one gesture cancel other with debounce
// scale is simple and center is center of image
import TheFinger from "the-finger"

// const parentElement = document.getElementById("video-container")

// if (parentElement === undefined)
const parentElement = document.getElementById("img-container")
// const element = document.getElementById("video-to-play")
// if (element === undefined)
const element = document.getElementById("img-to-play")

const finger = new TheFinger(parentElement, {
  preventDefault: false,
  visualize: false,
})

// State
let scale = 1
let x = 0
let y = 0
let gap = 10
let baseScale, baseX, baseY
let isScaling = false // Is the pinch gesture active?
let isDragging = false // Is the drag gesture active?

// Minimum constraint only
const rect = element.getBoundingClientRect()
const minScale = window.innerWidth / rect.width
const maxScale = (window.innerWidth / rect.width) * 10

function update() {
  element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`

  const points = document.querySelectorAll(".point")
  points.forEach((element) => {
    // element.style.transform = `scale(${scale / 2.9 > 1 ? 2 / scale : 1})`
  })

  element.dataset.scaled = scale.toString()
  element.dataset.xcoord = x.toString()

  // const debug = document.getElementById("debug-zoom")
  // debug.innerHTML = "x: " + x + ", y: " + y
}

// Save base on touch start
parentElement.addEventListener("touchstart", () => {
  if (element.dataset.xcoord !== undefined)
    x = Math.round(parseInt(element.dataset.xcoord))

  baseX = x
  baseY = y

  if (element.dataset.scaled !== undefined)
    scale = Math.round(parseInt(element.dataset.scaled))

  baseScale = scale
})

let gestureLock = null // 'drag' or 'scale'
let unlockTimeout = null

function lockGesture(type) {
  gestureLock = type
  if (unlockTimeout) clearTimeout(unlockTimeout)
}

function unlockGesture() {
  unlockTimeout = setTimeout(() => {
    gestureLock = null
  }, 100) // debounce time in ms
}

finger.track("drag", (g) => {
  if (gestureLock && gestureLock !== "drag") return // blocked
  lockGesture("drag")

  x = baseX + g.x - g.startX
  y = baseY + g.y - g.startY

  let maxX = (window.innerWidth * scale) / 2 - window.innerWidth / 2

  if (scale > 1 && x < maxX - gap && x > maxX * -1 + gap) update()
})

//let isDoubleTapToggled = true
//finger.track('double-tap', (g) => {
//if (gestureLock && gestureLock !== 'double-tap') return; // blocked
//lockGesture('double-tap');

//let newScale = isDoubleTapToggled ? 5 : 0.2
//let oldScale = isDoubleTapToggled ? 0.2 : 5
//isDoubleTapToggled = !isDoubleTapToggled
//scale = newScale;
//scale = Math.min(Math.max(minScale, baseScale * newScale), maxScale);
//x = baseX * Math.min(Math.max(minScale / baseScale, newScale), maxScale / baseScale);
//y = baseY * Math.min(Math.max(minScale / baseScale, newScale), maxScale / baseScale);
//element.style.transition = '0.5s ease'
//update();
//});

let hintOn = true
function setHintOff() {
  document.getElementById("hintOff")?.click()
  hintOn = false
}
// SCALE
finger.track("pinch-spread", (g) => {
  if (gestureLock && gestureLock !== "scale") return // blocked
  lockGesture("scale")
  scale = Math.min(Math.max(minScale, baseScale * g.scale), maxScale)
  x =
    baseX *
    Math.min(Math.max(minScale / baseScale, g.scale), maxScale / baseScale)
  y =
    baseY *
    Math.min(Math.max(minScale / baseScale, g.scale), maxScale / baseScale)

  // let maxX = (window.innerWidth * scale) / 2 - window.innerWidth / 2
  // if (scale > 1 && x < maxX - gap && x > maxX * -1 + gap) update()
  update()

  if (hintOn) {
    setHintOff()
  }
})

// On touchend → release lock after short debounce
parentElement.addEventListener("touchend", () => {
  baseX = x
  baseY = y
  baseScale = scale
  unlockGesture()
})

update()
