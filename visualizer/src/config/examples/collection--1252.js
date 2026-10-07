// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated row and column toggles cancel selectively",
    "input": "{\"m\":4,\"n\":5,\"indices\":[[0,1],[2,3],[0,4],[3,1],[2,3],[1,0]]}"
  },
  {
    "label": "Same operation twice restores parity",
    "input": "{\"m\":3,\"n\":3,\"indices\":[[1,2],[1,2]]}"
  },
  {
    "label": "Single cell is incremented twice",
    "input": "{\"m\":1,\"n\":1,\"indices\":[[0,0]]}"
  },
  {
    "label": "One row and several columns",
    "input": "{\"m\":1,\"n\":4,\"indices\":[[0,1],[0,3]]}"
  }
];
