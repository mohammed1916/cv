// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved orders reveal a winner only after counting",
    "input": "{\"orders\":[{\"order_number\":101,\"customer_number\":8},{\"order_number\":102,\"customer_number\":3},{\"order_number\":103,\"customer_number\":8},{\"order_number\":104,\"customer_number\":7},{\"order_number\":105,\"customer_number\":3},{\"order_number\":106,\"customer_number\":8},{\"order_number\":107,\"customer_number\":7},{\"order_number\":108,\"customer_number\":8},{\"order_number\":109,\"customer_number\":3}]}"
  },
  {
    "label": "One order has one winning customer",
    "input": "{\"orders\":[{\"order_number\":71,\"customer_number\":42}]}"
  },
  {
    "label": "Every order can belong to the same customer",
    "input": "{\"orders\":[{\"order_number\":5,\"customer_number\":19},{\"order_number\":11,\"customer_number\":19},{\"order_number\":28,\"customer_number\":19},{\"order_number\":36,\"customer_number\":19}]}"
  },
  {
    "label": "Large order IDs do not outweigh a larger group",
    "input": "{\"orders\":[{\"order_number\":900,\"customer_number\":5},{\"order_number\":12,\"customer_number\":6},{\"order_number\":13,\"customer_number\":6},{\"order_number\":14,\"customer_number\":6},{\"order_number\":901,\"customer_number\":5}]}"
  }
];
