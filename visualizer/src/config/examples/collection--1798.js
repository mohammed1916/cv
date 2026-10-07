// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Small coins bridge coverage before a large gap",
    "input": "{\"coins\":[1,2,1,5,3,12,7,40]}"
  },
  {
    "label": "No one-valued coin",
    "input": "{\"coins\":[2,4,8]}"
  },
  {
    "label": "Repeated ones extend one at a time",
    "input": "{\"coins\":[1,1,1,1,1]}"
  },
  {
    "label": "Exact next missing value extends coverage",
    "input": "{\"coins\":[1,2,4,8,16]}"
  }
];
