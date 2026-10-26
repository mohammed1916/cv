// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several signed denominators require repeated exact reductions",
    "input": "{\"expression\":\"7/8-2/3+5/6-3/10+1/4-9/10\"}"
  },
  {
    "label": "Complete cancellation normalizes the denominator to one",
    "input": "{\"expression\":\"3/7+2/7-5/7\"}"
  },
  {
    "label": "A negative result keeps the sign in the numerator",
    "input": "{\"expression\":\"1/9-7/9\"}"
  },
  {
    "label": "An improper fraction can reduce to an integer",
    "input": "{\"expression\":\"8/3+7/3\"}"
  }
];
