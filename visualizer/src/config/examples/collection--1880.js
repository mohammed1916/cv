// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mapped values include leading zero letters",
    "input": "{\"firstWord\":\"aib\",\"secondWord\":\"bc\",\"targetWord\":\"jd\"}"
  },
  {
    "label": "Zero plus zero",
    "input": "{\"firstWord\":\"aaa\",\"secondWord\":\"a\",\"targetWord\":\"aaaa\"}"
  },
  {
    "label": "Sum does not match",
    "input": "{\"firstWord\":\"bc\",\"secondWord\":\"de\",\"targetWord\":\"fg\"}"
  },
  {
    "label": "Addition carries into another digit",
    "input": "{\"firstWord\":\"jj\",\"secondWord\":\"b\",\"targetWord\":\"baa\"}"
  }
];
