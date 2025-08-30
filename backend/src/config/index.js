require('dotenv').config();

module.exports = {
  openaiKey: process.env.OPENAI_API_KEY,
  deeplKey: process.env.DEEPL_API_KEY,
  port: process.env.PORT || 5500
};
