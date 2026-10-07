// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping repeated text competes under the distinct-letter cap",
    "input": "{\"s\":\"cabacabcabacabcaba\",\"maxLetters\":3,\"minSize\":4,\"maxSize\":7}"
  },
  {
    "label": "Repeated letters produce overlapping counted windows",
    "input": "{\"s\":\"zzzzzzzzz\",\"maxLetters\":1,\"minSize\":3,\"maxSize\":6}"
  },
  {
    "label": "Every candidate violates the distinct-letter limit",
    "input": "{\"s\":\"abcdefg\",\"maxLetters\":1,\"minSize\":2,\"maxSize\":4}"
  },
  {
    "label": "The entire string can be the only allowed window",
    "input": "{\"s\":\"orbit\",\"maxLetters\":5,\"minSize\":5,\"maxSize\":5}"
  }
];
