// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different repeat counts share a longer base",
    "input": "{\"str1\":\"CEDARCEDARCEDARCEDAR\",\"str2\":\"CEDARCEDARCEDAR\"}"
  },
  {
    "label": "Concatenations disagree",
    "input": "{\"str1\":\"MOSS\",\"str2\":\"MOST\"}"
  },
  {
    "label": "Single-letter repeating base",
    "input": "{\"str1\":\"ZZZZZZ\",\"str2\":\"ZZZZ\"}"
  },
  {
    "label": "Equal strings return the whole string",
    "input": "{\"str1\":\"FOREST\",\"str2\":\"FOREST\"}"
  }
];
