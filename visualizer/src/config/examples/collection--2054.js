// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several overlapping intervals compete with separated high values",
    "input": "{\"events\":[[2,6,12],[5,9,18],[10,13,11],[7,8,7],[14,18,16],[3,17,31],[19,22,10]]}"
  },
  {
    "label": "Touching inclusive endpoints still overlap",
    "input": "{\"events\":[[1,4,10],[4,7,20],[8,9,6]]}"
  },
  {
    "label": "The best answer may use only one event",
    "input": "{\"events\":[[2,8,30],[3,6,12],[4,7,19]]}"
  },
  {
    "label": "One event is allowed",
    "input": "{\"events\":[[5,11,23]]}"
  }
];
