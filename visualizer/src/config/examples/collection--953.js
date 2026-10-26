// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Custom alphabet changes first differences",
    "input": "{\"words\":[\"zoo\",\"yak\",\"xenon\",\"wood\"],\"order\":\"zyxwvutsrqponmlkjihgfedcba\"}"
  },
  {
    "label": "Longer shared prefix is invalid first",
    "input": "{\"words\":[\"garden\",\"gard\"],\"order\":\"abcdefghijklmnopqrstuvwxyz\"}"
  },
  {
    "label": "Shorter shared prefix comes first",
    "input": "{\"words\":[\"oak\",\"oaks\"],\"order\":\"abcdefghijklmnopqrstuvwxyz\"}"
  },
  {
    "label": "Identical neighboring words",
    "input": "{\"words\":[\"moss\",\"moss\"],\"order\":\"abcdefghijklmnopqrstuvwxyz\"}"
  }
];
