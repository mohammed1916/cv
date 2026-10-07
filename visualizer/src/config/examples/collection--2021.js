// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlaps span negative and positive street positions",
    "input": "{\"lights\":[[-6,4],[-2,3],[3,5],[8,2],[12,4]]}"
  },
  {
    "label": "Equal separated peaks choose the smaller position",
    "input": "{\"lights\":[[-8,1],[9,1]]}"
  },
  {
    "label": "Right endpoints remain illuminated",
    "input": "{\"lights\":[[2,2],[6,2]]}"
  },
  {
    "label": "A zero-radius light covers one integer point",
    "input": "{\"lights\":[[7,0]]}"
  }
];
