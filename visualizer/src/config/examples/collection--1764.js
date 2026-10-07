// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated prefixes require careful group matching",
    "input": "{\"groups\":[[4,7,4],[2,9],[6,6,3]],\"nums\":[8,4,7,2,4,7,4,5,2,9,1,6,6,3,8]}"
  },
  {
    "label": "Matching groups cannot overlap",
    "input": "{\"groups\":[[2,3],[3,4]],\"nums\":[2,3,4]}"
  },
  {
    "label": "Groups match back to back",
    "input": "{\"groups\":[[7,1],[5],[8,2]],\"nums\":[7,1,5,8,2]}"
  },
  {
    "label": "Later group missing",
    "input": "{\"groups\":[[4],[9,2]],\"nums\":[4,9,3,2]}"
  }
];
