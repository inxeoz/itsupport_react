// Test with a simpler, faster POST request
import("./src/services/frappeApiTest.js").then(async (test) => {
  await test.simplePostTest();
});

// Raw POST test
fetch("https://itsupport.inxeoz.com/api/resource/Ticket", {
  method: "POST",
  headers: {
    Authorization: "token 2d0c9c06260f73f:667d5babc3706d3",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    title: "Raw Test",
    user_name: "Test User",
    description: "Testing raw fetch",
    category: "Software",
    priority: "Low",
    status: "New",
  }),
})
  .then((response) => {
    console.log("Raw POST Response:", response.status, response.statusText);
    return response.json();
  })
  .then((data) => console.log("Raw POST Data:", data))
  .catch((error) => console.error("Raw POST Error:", error));
