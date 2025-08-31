"use strict";

const { frappeApi } = require("./frappeApi");

// Simple test runner for record_creation_bulk
(async () => {
  try {
    const { success, failed } = await frappeApi.record_creation_bulk();
    console.log("Bulk ticket creation results:");
    console.log("Successful tickets:", success);
    console.log("Failed tickets:", failed);

    if (failed.length > 0) {
      console.error(`Some records failed: ${failed.length} failures.`);
      process.exit(1);
    } else {
      console.log("All records created successfully!");
      process.exit(0);
    }
  } catch (err) {
    console.error("Test run failed with error:", err);
    process.exit(2);
  }
})();
