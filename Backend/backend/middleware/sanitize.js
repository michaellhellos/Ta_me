const sanitizeHtml = require("sanitize-html");

/* =========================
   SANITIZE CONFIG
========================= */

const sanitizeConfig = {
    allowedTags: [
        "p", "br", "strong", "b", "em", "i", "u", "s",
        "h1", "h2", "h3",
        "ul", "ol", "li",
        "blockquote", "pre", "code",
        "a", "img",
        "span"
    ],
    allowedAttributes: {
        "a": ["href", "target", "rel"],
        "img": ["src", "alt", "width", "height", "style"],
        "span": ["style"],
        "p": ["style"],
        "*": ["class"]
    },
    allowedSchemes: ["http", "https", "data"],
    allowedStyles: {
        "*": {
            "color": [/.*/],
            "text-align": [/.*/],
            "font-size": [/.*/]
        }
    },
    // Strip all disallowed tags completely (don't keep inner text of scripts)
    disallowedTagsMode: "discard"
};

/* =========================
   SANITIZE FUNCTION
========================= */

function sanitizeContent(html) {
    if (!html || typeof html !== "string") return "";
    return sanitizeHtml(html, sanitizeConfig);
}

module.exports = { sanitizeContent };
