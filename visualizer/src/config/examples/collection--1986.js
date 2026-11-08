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
  },
  {
    "label": "Single task that fills the session",
    "input": "{\"tasks\":[3],\"sessionTime\":3}"
  },
  {
    "label": "Two tasks at the session limit",
    "input": "{\"tasks\":[15,15],\"sessionTime\":15}"
  },
  {
    "label": "Eight equal tasks",
    "input": "{\"tasks\":[2,2,2,2,2,2,2,2],\"sessionTime\":4}"
  },
  {
    "label": "Long run: 8 tasks",
    "input": "{\"tasks\":[6,14,9,15,7,7,5,1],\"sessionTime\":15}"
  }
];
