// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long shared prefixes require suffix comparison",
    "input": "{\"word1\":\"cabacaz\",\"word2\":\"cabacby\"}"
  },
  {
    "label": "One word has uniformly greater letters",
    "input": "{\"word1\":\"zzzz\",\"word2\":\"aaaa\"}"
  },
  {
    "label": "Equal words still preserve both copies",
    "input": "{\"word1\":\"moss\",\"word2\":\"moss\"}"
  },
  {
    "label": "One suffix is a prefix of the other",
    "input": "{\"word1\":\"aaa\",\"word2\":\"aaaaa\"}"
  }
];
