// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A long value requires exact candidate distances",
    "input": "{\"n\":\"783426195284617239\"}"
  },
  {
    "label": "A power of ten ties with the shorter all-nines boundary",
    "input": "{\"n\":\"1000000\"}"
  },
  {
    "label": "An existing palindrome must choose a different value",
    "input": "{\"n\":\"4567654\"}"
  },
  {
    "label": "The smallest positive input can choose zero",
    "input": "{\"n\":\"1\"}"
  }
];
