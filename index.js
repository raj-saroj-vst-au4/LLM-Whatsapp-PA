import fs from "fs";
import { config } from "dotenv";
import pkg from "whatsapp-web.js";
import { NlpManager } from "node-nlp";
import qrcode from "qrcode-terminal";

config();

const { LocalAuth, Client } = pkg;
const nlpman = new NlpManager({ languages: ["en"] });

const SESSION_FILE_PATH = "./session.json";

let sessionData;
let closefriends = [
  "919090696901@c.us",
  "918591075356@c.us",
  "917021586822@c.us",
];

// greeting
nlpman.addDocument("en", "hi", "greeting");
nlpman.addDocument("en", "hello", "greeting");
nlpman.addDocument("en", "hey", "greeting");
nlpman.addDocument("en", "yo", "greeting");
nlpman.addDocument("en", "good morning", "greeting");
nlpman.addAnswer("en", "greeting", "Ha say na");
nlpman.addAnswer("en", "greeting", "ya ?");
nlpman.addAnswer("en", "greeting", "aha ?");
nlpman.addAnswer("en", "greeting", "hmm ?");

//basicq&a - location requests
nlpman.addDocument("en", "kahan hey ?", "locreq");
nlpman.addDocument("en", "kidr pe hey", "locreq");
nlpman.addDocument("en", "where are u", "locreq");
nlpman.addDocument("en", "kaha ho", "locreq");
nlpman.addAnswer("en", "locreq", "ya ?");
nlpman.addAnswer("en", "locreq", "ghr");
nlpman.addAnswer("en", "locreq", "home");
nlpman.addAnswer("en", "locreq", "kaam kr rha hu sayna ?");
nlpman.addAnswer("en", "locreq", "gharpe");
nlpman.addAnswer("en", "locreq", "busy ttyl");

//basicq&a - food requests
nlpman.addDocument("en", "khana khaya ?", "foodreq");
nlpman.addDocument("en", "done with dinner", "foodreq");
nlpman.addDocument("en", "lunch done ?", "foodreq");
nlpman.addDocument("en", "kuch khaya", "foodreq");
nlpman.addDocument("en", "dinner hua ?", "foodreq");
nlpman.addAnswer("en", "foodreq", "not yet baba ttyl");
nlpman.addAnswer("en", "foodreq", "na");
nlpman.addAnswer("en", "foodreq", "kaam hey baadme dekhta hu");
nlpman.addAnswer("en", "foodreq", "thode der baad");

//basicq&a - lame requests
nlpman.addDocument("en", "bahar aarha hey ?", "lamereq");
nlpman.addDocument("en", "niche kab ayega", "lamereq");
nlpman.addDocument("en", "aarhey ho ?", "lamereq");
nlpman.addDocument("en", "lene aoge ?", "lamereq");
nlpman.addDocument("en", "coming ?", "lamereq");
nlpman.addAnswer("en", "lamreq", "kya hua ?");
nlpman.addAnswer("en", "lamreq", "dekhta hu");
nlpman.addAnswer("en", "lamreq", "nhi yaar kaam hey");
nlpman.addAnswer("en", "lamreq", "thode der baad ?");

//basicq&a - boring ones
nlpman.addDocument("en", "kya karing ?", "boringreq");
nlpman.addDocument("en", "gussa ho", "boringreq");
nlpman.addDocument("en", "what are you doing ?", "boringreq");
nlpman.addDocument("en", "call karu ?", "boringreq");
nlpman.addAnswer("en", "boringreq", "busy ttyl");
nlpman.addAnswer("en", "boringreq", "kaam kar rha hu baadme call krta hu");
nlpman.addAnswer("en", "boringreq", "baadme baat krta hu");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

client.on("qr", async (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

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
        console.log("recieved whatsapp msg", message.body);
        const response = await nlpman.process(message.body);
        console.log("Ai response ", response.answer);
        if (response.answer) {
          return await client.sendMessage(message.from, response.answer);
        }
        return;
      } catch (e) {
        console.log(e);
      }
    }
  }
});

nlpman
  .train()
  .then(() => {
    nlpman.save();
  })
  .then(() => {
    client.initialize();
  });
