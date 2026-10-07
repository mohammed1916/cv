// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "No orders non-RED orders and mixed clients require different decisions",
    "input": "{\"sales\":[{\"sales_id\":4,\"name\":\"Asha\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":8,\"name\":\"Bram\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":12,\"name\":\"Cora\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":16,\"name\":\"Davi\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":20,\"name\":\"Ema\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"}],\"companies\":[{\"com_id\":2,\"name\":\"RED\",\"city\":\"Harbor\"},{\"com_id\":5,\"name\":\"BLUE\",\"city\":\"Harbor\"},{\"com_id\":9,\"name\":\"GOLD\",\"city\":\"Harbor\"}],\"orders\":[{\"order_id\":1,\"order_date\":\"2025-08-12\",\"com_id\":5,\"sales_id\":4,\"amount\":700},{\"order_id\":2,\"order_date\":\"2025-08-12\",\"com_id\":2,\"sales_id\":8,\"amount\":800},{\"order_id\":3,\"order_date\":\"2025-08-12\",\"com_id\":9,\"sales_id\":8,\"amount\":900},{\"order_id\":4,\"order_date\":\"2025-08-12\",\"com_id\":5,\"sales_id\":12,\"amount\":1000},{\"order_id\":5,\"order_date\":\"2025-08-12\",\"com_id\":2,\"sales_id\":16,\"amount\":1100},{\"order_id\":6,\"order_date\":\"2025-08-12\",\"com_id\":2,\"sales_id\":16,\"amount\":1200}]}"
  },
  {
    "label": "Without a RED company every salesperson qualifies",
    "input": "{\"sales\":[{\"sales_id\":1,\"name\":\"Faye\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":2,\"name\":\"Gus\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"}],\"companies\":[{\"com_id\":7,\"name\":\"TEAL\",\"city\":\"Harbor\"}],\"orders\":[{\"order_id\":1,\"order_date\":\"2025-08-12\",\"com_id\":7,\"sales_id\":1,\"amount\":700}]}"
  },
  {
    "label": "Zero orders still preserves the full roster",
    "input": "{\"sales\":[{\"sales_id\":3,\"name\":\"Hana\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":6,\"name\":\"Ivo\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"}],\"companies\":[{\"com_id\":1,\"name\":\"RED\",\"city\":\"Harbor\"}],\"orders\":[]}"
  },
  {
    "label": "Everyone can be excluded",
    "input": "{\"sales\":[{\"sales_id\":5,\"name\":\"Jin\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"},{\"sales_id\":9,\"name\":\"Kira\",\"salary\":50000,\"commission_rate\":8,\"hire_date\":\"2024-03-11\"}],\"companies\":[{\"com_id\":4,\"name\":\"RED\",\"city\":\"Harbor\"}],\"orders\":[{\"order_id\":1,\"order_date\":\"2025-08-12\",\"com_id\":4,\"sales_id\":5,\"amount\":700},{\"order_id\":2,\"order_date\":\"2025-08-12\",\"com_id\":4,\"sales_id\":9,\"amount\":800}]}"
  }
];
