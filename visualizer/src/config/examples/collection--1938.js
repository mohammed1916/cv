// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Queries follow different branches of a nonzero-root tree",
    "input": "{\"parents\":[2,2,-1,0,0,1,1,3],\"queries\":[[7,10],[4,13],[6,7],[2,31],[5,2]]}"
  },
  {
    "label": "A sibling label must not leak into the active ancestor trie",
    "input": "{\"parents\":[-1,0,0,1,2],\"queries\":[[3,4],[4,3],[1,7],[2,7]]}"
  },
  {
    "label": "The root is the only permitted ancestor",
    "input": "{\"parents\":[-1],\"queries\":[[0,0],[0,63]]}"
  },
  {
    "label": "A chain allows every earlier label",
    "input": "{\"parents\":[-1,0,1,2,3,4],\"queries\":[[5,9],[4,2],[2,14]]}"
  }
];
