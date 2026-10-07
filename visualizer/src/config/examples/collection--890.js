// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several words share letters but not structure",
    "input": "{\"words\":[\"deed\",\"noon\",\"door\",\"peep\",\"book\",\"elle\",\"moss\"],\"pattern\":\"abba\"}"
  },
  {
    "label": "All positions distinct",
    "input": "{\"words\":[\"sun\",\"sky\",\"see\",\"owl\"],\"pattern\":\"abc\"}"
  },
  {
    "label": "Repeated single letter",
    "input": "{\"words\":[\"aaa\",\"bbb\",\"aba\"],\"pattern\":\"ccc\"}"
  },
  {
    "label": "One-character words",
    "input": "{\"words\":[\"x\",\"y\",\"z\"],\"pattern\":\"q\"}"
  }
];
