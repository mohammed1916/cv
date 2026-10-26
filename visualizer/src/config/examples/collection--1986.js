// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several ways to pack the same remaining capacity",
    "input": "{\"tasks\":[4,7,3,6,2,5,4,1],\"sessionTime\":10}"
  },
  {
    "label": "Every task fills a whole session",
    "input": "{\"tasks\":[6,6,6,6],\"sessionTime\":6}"
  },
  {
    "label": "All tasks fit together exactly",
    "input": "{\"tasks\":[2,3,4],\"sessionTime\":9}"
  },
  {
    "label": "A single task needs one session",
    "input": "{\"tasks\":[5],\"sessionTime\":8}"
  }
];
