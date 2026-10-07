// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed signs leave a gap requiring several additions",
    "input": "{\"nums\":[7,-4,9,-8,2,6,-3,5],\"limit\":10,\"goal\":-37}"
  },
  {
    "label": "Existing sum already matches",
    "input": "{\"nums\":[3,-2,5],\"limit\":6,\"goal\":6}"
  },
  {
    "label": "Gap is an exact multiple",
    "input": "{\"nums\":[2,1],\"limit\":5,\"goal\":23}"
  },
  {
    "label": "Final addition uses only a remainder",
    "input": "{\"nums\":[-4,2],\"limit\":7,\"goal\":15}"
  }
];
