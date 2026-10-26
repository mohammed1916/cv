// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several parallel prerequisite chains merge",
    "input": "{\"n\":7,\"relations\":[[1,3],[2,3],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7]],\"time\":[4,7,3,6,5,2,8]}"
  },
  {
    "label": "Independent courses run together",
    "input": "{\"n\":4,\"relations\":[],\"time\":[5,11,3,8]}"
  },
  {
    "label": "A chain forces durations to add",
    "input": "{\"n\":4,\"relations\":[[1,2],[2,3],[3,4]],\"time\":[2,6,4,9]}"
  },
  {
    "label": "One course needs its own duration",
    "input": "{\"n\":1,\"relations\":[],\"time\":[13]}"
  }
];
