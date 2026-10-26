// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mines limit different arms of competing plus centers",
    "input": "{\"n\":7,\"mines\":[[0,3],[2,1],[3,5],[5,2],[6,4]]}"
  },
  {
    "label": "An empty mine list permits a centered maximum plus",
    "input": "{\"n\":5,\"mines\":[]}"
  },
  {
    "label": "A mined single cell has order zero",
    "input": "{\"n\":1,\"mines\":[[0,0]]}"
  },
  {
    "label": "An unmined single cell has order one",
    "input": "{\"n\":1,\"mines\":[]}"
  }
];
