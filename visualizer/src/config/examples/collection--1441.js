// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Discarded stream values appear between retained targets",
    "input": "{\"target\":[2,4,5,8,11],\"n\":14}"
  },
  {
    "label": "Target starts with the first stream value",
    "input": "{\"target\":[1,3,6],\"n\":8}"
  },
  {
    "label": "Every read value is retained",
    "input": "{\"target\":[1,2,3,4],\"n\":7}"
  },
  {
    "label": "Single late target",
    "input": "{\"target\":[7],\"n\":9}"
  }
];
