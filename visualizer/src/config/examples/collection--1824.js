// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Changing blocked lanes force future-aware alternatives",
    "input": "{\"obstacles\":[0,2,1,0,3,2,0,1,3,0,2,0]}"
  },
  {
    "label": "Completely clear road",
    "input": "{\"obstacles\":[0,0,0,0,0]}"
  },
  {
    "label": "Only the starting lane is blocked ahead",
    "input": "{\"obstacles\":[0,2,2,2,0]}"
  },
  {
    "label": "Shortest road",
    "input": "{\"obstacles\":[0,0]}"
  }
];
