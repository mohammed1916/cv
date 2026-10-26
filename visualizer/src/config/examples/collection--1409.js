// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated move-to-front requests change later positions",
    "input": "{\"queries\":[7,3,7,9,1,5,3,8,2],\"m\":10}"
  },
  {
    "label": "Request the current front repeatedly",
    "input": "{\"queries\":[1,1,1],\"m\":4}"
  },
  {
    "label": "Single-item permutation",
    "input": "{\"queries\":[1,1],\"m\":1}"
  },
  {
    "label": "Walk backward through the initial order",
    "input": "{\"queries\":[5,4,3,2,1],\"m\":5}"
  }
];
