// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two complete prefix chains compete by length and spelling",
    "input": "{\"words\":[\"f\",\"fo\",\"for\",\"fore\",\"fores\",\"forest\",\"g\",\"gr\",\"gro\",\"grov\",\"grove\",\"forester\"]}"
  },
  {
    "label": "Missing intermediate prefix blocks longer word",
    "input": "{\"words\":[\"s\",\"su\",\"sunny\"]}"
  },
  {
    "label": "Equal lengths choose lexicographically smaller",
    "input": "{\"words\":[\"b\",\"ba\",\"bar\",\"c\",\"ca\",\"cat\"]}"
  },
  {
    "label": "No one-letter starting word",
    "input": "{\"words\":[\"oak\",\"pine\",\"forest\"]}"
  }
];
