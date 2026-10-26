// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different positive child values add to the root",
    "input": "{\"root\":[73,28,45]}"
  },
  {
    "label": "A near match still fails exact equality",
    "input": "{\"root\":[42,17,24]}"
  },
  {
    "label": "Signed children may cancel to a zero root",
    "input": "{\"root\":[0,-18,18]}"
  },
  {
    "label": "A negative root can equal two negative children",
    "input": "{\"root\":[-31,-12,-19]}"
  }
];
