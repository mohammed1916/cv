// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Irregular connected region and isolated islands",
    "input": "{\"image\":[[2,2,3,2,2],[2,3,3,2,3],[2,2,2,3,3],[3,3,2,2,2]],\"sr\":1,\"sc\":0,\"color\":7}"
  },
  {
    "label": "Replacement equals original",
    "input": "{\"image\":[[4,4],[4,1]],\"sr\":0,\"sc\":0,\"color\":4}"
  },
  {
    "label": "Diagonals are not connected",
    "input": "{\"image\":[[5,1],[1,5]],\"sr\":0,\"sc\":0,\"color\":8}"
  },
  {
    "label": "Single pixel",
    "input": "{\"image\":[[3]],\"sr\":0,\"sc\":0,\"color\":9}"
  }
];
