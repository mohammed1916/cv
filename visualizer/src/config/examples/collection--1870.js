// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rounded transfers dominate a multi-leg journey",
    "input": "{\"dist\":[7,13,5,19,8,11],\"hour\":8.45}"
  },
  {
    "label": "No time remains for the last ride",
    "input": "{\"dist\":[2,4,6],\"hour\":2}"
  },
  {
    "label": "One ride has no rounded transfer",
    "input": "{\"dist\":[17],\"hour\":2.5}"
  },
  {
    "label": "A tiny final fraction requires high speed",
    "input": "{\"dist\":[3,8,7],\"hour\":2.01}"
  }
];
