// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "An odd unrestricted sum requires comparing two parity exchanges",
    "input": "{\"nums\":[24,20,17,14,11,8,5,2],\"k\":4}"
  },
  {
    "label": "The unrestricted selection already has an even sum",
    "input": "{\"nums\":[16,12,9,7,4],\"k\":2}"
  },
  {
    "label": "Selecting every value leaves no exchange available",
    "input": "{\"nums\":[2,4,7],\"k\":3}"
  },
  {
    "label": "Zero is a valid even replacement",
    "input": "{\"nums\":[9,0,0],\"k\":1}"
  }
];
