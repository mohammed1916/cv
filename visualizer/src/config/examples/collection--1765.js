// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several water fronts limit a central ridge",
    "input": "{\"isWater\":[[1,0,0,0,0,0],[0,0,0,0,1,0],[0,0,0,0,0,0],[0,1,0,0,0,0],[0,0,0,0,0,1]]}"
  },
  {
    "label": "Every cell is water",
    "input": "{\"isWater\":[[1,1],[1,1]]}"
  },
  {
    "label": "One water source in a long row",
    "input": "{\"isWater\":[[1,0,0,0,0,0,0]]}"
  },
  {
    "label": "Single water cell",
    "input": "{\"isWater\":[[1]]}"
  }
];
