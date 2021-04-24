const axios = require("axios");

exports.fetch = async (callString) => {
  return await axios.get(callString).then((res) => res.data)
}