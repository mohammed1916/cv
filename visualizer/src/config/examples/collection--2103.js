// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several rods receive complete sets while others miss colors",
    "input": "{\"rings\":\"R2G2B2R5B5G5R8G8R2B1G1R1B8\"}"
  },
  {
    "label": "Repeating one color never completes a rod",
    "input": "{\"rings\":\"R4R4R4R4R4\"}"
  },
  {
    "label": "All three colors reach different rods",
    "input": "{\"rings\":\"R0G3B7\"}"
  },
  {
    "label": "One rod gets all colors in a different order",
    "input": "{\"rings\":\"B9R9G9\"}"
  }
];
