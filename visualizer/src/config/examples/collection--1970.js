// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Alternating flooded cells gradually cut a wide board",
    "input": "{\"row\":3,\"col\":4,\"cells\":[[2,2],[1,3],[3,1],[2,4],[1,1],[3,3],[2,1],[1,4],[3,4],[2,3],[1,2],[3,2]]}"
  },
  {
    "label": "An entire top row floods first",
    "input": "{\"row\":2,\"col\":3,\"cells\":[[1,1],[1,2],[1,3],[2,3],[2,2],[2,1]]}"
  },
  {
    "label": "A single column stays open late",
    "input": "{\"row\":3,\"col\":2,\"cells\":[[1,1],[2,1],[3,1],[3,2],[2,2],[1,2]]}"
  },
  {
    "label": "Smallest two-by-two board",
    "input": "{\"row\":2,\"col\":2,\"cells\":[[2,1],[1,2],[1,1],[2,2]]}"
  }
];
