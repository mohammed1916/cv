// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated pairs and one center letter require several local moves",
    "input": "{\"s\":\"aabbccddeeffg\"}"
  },
  {
    "label": "An existing palindrome needs no swaps",
    "input": "{\"s\":\"racecar\"}"
  },
  {
    "label": "The unique odd letter starts at an outer boundary",
    "input": "{\"s\":\"xaa\"}"
  },
  {
    "label": "One pair is already a palindrome",
    "input": "{\"s\":\"zz\"}"
  }
];
