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
  },
  {
    "label": "Shortest song",
    "input": "{\"time\":[1]}"
  },
  {
    "label": "Five equal songs pair up",
    "input": "{\"time\":[30,30,30,30,30]}"
  },
  {
    "label": "Twenty-four songs at the limit",
    "input": "{\"time\":[500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500]}"
  },
  {
    "label": "Long run: 24 songs",
    "input": "{\"time\":[135,148,91,122,228,409,213,306,492,459,431,434,258,338,434,405,122,402,196,308,108,103,427,17]}"
  },
];
