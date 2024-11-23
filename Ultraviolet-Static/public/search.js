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
