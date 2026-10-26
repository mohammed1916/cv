// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several triangles share corridors",
    "input": "{\"n\":7,\"corridors\":[[1,2],[2,3],[1,3],[2,4],[3,4],[4,5],[5,6],[4,6],[6,7],[5,7]]}"
  },
  {
    "label": "A four-room cycle is not a three-room cycle",
    "input": "{\"n\":4,\"corridors\":[[1,2],[2,3],[3,4],[4,1]]}"
  },
  {
    "label": "A complete four-room graph has overlapping triples",
    "input": "{\"n\":4,\"corridors\":[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]}"
  },
  {
    "label": "Disconnected edges form no cycle",
    "input": "{\"n\":6,\"corridors\":[[1,2],[3,4],[5,6]]}"
  }
];
