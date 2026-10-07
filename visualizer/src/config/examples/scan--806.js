// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several wraps with uneven widths",
    "input": "{\"widths\":[4,6,8,10,5,7,9,3,4,6,8,10,5,7,9,3,4,6,8,10,5,7,9,3,4,6],\"s\":\"thegardenpathwindsaroundthequietpond\"}"
  },
  {
    "label": "Exact line boundary",
    "input": "{\"widths\":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],\"s\":\"abcdefghij\"}"
  },
  {
    "label": "One character beyond full line",
    "input": "{\"widths\":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],\"s\":\"abcdefghijk\"}"
  },
  {
    "label": "Single narrow letter",
    "input": "{\"widths\":[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],\"s\":\"q\"}"
  }
];
