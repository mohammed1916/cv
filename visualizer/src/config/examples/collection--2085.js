// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Words repeated in either source must be excluded",
    "input": "{\"words1\":[\"fern\",\"oak\",\"moss\",\"reed\",\"oak\",\"pine\",\"ash\"],\"words2\":[\"moss\",\"pine\",\"reed\",\"reed\",\"ash\",\"elm\",\"fern\"]}"
  },
  {
    "label": "A word repeated only in the first source does not qualify",
    "input": "{\"words1\":[\"bay\",\"bay\"],\"words2\":[\"bay\"]}"
  },
  {
    "label": "The sources have no common word",
    "input": "{\"words1\":[\"cedar\",\"birch\"],\"words2\":[\"maple\",\"willow\"]}"
  },
  {
    "label": "One shared singleton word",
    "input": "{\"words1\":[\"harbor\"],\"words2\":[\"harbor\"]}"
  }
];
