// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Complement buckets repeat across a longer playlist",
    "input": "{\"time\":[47,73,120,30,90,13,107,180,33,87,150,60]}"
  },
  {
    "label": "Zero remainders pair with earlier zeros",
    "input": "{\"time\":[60,120,240,300]}"
  },
  {
    "label": "Thirty remainders pair with each other",
    "input": "{\"time\":[30,90,150,210]}"
  },
  {
    "label": "One song cannot pair with itself",
    "input": "{\"time\":[180]}"
  }
];
