const https = require("https");
const fs = require("fs");
const path = require("path");
const app = require("./app");

const PORT = process.env.PORT || 8000;
const key = fs.readFileSync(path.join(__dirname, "../../ssl/key.pem"), "utf8");
const cert = fs.readFileSync(
  path.join(__dirname, "../../ssl/cert.pem"),
  "utf8",
);

https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});
