// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping ranges cancel different prefix portions",
    "input": "{\"arr\":[7,12,5,9,3,14,6,11],\"queries\":[[0,7],[2,5],[1,3],[4,4],[3,7]]}"
  },
  {
    "label": "Single element query",
    "input": "{\"arr\":[23],\"queries\":[[0,0]]}"
  },
  {
    "label": "Equal values cancel across an even range",
    "input": "{\"arr\":[6,6,6,6],\"queries\":[[0,3],[0,2]]}"
  },
  {
    "label": "Zero entries leave XOR unchanged",
    "input": "{\"arr\":[0,9,0,4],\"queries\":[[0,2],[1,3]]}"
  }
];
