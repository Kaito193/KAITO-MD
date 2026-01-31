const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const Pino = require("pino");
const config = require("./config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    // Commandes
    if (text === `${config.prefix}ping`) {
      await sock.sendMessage(from, { text: "pong 🏓" });
    }

    if (text === `${config.prefix}menu`) {
      await sock.sendMessage(from, {
        text: `📜 *MENU*
!ping
!menu`
      });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ MiniBot connecté");
    }
  });
}

startBot();