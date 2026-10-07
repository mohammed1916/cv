// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unsorted signed coordinates need adjacent comparisons after sorting",
    "input": "{\"points\":[{\"x\":24},{\"x\":-9},{\"x\":7},{\"x\":41},{\"x\":11},{\"x\":-2},{\"x\":50}]}"
  },
  {
    "label": "Two coordinates have one candidate gap",
    "input": "{\"points\":[{\"x\":-12},{\"x\":17}]}"
  },
  {
    "label": "Equal minimum gaps can occur several times",
    "input": "{\"points\":[{\"x\":8},{\"x\":2},{\"x\":5},{\"x\":11}]}"
  },
  {
    "label": "The smallest gap can occur at the far end",
    "input": "{\"points\":[{\"x\":-30},{\"x\":0},{\"x\":20},{\"x\":21}]}"
  }
];
