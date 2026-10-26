// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Literal suffixed names occupy future candidates",
    "input": "{\"names\":[\"oak\",\"oak\",\"oak(1)\",\"oak\",\"pine\",\"pine(1)\",\"pine\",\"oak(2)\",\"oak\",\"pine\"]}"
  },
  {
    "label": "All distinct",
    "input": "{\"names\":[\"moss\",\"fern\",\"cedar\"]}"
  },
  {
    "label": "Repeated suffixed base",
    "input": "{\"names\":[\"fir(2)\",\"fir(2)\",\"fir(2)\"]}"
  },
  {
    "label": "One name",
    "input": "{\"names\":[\"grove\"]}"
  }
];
