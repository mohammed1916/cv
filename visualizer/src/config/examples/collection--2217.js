// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several odd-length ranks include a last valid and an invalid query",
    "input": "{\"queries\":[1,7,28,90,900,901],\"intLength\":5}"
  },
  {
    "label": "Even-length palindromes mirror the entire half",
    "input": "{\"queries\":[1,12,47,90,91],\"intLength\":4}"
  },
  {
    "label": "One-digit palindromes exclude zero",
    "input": "{\"queries\":[1,5,9,10],\"intLength\":1}"
  },
  {
    "label": "Long fixed-length palindromes remain exact integers",
    "input": "{\"queries\":[1,1234,90000000,90000001],\"intLength\":15}"
  }
];
