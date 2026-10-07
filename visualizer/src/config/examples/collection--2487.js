// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Successively larger right-side nodes remove several earlier candidates",
    "input": "{\"head\":[18,7,12,4,16,9,11,3,8]}"
  },
  {
    "label": "Equal values remain because removal needs a strictly larger value",
    "input": "{\"head\":[6,6,6,6]}"
  },
  {
    "label": "A descending list keeps every original node",
    "input": "{\"head\":[20,15,10,5]}"
  },
  {
    "label": "An increasing list retains only the last node",
    "input": "{\"head\":[2,5,9,14]}"
  }
];
