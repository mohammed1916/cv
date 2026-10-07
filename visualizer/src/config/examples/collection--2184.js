// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several row tilings can alternate without aligned seams",
    "input": "{\"height\":4,\"width\":7,\"bricks\":[2,3]}"
  },
  {
    "label": "A full-width brick has no internal seam",
    "input": "{\"height\":6,\"width\":5,\"bricks\":[5]}"
  },
  {
    "label": "A single row has no adjacent-row restriction",
    "input": "{\"height\":1,\"width\":6,\"bricks\":[1,2,3]}"
  },
  {
    "label": "No brick combination reaches the exact width",
    "input": "{\"height\":3,\"width\":5,\"bricks\":[2,4]}"
  }
];
