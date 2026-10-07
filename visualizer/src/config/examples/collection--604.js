// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Read across run boundaries and inspect without consuming",
    "input": "{\"compressedString\":\"R3e2d1B4\",\"operations\":[\"hasNext\",\"next\",\"next\",\"hasNext\",\"next\",\"next\",\"next\",\"next\",\"next\",\"next\",\"next\",\"next\",\"hasNext\",\"next\"]}"
  },
  {
    "label": "A multi-digit count is loaded as one number",
    "input": "{\"compressedString\":\"Q12z1\",\"operations\":[\"next\",\"next\",\"hasNext\",\"next\",\"next\"]}"
  },
  {
    "label": "Repeated reads after exhaustion return one space each",
    "input": "{\"compressedString\":\"x1\",\"operations\":[\"next\",\"next\",\"hasNext\",\"next\"]}"
  },
  {
    "label": "Repeated availability queries leave the first character untouched",
    "input": "{\"compressedString\":\"M2n3\",\"operations\":[\"hasNext\",\"hasNext\",\"hasNext\",\"next\",\"hasNext\"]}"
  }
];
