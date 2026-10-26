// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Tasks queue while differently weighted servers stay busy",
    "input": "{\"servers\":[5,2,7,2],\"tasks\":[8,6,9,7,2,4,3,10,1,5,2,6]}"
  },
  {
    "label": "Weight tie uses smaller index",
    "input": "{\"servers\":[3,3,3],\"tasks\":[5,5,5,1]}"
  },
  {
    "label": "One server serializes every task",
    "input": "{\"servers\":[8],\"tasks\":[4,2,7,1]}"
  },
  {
    "label": "Short tasks allow idle time",
    "input": "{\"servers\":[7,2],\"tasks\":[1,1,1,1,1]}"
  }
];
