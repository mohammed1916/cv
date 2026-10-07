// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different order counts and totals",
    "orders": [
      {
        "orderId": 11,
        "customerId": 1,
        "amount": 70
      },
      {
        "orderId": 12,
        "customerId": 2,
        "amount": 180
      },
      {
        "orderId": 13,
        "customerId": 1,
        "amount": 90
      },
      {
        "orderId": 14,
        "customerId": 3,
        "amount": 240
      },
      {
        "orderId": 15,
        "customerId": 2,
        "amount": 130
      },
      {
        "orderId": 16,
        "customerId": 1,
        "amount": 110
      }
    ],
    "customers": {
      "1": "Mira",
      "2": "Oren",
      "3": "Tara"
    }
  },
  {
    "label": "One order",
    "orders": [
      {
        "orderId": 21,
        "customerId": 4,
        "amount": 170
      }
    ],
    "customers": {
      "4": "Nila"
    }
  },
  {
    "label": "No orders",
    "orders": [],
    "customers": {
      "5": "Eli"
    }
  }
];
