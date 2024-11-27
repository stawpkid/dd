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
    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

// Initialize proxy on page load if a URL is provided in the query
window.addEventListener("load", initializeProxy);
