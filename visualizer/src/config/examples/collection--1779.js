// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Eligible axes compete with ineligible nearby points",
    "input": "{\"x\":6,\"y\":9,\"points\":[[7,10],[6,15],[2,9],[6,5],[12,9],[6,9],[0,0],[8,9]]}"
  },
  {
    "label": "No shared coordinate",
    "input": "{\"x\":2,\"y\":3,\"points\":[[4,5],[6,7]]}"
  },
  {
    "label": "Equal distances retain earlier index",
    "input": "{\"x\":5,\"y\":5,\"points\":[[5,8],[2,5],[8,5]]}"
  },
  {
    "label": "Reference point itself",
    "input": "{\"x\":-3,\"y\":4,\"points\":[[-3,4]]}"
  }
];
