"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// Helper to get query parameters
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}
async function ensureTransportReady() {
  let ws = connection._ws;
  setInterval(() => console.log("connection._ws =", connection._ws), 500);

  console.log("[DEBUG] Starting ensureTransportReady...");

  // wait until websocket exists
  while (!ws) {
    console.log("[DEBUG] Waiting for WebSocket to initialize...");
    await new Promise(r => setTimeout(r, 50));
    ws = connection._ws;
  }
  console.log("[DEBUG] WebSocket exists:", ws);

  // wait until websocket is open
  while (ws.readyState !== WebSocket.OPEN) {
    console.log("[DEBUG] WebSocket readyState:", ws.readyState, "(waiting for OPEN)");
    await new Promise(r => setTimeout(r, 50));
  }
  console.log("[DEBUG] WebSocket is open!");

  // now safe to call getTransport and setTransport
  const currentTransport = await connection.getTransport();
  console.log("[DEBUG] Current transport:", currentTransport);

  if (currentTransport !== "/epoxy/index.mjs") {
    console.log("[DEBUG] Setting transport to /epoxy/index.mjs...");
    await connection.setTransport("/epoxy/index.mjs", [{
      wisp: (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/"
    }]);
    console.log("[DEBUG] Transport set successfully!");
  } else {
    console.log("[DEBUG] Transport already set correctly.");
  }

  console.log("[DEBUG] ensureTransportReady finished.");
}

// Function to set up the iframe based on query parameter
async function initializeProxy() {
    const proxiedUrl = getQueryParam("url");
    if (!proxiedUrl) {
        error.textContent = "PRO TIP:";
        errorCode.textContent = "You can use the format: ?url=<link> to ₱rox¥ links within the search bar";
        return;
    }

    let frame = document.getElementById("uv-frame");
    frame.style.display = "block";

    try {
        let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
        if (await connection.getTransport() !== "/epoxy/index.mjs") {
            await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
        }
        frame.src = __uv$config.prefix + __uv$config.encodeUrl(proxiedUrl);
    } catch (err) {
        error.textContent = "Failed to initialize proxy.";
        errorCode.textContent = err.toString();
        throw err;
    }
}

// Event listener for manual form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        throw err;
    }

    const url = search(address.value, searchEngine.value);

    let frame = document.getElementById("uv-frame");
    frame.style.display = "block";
    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    if (await connection.getTransport() !== "/epoxy/index.mjs") {
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }
    //await ensureTransportReady();
    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

// Initialize proxy on page load if a URL is provided in the query
window.addEventListener("load", initializeProxy);


// Event listener for manual form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submitted manually");

    try {
        await registerSW();
        console.log("Service worker registered successfully");
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        console.error("SW registration failed:", err);
        throw err;
    }

    const url = search(address.value, searchEngine.value);
    console.log("Searching for URL:", url);

    let frame = document.getElementById("uv-frame");
    frame.style.display = "block";

    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    if (await connection.getTransport() !== "/epoxy/index.mjs") {
        console.log("Transport mismatch, setting transport before manual submit...");
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }

    console.log("Ensuring transport is ready before iframe load...");
    //await ensureTransportReady();

    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    console.log("Iframe src updated for manual submit:", frame.src);
});

window.addEventListener("load", () => {
    console.log("Window loaded, initializing proxy...");
    initializeProxy().catch(err => console.error("Initialize proxy error:", err));
});
