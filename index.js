/*
  KAITO MD
*/

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const Pino = require("pino");

// CONFIG
const prefix = ".";
const owner = "50935042439"; //

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["MiniBot-MD", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;

      const from = m.key.remoteJid;
      const sender = m.key.participant || from;

      const body =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        "";

      if (!body.startsWith(prefix)) return;

      const args = body.slice(prefix.length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();

      // MENU MD
      if (cmd === "menu") {
        return sock.sendMessage(from, {
          text: `╭───〔 🤖 KAITO MD 〕───╮
│
│ 👑 Owner : ${owner}
│ ⚙ Prefix : ${prefix}
│
│ 📜 COMMANDES
│ • ${prefix}menu
│ • ${prefix}ping
│ • ${prefix}alive
│ • ${prefix}owner
│
╰────────────────────╯`
        });
      }

      if (cmd === "ping") {
        return sock.sendMessage(from, { text: "🏓 Pong !" });
      }

      if (cmd === "alive") {
        return sock.sendMessage(from, {
          text: "✅ Bot en ligne et opérationnel"
        });
      }

      if (cmd === "owner") {
        return sock.sendMessage(from, {
          text: `👑 Owner : wa.me/${owner}`
        });
      }

    } catch (err) {
      console.log("Erreur :", err);
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ KAITO MD connecté");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("♻ Reconnexion...");
        startBot();
      } else {
        console.log("❌ Déconnecté définitivement");
      }
    }
  });
}

startBot();