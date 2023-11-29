import fs from "fs";
import { config } from "dotenv";
import pkg from "whatsapp-web.js";

config();

const { LocalAuth, Client } = pkg;

const SESSION_FILE_PATH = "./session.json";

let sessionData;
let closefriends = ["919090696901@c.us", "918591075356@c.us"];
let ack = ["ya", "ok", "acha", "aha", "hmm", "thik hey", "k", "busy wait ttyl"];

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

const reqnres = async (req) => {
  if (
    req == "hi" ||
    "hii" ||
    "Hi" ||
    "Hii" ||
    "Hey" ||
    "hey" ||
    "yo" ||
    "yoo"
  ) {
    return ack[Math.floor(Math.random() * ack.length)];
  }
};

console.log(reqnres("hii who are you ?"));

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

// client.on("authenticated", (session) => {
//   console.log("Authenticated session", session);
//   if (session) {
//     console.log(session);
//     sessionData = session;
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
//       if (err) {
//         console.error(err);
//       }
//     });
//   }
// });

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  if (closefriends.includes(message.from)) {
    if (message.hasMedia) {
      try {
        // React to the received message
        await message.react("👍"); // You can use any emoji as a reaction
        console.log("Reacted to the message with a thumbs-up emoji!");
      } catch (error) {
        console.error("Error reacting to the message:", error);
      }
    }
    if (typeof message.body === "string") {
      try {
        const response = await reqnres(message.body);
        await client.sendMessage(message.from, response);
      } catch (e) {
        console.log(e);
      }
    }
  }
});

client.initialize();
