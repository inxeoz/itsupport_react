import { frappeApi } from "./frappeApi";
import type { FrappeTicket } from "./frappeApi";

// Test function to verify API authentication fix
export async function testApiAuthenticationFix(): Promise<boolean> {
  console.log("🧪 Testing Frappe API authentication fix...");

  try {
    // First, test basic connection
    console.log("📡 Testing API connection...");
    const connectionTest = await frappeApi.testConnection();
    console.log("✅ Connection test successful:", connectionTest);

    // Test fetching tickets
    console.log("📋 Testing ticket retrieval...");
    const tickets = await frappeApi.getTickets();
    console.log(`✅ Successfully retrieved ${tickets.length} tickets`);

    return true;
  } catch (error) {
    console.error("❌ API test failed:", error);
    return false;
  }
}

// Test creating a single ticket with the fixed authentication
export async function testTicketCreation(): Promise<FrappeTicket | null> {
  console.log("🎫 Testing ticket creation with fixed authentication...");

  const testTicketData = {
    title: "Authentication Test Ticket",
    user_name: "API Test User",
    description:
      "This ticket was created to test the API authentication fix. If you see this ticket, the authentication is working correctly.",
    category: "Software",
    priority: "Low",
    impact: "Single User",
    status: "New",
    contact_email: "test@company.com",
    department: "IT",
  };

  try {
    const createdTicket = await frappeApi.createTicket(testTicketData);
    console.log("✅ Test ticket created successfully:", {
      name: createdTicket.name,
      title: createdTicket.title,
      status: createdTicket.status,
    });
    return createdTicket;
  } catch (error) {
    console.error("❌ Ticket creation test failed:", error);
    return null;
  }
}

// Test bulk ticket creation with smaller batch
export async function testBulkTicketCreation(): Promise<boolean> {
  console.log("📦 Testing bulk ticket creation...");

  const testTickets = [
    {
      title: "Bulk Test Ticket 1",
      user_name: "Bulk Test User 1",
      description: "First test ticket for bulk creation",
      category: "Hardware",
      priority: "Medium",
      impact: "Single User",
      status: "New",
    },
    {
      title: "Bulk Test Ticket 2",
      user_name: "Bulk Test User 2",
      description: "Second test ticket for bulk creation",
      category: "Software",
      priority: "Low",
      impact: "Single User",
      status: "New",
    },
  ];

  try {
    const bulkResult = await frappeApi.create_ticket_in_bulk(testTickets, {
      batchSize: 1,
      delayBetweenRequests: 3000,
      delayBetweenBatches: 5000,
      stopOnError: false,
      maxRetries: 2,
    });

    console.log("✅ Bulk creation test completed:", {
      total: bulkResult.total,
      completed: bulkResult.completed,
      failed: bulkResult.failed,
      successRate: `${Math.round((bulkResult.completed / bulkResult.total) * 100)}%`,
    });

    return bulkResult.completed > 0;
  } catch (error) {
    console.error("❌ Bulk creation test failed:", error);
    return false;
  }
}

// Comprehensive test suite
export async function runComprehensiveApiTest(): Promise<void> {
  console.log("🚀 Starting comprehensive API test suite...");
  console.log("=".repeat(50));

  // Test 1: Basic authentication and connection
  const authTest = await testApiAuthenticationFix();
  console.log(`Test 1 - Authentication: ${authTest ? "✅ PASS" : "❌ FAIL"}`);

  if (!authTest) {
    console.log("❌ Authentication failed, skipping remaining tests");
    return;
  }

  // Test 2: Single ticket creation
  const singleTicketTest = await testTicketCreation();
  console.log(
    `Test 2 - Single Ticket Creation: ${singleTicketTest ? "✅ PASS" : "❌ FAIL"}`,
  );

  // Test 3: Small bulk creation (only if single creation works)
  if (singleTicketTest) {
    const bulkTest = await testBulkTicketCreation();
    console.log(
      `Test 3 - Bulk Ticket Creation: ${bulkTest ? "✅ PASS" : "❌ FAIL"}`,
    );
  } else {
    console.log(
      "Test 3 - Bulk Ticket Creation: ⏭️ SKIPPED (single creation failed)",
    );
  }

  console.log("=".repeat(50));
  console.log("🏁 Test suite completed");
}

// Debug function to show current API configuration
export function debugApiConfiguration(): void {
  console.log("🔍 Current API Configuration:");
  const config = frappeApi.getConfig();
  console.log({
    baseUrl: config.baseUrl,
    endpoint: config.endpoint,
    timeout: config.timeout,
    skipCSRF: config.skipCSRF,
    allowCookies: config.allowCookies,
    customCookies: config.customCookies || "(empty)",
    tokenPresent: !!config.token,
    retries: config.retries,
  });
}

// Debug POST request specifically
export async function debugPostRequest(): Promise<void> {
  console.log("🔍 Debugging POST request in detail...");

  const testData = {
    title: "Debug Test Ticket",
    user_name: "Debug User",
    description: "Testing POST request debugging",
    category: "Software",
    priority: "Low",
    impact: "Single User",
    status: "New",
  };

  try {
    console.log("📤 Sending raw POST request...");
    const config = frappeApi.getConfig();
    const url = `${config.baseUrl}${config.endpoint}`;

    console.log("🌐 Request details:", {
      url,
      method: "POST",
      headers: {
        Authorization: `token ${config.token.substring(0, 10)}...`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testData),
    });

    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${config.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testData),
      signal: AbortSignal.timeout(10000), // 10 second timeout for debugging
    });

    const endTime = Date.now();
    console.log(`⏱️ Request took ${endTime - startTime}ms`);

    console.log("📡 Response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ POST request successful:", data);
    } else {
      const errorText = await response.text();
      console.error("❌ POST request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
    }
  } catch (error) {
    console.error("💥 POST request error:", error);

    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        console.error("⏰ Request timed out after 10 seconds");
      } else if (error.name === "AbortError") {
        console.error("🚫 Request was aborted");
      } else if (error.message.includes("Failed to fetch")) {
        console.error("🌐 Network error - check connectivity");
      }
    }
  }
}

// Test with different timeout values
export async function testTimeoutSettings(): Promise<void> {
  console.log("⏱️ Testing different timeout settings...");

  const timeouts = [5000, 10000, 15000, 30000]; // 5s, 10s, 15s, 30s

  for (const timeout of timeouts) {
    console.log(`\n🧪 Testing with ${timeout}ms timeout...`);

    try {
      // Update config with new timeout
      frappeApi.updateConfig({ timeout });

      const startTime = Date.now();
      const result = await testTicketCreation();
      const endTime = Date.now();

      if (result) {
        console.log(
          `✅ Success with ${timeout}ms timeout (took ${endTime - startTime}ms)`,
        );
        break; // Success, no need to test longer timeouts
      } else {
        console.log(`❌ Failed with ${timeout}ms timeout`);
      }
    } catch (error) {
      console.log(`💥 Error with ${timeout}ms timeout:`, error);
    }

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Export all test functions for use in components
export {
  testApiAuthenticationFix as testAuth,
  testTicketCreation as testSingleTicket,
  testBulkTicketCreation as testBulkTickets,
  runComprehensiveApiTest as runAllTests,
  debugApiConfiguration as showConfig,
  debugPostRequest as debugPost,
  testTimeoutSettings as testTimeouts,
  simplePostTest as testSimplePost,
  rawPostTest as testRawPost,
  exactPostmanTest as testExactPostman,
  quickTimeoutTest as testQuickTimeout,
  directTicketTest as testDirectTicket,
};

// Simple POST test with minimal data to isolate timeout issues
export async function simplePostTest(): Promise<boolean> {
  console.log("🧪 Running simple POST test with minimal data...");

  const minimalData = {
    title: "Simple Test",
    user_name: "Test User",
    description: "Minimal test data",
    category: "Software",
    priority: "Low",
    impact: "Single User",
    status: "New",
  };

  try {
    const config = frappeApi.getConfig();
    const url = `${config.baseUrl}${config.endpoint}`;

    console.log("📤 Sending minimal POST request...");
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${config.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(minimalData),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    const endTime = Date.now();
    console.log(`⏱️ Request completed in ${endTime - startTime}ms`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Simple POST test successful:", {
        name: result.data?.name,
        status: response.status,
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Simple POST test failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }
  } catch (error) {
    console.error("💥 Simple POST test error:", error);
    return false;
  }
}

// Exact Postman match test - uses minimal data like successful Postman request
export async function exactPostmanTest(): Promise<boolean> {
  console.log("🎯 Running exact Postman match test...");

  // Use exactly the same minimal data that worked in Postman
  const postmanData = {
    title: "hii",
    user_name: "hii",
    description: "hii",
  };

  try {
    const config = frappeApi.getConfig();
    const url = `${config.baseUrl}${config.endpoint}`;

    console.log("📤 Sending exact Postman match request...");
    console.log("📋 Data (same as Postman):", postmanData);

    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${config.token}`,
        "Content-Type": "application/json",
        Cookie:
          "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en",
      },
      body: JSON.stringify(postmanData),
      credentials: "include",
    });

    const endTime = Date.now();
    console.log(
      `⏱️ Exact Postman request completed in ${endTime - startTime}ms`,
    );

    console.log("📡 Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Exact Postman test SUCCESS:", {
        name: result.data?.name,
        title: result.data?.title,
        category: result.data?.category,
        status: result.data?.status,
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Exact Postman test FAILED:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }
  } catch (error) {
    console.error("💥 Exact Postman test ERROR:", error);
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        console.error("⏰ Request timed out - server may be slow");
      } else if (error.message.includes("Failed to fetch")) {
        console.error("🌐 Network error - check connectivity");
      }
    }
    return false;
  }
}

// Quick timeout test - uses 5 second timeout for immediate feedback
export async function quickTimeoutTest(): Promise<boolean> {
  console.log("⚡ Running quick timeout test (5 second limit)...");

  const quickData = {
    title: "Quick Test",
    user_name: "Quick User",
    description: "5 second timeout test",
  };

  try {
    const config = frappeApi.getConfig();
    const url = `${config.baseUrl}${config.endpoint}`;

    console.log("📤 Sending quick timeout request...");
    const startTime = Date.now();

    // Use AbortController for precise 5 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${config.token}`,
        "Content-Type": "application/json",
        Cookie:
          "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en",
      },
      body: JSON.stringify(quickData),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    console.log(`⏱️ Quick request completed in ${endTime - startTime}ms`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Quick timeout test SUCCESS:", {
        name: result.data?.name,
        duration: `${endTime - startTime}ms`,
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Quick timeout test FAILED:", {
        status: response.status,
        error: errorText,
        duration: `${endTime - startTime}ms`,
      });
      return false;
    }
  } catch (error) {
    console.error("💥 Quick timeout test ERROR:", error);
    if (error instanceof Error && error.name === "AbortError") {
      console.error("⏰ Request aborted after 5 seconds - server too slow");
    }
    return false;
  }
}

// Test direct ticket creation method that bypasses makeRequest wrapper
export async function directTicketTest(): Promise<boolean> {
  console.log("🎯 Testing direct ticket creation (bypassing wrapper)...");

  const testData = {
    title: "Direct Method Test",
    user_name: "Direct User",
    description: "Testing direct createTicketDirect method",
    category: "Software",
    priority: "Low",
    impact: "Single User",
    status: "New",
  };

  try {
    const createdTicket = await frappeApi.createTicketDirect(testData);
    console.log("✅ Direct ticket creation SUCCESS:", {
      name: createdTicket.name,
      title: createdTicket.title,
      status: createdTicket.status,
    });
    return true;
  } catch (error) {
    console.error("❌ Direct ticket creation FAILED:", error);
    return false;
  }
}

// Raw POST test that matches exactly what works in Postman
export async function rawPostTest(): Promise<boolean> {
  console.log("🧪 Running raw POST test (matching Postman)...");

  const testData = {
    title: "Raw Browser Test",
    user_name: "Browser User",
    description: "Testing raw fetch to match Postman success",
  };

  try {
    const config = frappeApi.getConfig();
    const url = `${config.baseUrl}${config.endpoint}`;

    console.log("📤 Sending raw POST request with session cookies...");
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${config.token}`,
        "Content-Type": "application/json",
        Cookie:
          "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en",
      },
      body: JSON.stringify(testData),
      credentials: "include",
    });

    const endTime = Date.now();
    console.log(`⏱️ Raw request completed in ${endTime - startTime}ms`);

    console.log("📡 Raw response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Raw POST test successful:", {
        name: result.data?.name,
        title: result.data?.title,
        status: response.status,
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Raw POST test failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }
  } catch (error) {
    console.error("💥 Raw POST test error:", error);
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        console.error("⏰ Raw request timed out");
      } else if (error.message.includes("Failed to fetch")) {
        console.error("🌐 Network error in raw request");
      }
    }
    return false;
  }
}
