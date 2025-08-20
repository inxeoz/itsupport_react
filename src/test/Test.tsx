import React, { useState } from "react";
import { API_TOKEN, BASE_URL } from "../env";

const ticketData = {
  doctype: "Ticket",
  user_name: "BOY Doe",
  department: "IT",
  contact_email: "john.doe@example.com",
  contact_phone: "1234567890",
  title: "Network connectivity issue",
  description: "Unable to connect to the office Wi-Fi since morning.",
  category: "Network",
  subcategory: "Wi-Fi",
  priority: "High",
  impact: "Single User",
  status: "New",
  assignee: "jane.smith",
  due_datetime: "2025-08-25T17:00:00",
  resolution_summary: "",
  root_cause: "",
  requester_confirmation: "No",
  time_spent: 0,
  attachments: "",
  tags: "network,urgent"
};

export const TestTicketButton: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${BASE_URL}/api/resource/Ticket`, {
        method: "POST",
        credentials: "omit",
        headers: {
          "Authorization": `token ${API_TOKEN}`,
          "Content-Type": "application/json",

          // Do NOT send Cookie header here!
        },
        body: JSON.stringify(ticketData)
      });
      const text = await res.text();
      setResponse(text);
    } catch (err: any) {
      setResponse("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleTest} disabled={loading}>
        {loading ? "Testing..." : "Test"}
      </button>
      {response && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{response}</pre>
      )}
    </div>
  );
};

export default TestTicketButton;