import https from "https";
import fs from "fs";
import path from "path";
import app from "./app"; // import the Express app as a default export

const PORT = process.env.PORT || 8000;

// Read SSL certificate/key from files
const key = fs.readFileSync(path.join(__dirname, "../../ssl/key.pem"), "utf8");
const cert = fs.readFileSync(
  path.join(__dirname, "../../ssl/cert.pem"),
  "utf8",
);

// Create an HTTPS server using the app
https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT} ...`);
});
