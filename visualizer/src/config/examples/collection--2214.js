// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Only one of several hits can benefit from armor",
    "input": "{\"damage\":[8,17,5,23,11,6,19],\"armor\":14}"
  },
  {
    "label": "Armor larger than every hit still applies only once",
    "input": "{\"damage\":[4,7,3],\"armor\":100}"
  },
  {
    "label": "No armor leaves total damage plus one",
    "input": "{\"damage\":[9,2,8],\"armor\":0}"
  },
  {
    "label": "A fully blocked single hit still requires positive health",
    "input": "{\"damage\":[12],\"armor\":12}"
  }
];
