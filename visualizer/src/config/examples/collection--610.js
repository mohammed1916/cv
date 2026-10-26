// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed triples include valid flat and too-long cases",
    "input": "{\"triangle\":[{\"x\":6,\"y\":8,\"z\":9},{\"x\":4,\"y\":7,\"z\":11},{\"x\":2,\"y\":3,\"z\":8},{\"x\":10,\"y\":10,\"z\":10},{\"x\":9,\"y\":5,\"z\":6}]}"
  },
  {
    "label": "Equality is not a triangle",
    "input": "{\"triangle\":[{\"x\":5,\"y\":8,\"z\":13}]}"
  },
  {
    "label": "Permuting sides preserves the classification",
    "input": "{\"triangle\":[{\"x\":4,\"y\":6,\"z\":7},{\"x\":7,\"y\":4,\"z\":6},{\"x\":6,\"y\":7,\"z\":4}]}"
  },
  {
    "label": "An empty table has no classifications",
    "input": "{\"triangle\":[]}"
  }
];
