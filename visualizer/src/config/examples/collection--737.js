// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several similarity chains match a longer sentence",
    "input": "{\"sentence1\":[\"calm\",\"birds\",\"cross\",\"wide\",\"rivers\"],\"sentence2\":[\"quiet\",\"birds\",\"traverse\",\"broad\",\"streams\"],\"similarPairs\":[[\"calm\",\"peaceful\"],[\"peaceful\",\"quiet\"],[\"cross\",\"pass\"],[\"pass\",\"traverse\"],[\"wide\",\"broad\"],[\"rivers\",\"waterways\"],[\"waterways\",\"streams\"]]}"
  },
  {
    "label": "Identical unseen words need no pairs",
    "input": "{\"sentence1\":[\"silver\",\"moon\"],\"sentence2\":[\"silver\",\"moon\"],\"similarPairs\":[]}"
  },
  {
    "label": "Different sentence lengths cannot align",
    "input": "{\"sentence1\":[\"bright\",\"day\"],\"sentence2\":[\"day\"],\"similarPairs\":[[\"bright\",\"day\"]]}"
  },
  {
    "label": "One unmatched position rejects the whole sentence",
    "input": "{\"sentence1\":[\"gentle\",\"wind\"],\"sentence2\":[\"soft\",\"rain\"],\"similarPairs\":[[\"gentle\",\"soft\"]]}"
  }
];
