// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Best block spans a dense middle cluster",
    "input": "{\"data\":[1,0,0,1,1,0,1,1,1,0,0,1]}"
  },
  {
    "label": "No ones",
    "input": "{\"data\":[0,0,0,0]}"
  },
  {
    "label": "Already grouped",
    "input": "{\"data\":[0,1,1,1,0]}"
  },
  {
    "label": "Every position is one",
    "input": "{\"data\":[1,1,1,1]}"
  }
];
