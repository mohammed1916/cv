// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Separated odd palindromes have different lengths",
    "input": "{\"s\":\"abacdfgdcabayracecarz\"}"
  },
  {
    "label": "Nested palindromes must be split without overlap",
    "input": "{\"s\":\"aaaaaaaaaa\"}"
  },
  {
    "label": "An even palindrome cannot count as an odd one",
    "input": "{\"s\":\"abba\"}"
  },
  {
    "label": "Two singleton palindromes",
    "input": "{\"s\":\"xy\"}"
  }
];
