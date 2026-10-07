// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different route lengths encounter synchronized red intervals",
    "input": "{\"n\":7,\"edges\":[[1,2],[1,3],[2,4],[3,4],[4,5],[5,7],[3,6],[6,7],[2,6]],\"time\":3,\"change\":5}"
  },
  {
    "label": "One edge requires a backtrack for the second arrival",
    "input": "{\"n\":2,\"edges\":[[1,2]],\"time\":4,\"change\":3}"
  },
  {
    "label": "Equal-length paths do not count as distinct arrival times",
    "input": "{\"n\":4,\"edges\":[[1,2],[2,4],[1,3],[3,4]],\"time\":2,\"change\":7}"
  },
  {
    "label": "Arriving on a red boundary forces a wait before continuing",
    "input": "{\"n\":3,\"edges\":[[1,2],[2,3],[1,3]],\"time\":5,\"change\":5}"
  }
];
