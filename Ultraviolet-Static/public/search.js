"use strict";

/**
 * Converts input into a fully qualified URL or a search query URL.
 * @param {string} input - User input, could be a URL or search query.
 * @param {string} template - Template for a search query (e.g., "https://google.com/search?q=%s").
 * @returns {string} Fully qualified URL or a search query URL.
 */
function search(input, template) {
  try {
    // Input is a valid URL
    return new URL(input).toString();
  } catch (err) {
    // Input is not a valid URL
  }

  try {
    // Input is a valid URL when prefixed with http://
    const url = new URL(`http://${input}`);
    if (url.hostname.includes(".")) return url.toString(); // Ensure it has a valid hostname
  } catch (err) {
    // Input is still not valid as a URL
  }

  // Treat input as a search query
  return template.replace("%s", encodeURIComponent(input));
}

// Helper to get query parameters
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// Function to process the URL and update the iframe
async function processUrl(input) {
  const template = searchEngine.value || "https://www.google.com/search?q=%s"; // Default search engine
  const url = search(input, template);

  let frame = document.getElementById("uv-frame");
  frame.style.display = "block";

  try {
    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    if (await connection.getTransport() !== "/epoxy/index.mjs") {
      await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }

    // Add a unique query parameter to ensure a new URL each time
    const uniqueUrl = `${__uv$config.prefix + __uv$config.encodeUrl(url)}?unique=${Date.now()}`;
    frame.src = uniqueUrl;
  } catch (err) {
    error.textContent = "Failed to process the URL.";
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
  await processUrl(address.value);
});

// Initialize proxy on page load if a URL is provided in the query
window.addEventListener("load", async () => {
  const proxiedUrl = getQueryParam("url");
  if (proxiedUrl) {
    try {
      await registerSW();
    } catch (err) {
      error.textContent = "Failed to register service worker.";
      errorCode.textContent = err.toString();
      throw err;
    }
    await processUrl(proxiedUrl);
  }
});
