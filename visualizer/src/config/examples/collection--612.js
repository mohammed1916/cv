// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The closest pair is discovered after several distant candidates",
    "input": "{\"points\":[{\"x\":-8,\"y\":3},{\"x\":4,\"y\":12},{\"x\":11,\"y\":-5},{\"x\":6,\"y\":7},{\"x\":7,\"y\":9},{\"x\":18,\"y\":15}]}"
  },
  {
    "label": "A vertical pair uses only its y gap",
    "input": "{\"points\":[{\"x\":4,\"y\":-3},{\"x\":4,\"y\":8}]}"
  },
  {
    "label": "An irrational distance is rounded only at the end",
    "input": "{\"points\":[{\"x\":0,\"y\":0},{\"x\":2,\"y\":3}]}"
  },
  {
    "label": "Several equal shortest distances are harmless",
    "input": "{\"points\":[{\"x\":0,\"y\":0},{\"x\":0,\"y\":4},{\"x\":4,\"y\":0},{\"x\":4,\"y\":4}]}"
  }
];
