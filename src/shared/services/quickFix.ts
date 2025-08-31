import { frappeApi } from "./frappeApi";
import {
  runComprehensiveApiTest,
  testApiAuthenticationFix,
  testTicketCreation,
  debugPostRequest,
  testTimeoutSettings,
} from "./frappeApiTest";

// Quick fix utility for immediate testing
export class QuickFix {
  private static applied = false;

  /**
   * Apply the authentication fix to the existing API configuration
   */
  static applyAuthFix(): void {
    if (this.applied) {
      console.log("✅ Quick fix already applied");
      return;
    }

    console.log("🔧 Applying quick authentication fix...");

    // Update the API configuration for proper API key authentication
    frappeApi.updateConfig({
      skipCSRF: true, // Skip CSRF for API key authentication
      allowCookies: true, // Enable cookies (required for POST requests)
      customCookies:
        "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en", // Required session cookies
      timeout: 30000, // Increase timeout to 30 seconds
    });

    this.applied = true;
    console.log("✅ Quick fix applied successfully!");

    // Log the updated configuration
    this.showConfiguration();
  }

  /**
   * Show current API configuration
   */
  static showConfiguration(): void {
    console.log("🔍 Current API Configuration:");
    const config = frappeApi.getConfig();
    console.table({
      "Base URL": config.baseUrl,
      Endpoint: config.endpoint,
      Timeout: `${config.timeout}ms`,
      "Skip CSRF": config.skipCSRF ? "✅ Yes" : "❌ No",
      "Allow Cookies": config.allowCookies ? "✅ Yes" : "❌ No",
      "Custom Cookies": config.customCookies ? "✅ Present" : "❌ Missing",
      "Token Present": config.token ? "✅ Yes" : "❌ No",
      Retries: config.retries,
    });
  }

  /**
   * Run basic connectivity test
   */
  static async testConnection(): Promise<boolean> {
    console.log("🧪 Testing API connection...");

    try {
      const success = await testApiAuthenticationFix();
      if (success) {
        console.log("✅ Connection test PASSED");
        return true;
      } else {
        console.log("❌ Connection test FAILED");
        return false;
      }
    } catch (error) {
      console.error("❌ Connection test ERROR:", error);
      return false;
    }
  }

  /**
   * Test creating a single ticket
   */
  static async testSingleTicket(): Promise<boolean> {
    console.log("🎫 Testing single ticket creation...");

    try {
      const ticket = await testTicketCreation();
      if (ticket) {
        console.log("✅ Single ticket test PASSED:", {
          name: ticket.name,
          title: ticket.title,
          status: ticket.status,
        });
        return true;
      } else {
        console.log("❌ Single ticket test FAILED");
        return false;
      }
    } catch (error) {
      console.error("❌ Single ticket test ERROR:", error);
      return false;
    }
  }

  /**
   * Run comprehensive test suite
   */
  static async runAllTests(): Promise<void> {
    console.log("🚀 Running comprehensive test suite...");
    console.log("=".repeat(50));

    await runComprehensiveApiTest();
  }

  /**
   * Debug POST request issues in detail
   */
  static async debugPostIssues(): Promise<void> {
    console.log("🔍 Debugging POST request issues...");
    console.log("=".repeat(50));

    // Step 1: Show current configuration
    this.showConfiguration();

    // Step 2: Test raw POST request
    await debugPostRequest();

    // Step 3: Test different timeout settings
    await testTimeoutSettings();
  }

  /**
   * One-click fix and test - applies the fix and runs basic tests
   */
  static async fixAndTest(): Promise<boolean> {
    console.log("🔧 One-click fix and test starting...");
    console.log("=".repeat(50));

    // Step 1: Apply the fix
    this.applyAuthFix();

    // Step 2: Test connection
    const connectionTest = await this.testConnection();
    if (!connectionTest) {
      console.log("❌ Connection test failed, stopping here");
      return false;
    }

    // Step 3: Test single ticket creation
    const ticketTest = await this.testSingleTicket();
    if (!ticketTest) {
      console.log("⚠️ Single ticket test failed, but connection works");
      return false;
    }

    console.log("✅ All basic tests passed! Ready for bulk operations.");
    return true;
  }

  /**
   * Reset to original configuration (for testing purposes)
   */
  static reset(): void {
    console.log("🔄 Resetting to original configuration...");

    frappeApi.updateConfig({
      skipCSRF: false,
      allowCookies: true,
      customCookies:
        "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en",
      timeout: 15000,
    });

    this.applied = false;
    console.log("✅ Configuration reset to defaults");
  }

  /**
   * Debug helper - shows detailed diagnostic information
   */
  static debug(): void {
    console.log("🔍 Detailed diagnostic information:");
    console.log("=".repeat(50));

    // Show configuration
    this.showConfiguration();

    // Show environment
    console.log("\n📊 Environment Info:");
    console.table({
      "User Agent": navigator.userAgent,
      "Current URL": window.location.href,
      Protocol: window.location.protocol,
      Host: window.location.host,
      Timestamp: new Date().toISOString(),
    });

    // Show debug info from API service
    const debugInfo = frappeApi.getDebugInfo();
    console.log("\n🔧 API Debug Info:");
    console.log(debugInfo);
  }
}

// Auto-apply fix when this module is imported (optional)
// Uncomment the line below to automatically apply the fix on import
// QuickFix.applyAuthFix();

// Export individual functions for convenience
export const {
  applyAuthFix,
  showConfiguration,
  testConnection,
  testSingleTicket,
  runAllTests,
  fixAndTest,
  reset,
  debug,
  debugPostIssues,
} = QuickFix;

// Export the class as default
export default QuickFix;

// Usage examples (copy these to console):
/*
// Quick fix and test everything
await QuickFix.fixAndTest();

// Or step by step:
QuickFix.applyAuthFix();
await QuickFix.testConnection();
await QuickFix.testSingleTicket();

// Debug POST request issues specifically
await QuickFix.debugPostIssues();

// Show configuration
QuickFix.showConfiguration();

// Debug mode
QuickFix.debug();

// Reset to original (if needed)
QuickFix.reset();
*/
