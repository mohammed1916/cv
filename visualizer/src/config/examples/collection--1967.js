// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several overlapping patterns occur in a longer word",
    "input": "{\"patterns\":[\"river\",\"ver\",\"bend\",\"riverbend\",\"ridge\",\"erbe\",\"end\"],\"word\":\"silverriverbend\"}"
  },
  {
    "label": "Duplicate entries each contribute",
    "input": "{\"patterns\":[\"ana\",\"ana\",\"na\",\"zz\"],\"word\":\"bananas\"}"
  },
  {
    "label": "A longer pattern cannot fit",
    "input": "{\"patterns\":[\"orchard\",\"orchards\"],\"word\":\"orch\"}"
  },
  {
    "label": "Repeated occurrences still count once per entry",
    "input": "{\"patterns\":[\"a\",\"aa\",\"aaa\"],\"word\":\"aaaaaaa\"}"
  }
];
