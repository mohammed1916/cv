// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Values beyond machine precision keep their exact order",
    "input": "{\"nums\":[\"9007199254740993\",\"27\",\"9007199254740992\",\"123456789012345678901234\",\"999\",\"1000\",\"123456789012345678901233\"],\"k\":3}"
  },
  {
    "label": "Duplicates occupy different ranks",
    "input": "{\"nums\":[\"83\",\"83\",\"7\",\"106\",\"83\"],\"k\":3}"
  },
  {
    "label": "Zero is a valid decimal value",
    "input": "{\"nums\":[\"0\",\"12\",\"3\"],\"k\":3}"
  },
  {
    "label": "One exact large value",
    "input": "{\"nums\":[\"987654321098765432109876543210\"],\"k\":1}"
  }
];
