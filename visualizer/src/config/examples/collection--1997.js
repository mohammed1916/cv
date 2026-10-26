// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different return rooms reuse different earlier segments",
    "input": "{\"nextVisit\":[0,0,1,0,2,4,1,6]}"
  },
  {
    "label": "Every odd visit returns to the same room",
    "input": "{\"nextVisit\":[0,1,2,3,4,5]}"
  },
  {
    "label": "Every return goes back to room zero",
    "input": "{\"nextVisit\":[0,0,0,0,0,0]}"
  },
  {
    "label": "Only two rooms",
    "input": "{\"nextVisit\":[0,0]}"
  }
];
