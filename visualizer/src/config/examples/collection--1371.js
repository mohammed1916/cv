// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Vowel parity revisits states across a longer authored phrase",
    "input": "{\"s\":\"quietbluebirdsroamunderstars\"}"
  },
  {
    "label": "No vowels means the entire string qualifies",
    "input": "{\"s\":\"rhythms\"}"
  },
  {
    "label": "Every vowel paired allows the full string",
    "input": "{\"s\":\"aaeeiioouu\"}"
  },
  {
    "label": "A single vowel has no nonempty even-count substring",
    "input": "{\"s\":\"a\"}"
  }
];
