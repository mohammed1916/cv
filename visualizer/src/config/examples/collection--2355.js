// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A low shelf interrupts several increasing selection candidates",
    "input": "{\"books\":[9,4,7,3,8,10,6,12]}"
  },
  {
    "label": "Zero-cap shelves cannot belong to a positive selection",
    "input": "{\"books\":[0,0,0]}"
  },
  {
    "label": "Equal caps force a rising arithmetic selection",
    "input": "{\"books\":[5,5,5,5]}"
  },
  {
    "label": "A rising cap sequence can be taken in full",
    "input": "{\"books\":[1,3,5,7,9]}"
  }
];
