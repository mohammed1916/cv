// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Diagonal construction defeats each of six rows",
    "input": "{\"nums\":[\"001101\",\"111000\",\"010010\",\"100111\",\"011100\",\"110011\"]}"
  },
  {
    "label": "A one-bit input has one opposite answer",
    "input": "{\"nums\":[\"1\"]}"
  },
  {
    "label": "Two different rows",
    "input": "{\"nums\":[\"00\",\"11\"]}"
  },
  {
    "label": "A four-row collection sharing prefixes",
    "input": "{\"nums\":[\"0000\",\"0001\",\"0010\",\"0011\"]}"
  },
  {
    "label": "Single binary string",
    "input": "[\"0\"]"
  },
  {
    "label": "Two strings of length two",
    "input": "[\"10\",\"11\"]"
  },
  {
    "label": "Three strings with a leading run of zeros",
    "input": "[\"000\",\"001\",\"010\"]"
  },
  {
    "label": "Long run: 12 distinct strings",
    "input": "[\"110001101100\",\"100111111010\",\"011010110111\",\"111101100100\",\"001001011010\",\"001101000011\",\"110001011100\",\"001101101101\",\"111101110010\",\"110001000000\",\"111111000011\",\"100001010000\"]"
  }
];
