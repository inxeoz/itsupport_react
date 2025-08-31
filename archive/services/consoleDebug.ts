// Console debugging helper for quick POST request testing
// Use this in browser console for immediate debugging

export const consoleDebug = {
  // Quick test function for console use
  async quickTest() {
    console.log("🚀 Starting quick console test...");

    try {
      const response = await fetch('https://itsupport.inxeoz.com/api/resource/Ticket', {
        method: 'POST',
        headers: {
          'Authorization': 'token 2d0c9c06260f73f:667d5babc3706d3',
          'Content-Type': 'application/json',
          'Cookie': 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en'
        },
        body: JSON.stringify({
          title: 'Console Quick Test',
          user_name: 'Console User',
          description: 'Quick console debugging test'
        }),
        credentials: 'include',
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ SUCCESS! Ticket created:", data);
        return data;
      } else {
        const error = await response.text();
        console.error("❌ FAILED:", response.status, error);
        return null;
      }
    } catch (error) {
      console.error("💥 ERROR:", error);
      return null;
    }
  },

  // Test with exact Postman data
  async postmanTest() {
    console.log("🎯 Testing exact Postman data...");

    try {
      const response = await fetch('https://itsupport.inxeoz.com/api/resource/Ticket', {
        method: 'POST',
        headers: {
          'Authorization': 'token 2d0c9c06260f73f:667d5babc3706d3',
          'Content-Type': 'application/json',
          'Cookie': 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en'
        },
        body: JSON.stringify({
          "title": "hii",
          "user_name": "hii",
          "description": "hii"
        }),
        credentials: 'include',
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ POSTMAN SUCCESS! Ticket created:", data);
        return data;
      } else {
        const error = await response.text();
        console.error("❌ POSTMAN FAILED:", response.status, error);
        return null;
      }
    } catch (error) {
      console.error("💥 POSTMAN ERROR:", error);
      return null;
    }
  },

  // Test connection only
  async testConnection() {
    console.log("🔗 Testing connection...");

    try {
      const response = await fetch('https://itsupport.inxeoz.com/api/method/ping', {
        method: 'GET',
        headers: {
          'Authorization': 'token 2d0c9c06260f73f:667d5babc3706d3',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ CONNECTION OK:", data);
        return true;
      } else {
        console.error("❌ CONNECTION FAILED:", response.status);
        return false;
      }
    } catch (error) {
      console.error("💥 CONNECTION ERROR:", error);
      return false;
    }
  },

  // Run all tests
  async runAll() {
    console.log("🧪 Running all console tests...");
    console.log("=" .repeat(40));

    // Test 1: Connection
    const connection = await this.testConnection();
    console.log(`Test 1 - Connection: ${connection ? '✅ PASS' : '❌ FAIL'}`);

    if (!connection) {
      console.log("❌ Connection failed, stopping tests");
      return;
    }

    // Test 2: Postman match
    const postman = await this.postmanTest();
    console.log(`Test 2 - Postman Match: ${postman ? '✅ PASS' : '❌ FAIL'}`);

    // Test 3: Quick test
    const quick = await this.quickTest();
    console.log(`Test 3 - Quick Test: ${quick ? '✅ PASS' : '❌ FAIL'}`);

    console.log("=" .repeat(40));
    console.log("🏁 Console tests completed");
  }
};

// Make it globally available for console use
(window as any).debugAPI = consoleDebug;

// Usage instructions
console.log(`
🔧 Console Debug Helper Loaded!

Usage in browser console:
  debugAPI.quickTest()     - Quick POST test
  debugAPI.postmanTest()   - Exact Postman match
  debugAPI.testConnection() - Test API connection
  debugAPI.runAll()        - Run all tests

Example:
  await debugAPI.runAll()
`);

export default consoleDebug;
