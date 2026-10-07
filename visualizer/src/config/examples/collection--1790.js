// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two distant mismatches exchange correctly",
    "input": "{\"s1\":\"forestpath\",\"s2\":\"horestpatf\"}"
  },
  {
    "label": "Already identical",
    "input": "{\"s1\":\"orchard\",\"s2\":\"orchard\"}"
  },
  {
    "label": "One mismatch cannot be repaired by a swap",
    "input": "{\"s1\":\"pine\",\"s2\":\"fine\"}"
  },
  {
    "label": "Several mismatches exceed one swap",
    "input": "{\"s1\":\"abcd\",\"s2\":\"badc\"}"
  }
];
