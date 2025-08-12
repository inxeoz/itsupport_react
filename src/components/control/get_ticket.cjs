const { axios } = require("axios");

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "http://localhost:8001//api/resource/Ticket/0004",
  headers: {
    Authorization: "token bf51e69ec33ecb2:1c49af10fe9538f",
    Cookie:
      "full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_lang=en",
  },
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
