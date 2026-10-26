// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Ordered vowel runs reset after descending transitions",
    "input": "{\"word\":\"aaeeeiioouuuaaeiioouuuuueaaeiou\"}"
  },
  {
    "label": "One vowel type cannot qualify",
    "input": "{\"word\":\"uuuuuuu\"}"
  },
  {
    "label": "All five appear in wrong order",
    "input": "{\"word\":\"uoiea\"}"
  },
  {
    "label": "Shortest complete ordered run",
    "input": "{\"word\":\"aeiou\"}"
  }
];
