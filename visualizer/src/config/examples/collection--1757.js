// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Each flag combination appears among different products",
    "input": "{\"rows\":[{\"product_id\":14,\"low_fats\":\"Y\",\"recyclable\":\"N\"},{\"product_id\":3,\"low_fats\":\"Y\",\"recyclable\":\"Y\"},{\"product_id\":28,\"low_fats\":\"N\",\"recyclable\":\"Y\"},{\"product_id\":9,\"low_fats\":\"N\",\"recyclable\":\"N\"},{\"product_id\":17,\"low_fats\":\"Y\",\"recyclable\":\"Y\"},{\"product_id\":21,\"low_fats\":\"N\",\"recyclable\":\"Y\"}]}"
  },
  {
    "label": "All products qualify",
    "input": "{\"rows\":[{\"product_id\":6,\"low_fats\":\"Y\",\"recyclable\":\"Y\"},{\"product_id\":8,\"low_fats\":\"Y\",\"recyclable\":\"Y\"}]}"
  },
  {
    "label": "One true flag is insufficient",
    "input": "{\"rows\":[{\"product_id\":2,\"low_fats\":\"N\",\"recyclable\":\"Y\"},{\"product_id\":5,\"low_fats\":\"Y\",\"recyclable\":\"N\"}]}"
  },
  {
    "label": "Empty Products table",
    "input": "{\"rows\":[]}"
  }
];
