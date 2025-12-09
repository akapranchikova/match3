import "./styles.scss"

import Alpine from "alpinejs"
import { appStore } from "./stores/app.js"

Alpine.store("app", appStore)
Alpine.start()

const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty("--app-height", `${window.innerHeight}px`)
}
window.addEventListener("resize", appHeight)
appHeight()
