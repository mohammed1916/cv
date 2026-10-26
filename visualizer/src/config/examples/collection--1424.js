// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Ragged rows contribute to overlapping diagonals",
    "input": "{\"nums\":[[4,8,2,7],[9],[3,6,1],[5,11],[12,10,13,14,15]]}"
  },
  {
    "label": "One row follows normal order",
    "input": "{\"nums\":[[7,3,9,2]]}"
  },
  {
    "label": "One column follows row order",
    "input": "{\"nums\":[[4],[8],[1],[6]]}"
  },
  {
    "label": "Late long row extends beyond earlier diagonals",
    "input": "{\"nums\":[[1],[2],[3,4,5,6]]}"
  }
];
