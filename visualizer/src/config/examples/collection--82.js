// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated runs at the beginning middle and end are removed entirely",
    "input": "{\"head\":[1,1,2,4,4,4,7,9,9,12,15,15]}"
  },
  {
    "label": "Every node belongs to one repeated run",
    "input": "{\"head\":[6,6,6,6]}"
  },
  {
    "label": "All distinct nodes retain their original links",
    "input": "{\"head\":[-8,-3,0,5,11]}"
  },
  {
    "label": "An empty list remains empty",
    "input": "{\"head\":[]}"
  }
];
