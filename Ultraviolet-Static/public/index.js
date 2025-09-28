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
    await ensureTransportReady();  // <-- wait safely before sending

    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

window.addEventListener("load", initializeProxy);

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("uv-address");
  const suggestionsList = document.getElementById("suggestions");
  const form = document.getElementById("uv-form");
  const proxySuggestionAPI = "https://proxyforsug.blitzedzzontoppoihsblitzedzzontoppoihs.workers.dev/?q=";

  async function fetchSuggestions(query) {
    if (!query) {
      suggestionsList.innerHTML = "";
      return;
    }
    try {
      let res = await fetch(proxySuggestionAPI + encodeURIComponent(query));
      let data = await res.json();
      let suggestions = data[1] || [];
      renderSuggestions(suggestions);
    } catch (err) {
      console.error("Suggestion fetch failed:", err);
    }
  }

  function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = "";
    if (!suggestions.length) return;

    suggestions.forEach(s => {
      let li = document.createElement("li");
      li.textContent = s;
      li.addEventListener("click", () => {
        input.value = s;
        suggestionsList.innerHTML = "";
        submitProxySearch();
      });
      suggestionsList.appendChild(li);
    });
  }

  input.addEventListener("input", () => {
    fetchSuggestions(input.value);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => (suggestionsList.innerHTML = ""), 200);
  });

async function waitForWebSocketReady(ws, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    
    const timer = setTimeout(() => reject(new Error("WebSocket not ready")), timeout);
    
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve();
    });

    ws.addEventListener("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
async function ensureTransportReady() {
  let ws = connection._ws;

  // wait until websocket exists
  while (!ws) {
    await new Promise(r => setTimeout(r, 50));
    ws = connection._ws;
  }

  // wait until websocket is open
  while (ws.readyState !== WebSocket.OPEN) {
    await new Promise(r => setTimeout(r, 50));
  }

  // now safe to call getTransport and setTransport
  if (await connection.getTransport() !== "/epoxy/index.mjs") {
    await connection.setTransport("/epoxy/index.mjs", [{ wisp: (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/" }]);
  }
}

async function submitProxySearch() {
  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  document.querySelectorAll(".suggestions-list").forEach(el => el.style.display = "none");

  const url = search(input.value, searchEngine.value);
  let frame = document.getElementById("uv-frame");
  frame.style.display = "block";

  await ensureTransportReady();  // <-- wait safely before sending

  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitProxySearch();
});
});





