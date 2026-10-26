// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlaps and a gap create several painted spans",
    "input": "{\"segments\":[[2,9,4],[5,13,7],[8,11,12],[16,22,9],[19,25,15]]}"
  },
  {
    "label": "Distinct color sets have equal sums across a boundary",
    "input": "{\"segments\":[[1,4,2],[1,4,5],[4,8,7]]}"
  },
  {
    "label": "One painted segment",
    "input": "{\"segments\":[[6,15,11]]}"
  },
  {
    "label": "Several colors share both endpoints",
    "input": "{\"segments\":[[3,10,6],[3,10,13],[3,10,19]]}"
  }
];
