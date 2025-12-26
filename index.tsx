import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css" // Added index.css import for Tailwind styles
import App from "./App"

/**
 * SG NEURAL CORE: Service Worker Registration
 * Optimized for standalone deployment and offline reliability.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    try {
      const swUrl = "service-worker.js"

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("SG Neural Core: Service Worker Synchronized", registration.scope)
        })
        .catch((err) => {
          console.debug("SG Neural Core: SW restricted by sandbox environment.")
        })
    } catch (e) {
      console.debug("SG Neural Core: SW initialization bypassed.")
    }
  })
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Critical Fault: Root element mapping failed.")
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
