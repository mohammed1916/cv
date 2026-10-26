// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Local aliases collapse while domains remain distinct",
    "input": "{\"emails\":[\"red.fox+garden@woods.org\",\"redfox@woods.org\",\"redfox+pond@woods.net\",\"blue.bird@woods.org\",\"bluebird+note@woods.org\"]}"
  },
  {
    "label": "Dots in domains remain significant",
    "input": "{\"emails\":[\"ab@a.bc\",\"ab@ab.c\"]}"
  },
  {
    "label": "Plus suffix is ignored only locally",
    "input": "{\"emails\":[\"pine+one@forest.org\",\"pine+two@forest.org\"]}"
  },
  {
    "label": "One ordinary address",
    "input": "{\"emails\":[\"moss@green.org\"]}"
  }
];
