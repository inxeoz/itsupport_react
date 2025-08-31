var http = require('follow-redirects').http;
var fs = require('fs');

var options = {
  'method': 'POST',
  'hostname': '10.120.9.21',
  'port': 8000,
  'path': '/api/resource/Ticket',
  'headers': {
    'Authorization': 'token 1212:1212',
    'Content-Type': 'application/json',
    'Cookie': 'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en'
  },
  'maxRedirects': 20
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = JSON.stringify({
  "doctype": "Ticket",
  "user_name": "BOY Doe",
  "department": "IT",
  "contact_email": "john.doe@example.com",
  "contact_phone": "1234567890",
  "title": "Network connectivity issue",
  "description": "Unable to connect to the office Wi-Fi since morning.",
  "category": "Network",
  "subcategory": "Wi-Fi",
  "priority": "High",
  "impact": "Single User",
  "status": "New",
  "assignee": "jane.smith",
  "due_datetime": "2025-08-25T17:00:00",
  "resolution_summary": "",
  "root_cause": "",
  "requester_confirmation": "No",
  "time_spent": 0,
  "attachments": "",
  "tags": "network,urgent"
});

req.write(postData);

req.end();