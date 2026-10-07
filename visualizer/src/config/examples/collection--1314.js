// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Neighborhoods clip differently at corners and interior cells",
    "input": "{\"mat\":[[4,1,7,3],[2,8,5,6],[9,3,2,4]],\"k\":1}"
  },
  {
    "label": "Zero radius copies each cell",
    "input": "{\"mat\":[[3,7],[5,2]],\"k\":0}"
  },
  {
    "label": "Radius larger than matrix includes everything",
    "input": "{\"mat\":[[1,4,2],[7,3,6]],\"k\":8}"
  },
  {
    "label": "Single cell",
    "input": "{\"mat\":[[19]],\"k\":3}"
  }
];
