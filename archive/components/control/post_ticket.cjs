const fs = require("fs");
const axios = require("axios");

// ==== CONFIGURE THESE ====
const API_KEY = "bf51e69ec33ecb2";
const API_SECRET = "1c49af10fe9538f";
const BASE_URL = "http://localhost:8001"; // your Frappe instance
const JSON_FILE = "./data/ticket.json"; // file containing the array of tickets
const CHILD_TAG_DOCTYPE = "Ticket Tag"; // your child table DocType name if tags are a table

// 1️⃣ Read JSON file
const tickets = JSON.parse(
  fs.readFileSync("./src/components/data/ticket.json", "utf8"),
);

// 2️⃣ Loop through each ticket and POST to Frappe
async function postTickets() {
  for (let ticket of tickets) {
    try {
      let tagsString = "";
      if (Array.isArray(ticket.tags)) {
        tagsString = ticket.tags.join(", "); // e.g. "Tag1, Tag2, Tag3"
      } else if (typeof ticket.tags === "string") {
        tagsString = ticket.tags; // already a string
      }

      // Prepare the payload for creation
      const payload = {
        doctype: "Ticket",
        title: ticket.title,
        description: ticket.description,
        agent: ticket.agent,
        status: ticket.status,
        priority: ticket.priority,
        creation_date: ticket.creationDate, // match your field names
        resolution_date: ticket.resolutionDate, // match your field names
        tags: tagsString,
      };

      // POST the ticket
      const res = await axios.post(`${BASE_URL}/api/resource/Ticket`, payload, {
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ Created ticket: ${res.data.data.name}`);
    } catch (err) {
      console.error(
        `❌ Error creating ticket "${ticket.title}":`,
        err.response ? err.response.data : err.message,
      );
    }
  }
}

// Run the function
postTickets();
