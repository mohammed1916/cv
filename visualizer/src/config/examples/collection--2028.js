// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A longer known history leaves several missing rolls",
    "input": "{\"rolls\":[2,5,3,6,4,1,5,2],\"mean\":4,\"n\":6}"
  },
  {
    "label": "The missing rolls must all be ones",
    "input": "{\"rolls\":[4,4],\"mean\":2,\"n\":4}"
  },
  {
    "label": "The missing rolls must all be sixes",
    "input": "{\"rolls\":[3,3],\"mean\":5,\"n\":4}"
  },
  {
    "label": "Requested mean exceeds the missing-roll capacity",
    "input": "{\"rolls\":[1,1,1],\"mean\":6,\"n\":2}"
  }
];
