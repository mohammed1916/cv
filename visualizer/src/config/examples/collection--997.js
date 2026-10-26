// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many trust edges with one judge",
    "input": "{\"n\":6,\"trust\":[[1,4],[2,4],[3,4],[5,4],[6,4],[1,2],[2,3],[5,6]]}"
  },
  {
    "label": "Candidate trusts someone else",
    "input": "{\"n\":3,\"trust\":[[1,3],[2,3],[3,1]]}"
  },
  {
    "label": "Single person needs no trust",
    "input": "{\"n\":1,\"trust\":[]}"
  },
  {
    "label": "Nobody has enough incoming trust",
    "input": "{\"n\":4,\"trust\":[[1,2],[2,3],[3,4]]}"
  }
];
