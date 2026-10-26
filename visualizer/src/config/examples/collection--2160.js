// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Assign small digits to the two tens places",
    "input": "{\"num\":8642}"
  },
  {
    "label": "Two zeros can become leading zeros",
    "input": "{\"num\":9001}"
  },
  {
    "label": "Repeated digits still occupy four positions",
    "input": "{\"num\":7777}"
  },
  {
    "label": "Three zeros leave one single-digit contribution",
    "input": "{\"num\":1000}"
  }
];
