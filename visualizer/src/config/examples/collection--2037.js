// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unordered positions lead to several paired movements",
    "input": "{\"seats\":[18,3,11,25,7,16],\"students\":[5,22,1,14,19,9]}"
  },
  {
    "label": "Duplicate positions still represent distinct seats",
    "input": "{\"seats\":[4,4,10,10],\"students\":[3,7,7,12]}"
  },
  {
    "label": "Students already occupy all seat coordinates",
    "input": "{\"seats\":[2,6,13,20],\"students\":[20,6,2,13]}"
  },
  {
    "label": "One student travels to one seat",
    "input": "{\"seats\":[17],\"students\":[4]}"
  }
];
