// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A double appears after several unrelated values",
    "input": "{\"arr\":[17,-6,9,25,3,14,-3,8]}"
  },
  {
    "label": "A single zero cannot match itself",
    "input": "{\"arr\":[0,3,7]}"
  },
  {
    "label": "Two zeros are distinct positions",
    "input": "{\"arr\":[5,0,8,0]}"
  },
  {
    "label": "Odd values without doubles",
    "input": "{\"arr\":[3,7,11,15]}"
  }
];
