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

const suggestionsList = document.getElementById("suggestions");
const proxySuggestionAPI = "https://proxyforsug.blitzedzzontoppoihsblitzedzzontoppoihs.workers.dev/?q=";

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
    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

window.addEventListener("load", initializeProxy);

// fetch autocomplete suggestions
async function fetchSuggestions(query) {
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }
  try {
    let res = await fetch(proxySuggestionAPI + encodeURIComponent(query));
    let data = await res.json();

    // google suggestion API returns [["query", ["suggest1","suggest2",...]]]
    let suggestions = data[1];
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
      address.value = s;
      suggestionsList.innerHTML = "";
      submitProxySearch();
    });

    suggestionsList.appendChild(li);
  });
}

address.addEventListener("address", () => {
  fetchSuggestions(address.value);
});

address.addEventListener("blur", () => {
  setTimeout(() => (suggestionsList.innerHTML = ""), 200);
});

async function submitProxySearch() {
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
  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitProxySearch();
});
