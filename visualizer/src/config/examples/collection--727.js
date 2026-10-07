// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several target alignments compete for the shortest source window",
    "input": "{\"s1\":\"axbycabcaybzcab\",\"s2\":\"abc\"}"
  },
  {
    "label": "Target order matters even when every letter exists",
    "input": "{\"s1\":\"cba\",\"s2\":\"abc\"}"
  },
  {
    "label": "Repeated target letters need different source positions",
    "input": "{\"s1\":\"abacaba\",\"s2\":\"aaa\"}"
  },
  {
    "label": "Equal shortest windows retain the leftmost one",
    "input": "{\"s1\":\"axbxxayb\",\"s2\":\"ab\"}"
  }
];
