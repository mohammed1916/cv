// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Supported entities mix with unchanged text",
    "input": "{\"text\":\"Cedar &amp; pine: &quot;green&quot; &lt; blue &gt; gray &frasl; white\"}"
  },
  {
    "label": "Decoded ampersand must not trigger another pass",
    "input": "{\"text\":\"&amp;gt; and &amp;lt;\"}"
  },
  {
    "label": "Unknown entity remains literal",
    "input": "{\"text\":\"Keep &tree; and &unknown; as written\"}"
  },
  {
    "label": "Apostrophe and a trailing ampersand",
    "input": "{\"text\":\"It&apos;s quiet &\"}"
  }
];
