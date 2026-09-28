/* =========================================================
   MEWAT AI BACKEND
   Node.js + Express + Groq API

   App Name:
   MEWAT AI

   Founder:
   AASIF FAJRUDDIN

   Features:
   - AI Chat
   - Chat History
   - New Chat
   - Delete Chat
   - Context Memory
   - Live Server Compatible
========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");


/* =========================================================
   APP CONFIG
========================================================= */

const app = express();

const PORT =
  process.env.PORT || 3000;


/* =========================================================
   GROQ CONFIG
========================================================= */

const GROQ_API_KEY =
  process.env.GROQ_API_KEY;


if (!GROQ_API_KEY) {

  console.error("");
  console.error(
    "ERROR: GROQ_API_KEY .env file me nahi mili."
  );
  console.error("");

  process.exit(1);

}


const groq =
  new Groq({
    apiKey:
      GROQ_API_KEY
  });


console.log(
  "Groq API key loaded:",
  !!GROQ_API_KEY
);


/* =========================================================
   FILE STORAGE
========================================================= */

const CHATS_FILE =
  path.join(
    __dirname,
    "chats.json"
  );


function ensureChatsFile() {

  if (
    !fs.existsSync(
      CHATS_FILE
    )
  ) {

    fs.writeFileSync(

      CHATS_FILE,

      JSON.stringify(
        [],
        null,
        2
      ),

      "utf8"

    );

  }

}


function readChats() {

  ensureChatsFile();

  try {

    const data =
      fs.readFileSync(
        CHATS_FILE,
        "utf8"
      );


    if (!data.trim()) {

      return [];

    }


    const chats =
      JSON.parse(data);


    return Array.isArray(chats)
      ? chats
      : [];

  }

  catch (error) {

    console.error(
      "chats.json read error:",
      error
    );

    return [];

  }

}


function writeChats(
  chats
) {

  fs.writeFileSync(

    CHATS_FILE,

    JSON.stringify(
      chats,
      null,
      2
    ),

    "utf8"

  );

}


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(

  cors({
    origin: true
  })

);


app.use(

  express.json({
    limit: "10mb"
  })

);


app.use(

  express.urlencoded({
    extended: true,
    limit: "10mb"
  })

);


/*
   Live website / phone ke liye
   same server se frontend serve hoga.
*/

app.use(
  express.static(
    __dirname
  )
);


/* =========================================================
   MEWAT AI SYSTEM IDENTITY
========================================================= */

const MEWAT_SYSTEM_PROMPT = `

You are MEWAT AI.

Your name is MEWAT AI.

The founder of MEWAT AI is AASIF FAJRUDDIN.

If anyone asks:

Who is the founder of MEWAT AI?
Who created MEWAT AI?
MEWAT AI ka founder kaun hai?
MEWAT AI kisne banaya?
MEWAT AI ke founder kon hain?

Answer:

"The founder of MEWAT AI is AASIF FAJRUDDIN."

Never replace the founder name with another person.

Do not call yourself ORVEXA AI.

Always identify yourself as MEWAT AI.

Be helpful, accurate, professional and friendly.

Answer in the same language used by the user unless
the user specifically asks for another language.

Maintain conversation context.

Do not invent facts.

`;


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
  "/",
  (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>MEWAT AI</title>

  <style>

    body {
      margin:0;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#101010;
      color:white;
      font-family:Arial,sans-serif;
    }

    .box {
      width:90%;
      max-width:650px;
      padding:35px;
      border-radius:20px;
      background:#1d1d1d;
      box-shadow:
        0 20px 60px
        rgba(0,0,0,.4);
      text-align:center;
    }

    h1 {
      margin-top:0;
    }

    .ok {
      color:#00e676;
      font-weight:bold;
    }

    .founder {
      margin-top:25px;
      padding:18px;
      border-radius:14px;
      background:#111827;
    }

  </style>

</head>

<body>

  <div class="box">

    <h1>MEWAT AI</h1>

    <p class="ok">
      ● Server is running
    </p>

    <p>
      MEWAT AI backend successfully connected.
    </p>

    <p>
      Port: ${PORT}
    </p>

    <div class="founder">

      <strong>
        Founder
      </strong>

      <br><br>

      AASIF FAJRUDDIN

    </div>

  </div>

</body>

</html>

`);

  }

);


/* =========================================================
   STATUS
========================================================= */

app.get(
  "/api/status",
  (req, res) => {

    res.status(200).json({

      success:
        true,

      app:
        "MEWAT AI",

      founder:
        "AASIF FAJRUDDIN",

      server:
        "running",

      groq:
        "connected",

      chatHistory:
        "enabled"

    });

  }

);


/* =========================================================
   HELPERS
========================================================= */

function cleanText(
  value
) {

  if (
    typeof value !==
    "string"
  ) {

    return "";

  }

  return value.trim();

}


function createChatTitle(
  message
) {

  const text =
    cleanText(
      message
    );


  if (!text) {

    return "New Chat";

  }


  if (
    text.length <= 40
  ) {

    return text;

  }


  return (
    text.substring(
      0,
      40
    ) +
    "..."
  );

}


function createMessage(
  role,
  content
) {

  return {

    role:
      role,

    content:
      content,

    timestamp:
      new Date()
        .toISOString()

  };

}


/* =========================================================
   GET ALL CHATS
========================================================= */

app.get(
  "/api/chats",
  (req, res) => {

    try {

      const chats =
        readChats();


      chats.sort(
        (a, b) =>

          new Date(
            b.updatedAt || 0
          ) -

          new Date(
            a.updatedAt || 0
          )

      );


      const list =
        chats.map(
          chat => ({

            id:
              chat.id,

            title:
              chat.title ||
              "New Chat",

            createdAt:
              chat.createdAt,

            updatedAt:
              chat.updatedAt,

            messageCount:
              Array.isArray(
                chat.messages
              )
                ? chat.messages.length
                : 0

          })
        );


      return res
        .status(200)
        .json(list);

    }

    catch (error) {

      console.error(
        "GET /api/chats:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          error:
            "Chat history load nahi ho saki."

        });

    }

  }

);


/* =========================================================
   CREATE NEW CHAT
========================================================= */

app.post(
  "/api/chats",
  (req, res) => {

    try {

      const chats =
        readChats();


      const now =
        new Date()
          .toISOString();


      const chat = {

        id:
          "chat-" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 8),

        title:
          "New Chat",

        messages:
          [],

        createdAt:
          now,

        updatedAt:
          now

      };


      chats.push(
        chat
      );


      writeChats(
        chats
      );


      return res
        .status(201)
        .json(chat);

    }

    catch (error) {

      console.error(
        "CREATE CHAT:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          error:
            "New chat create nahi ho paayi."

        });

    }

  }

);


/* =========================================================
   GET SINGLE CHAT
========================================================= */

app.get(
  "/api/chats/:id",
  (req, res) => {

    try {

      const chats =
        readChats();


      const chat =
        chats.find(
          item =>
            item.id ===
            req.params.id
        );


      if (!chat) {

        return res
          .status(404)
          .json({

            success:
              false,

            error:
              "Chat not found."

          });

      }


      return res
        .status(200)
        .json(chat);

    }

    catch (error) {

      console.error(
        "GET CHAT:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          error:
            "Chat load nahi ho paayi."

        });

    }

  }

);


/* =========================================================
   DELETE CHAT
========================================================= */

app.delete(
  "/api/chats/:id",
  (req, res) => {

    try {

      const chats =
        readChats();


      const filtered =
        chats.filter(
          chat =>
            chat.id !==
            req.params.id
        );


      if (
        filtered.length ===
        chats.length
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            error:
              "Chat not found."

          });

      }


      writeChats(
        filtered
      );


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Chat deleted."

        });

    }

    catch (error) {

      console.error(
        "DELETE CHAT:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          error:
            "Chat delete nahi ho paayi."

        });

    }

  }

);


/* =========================================================
   HISTORY CLEANER
========================================================= */

function prepareHistory(
  history
) {

  if (
    !Array.isArray(
      history
    )
  ) {

    return [];

  }


  return history

    .filter(
      item =>

        item &&

        (
          item.role === "user" ||
          item.role === "assistant"
        )

    )

    .map(
      item => ({

        role:
          item.role,

        content:
          cleanText(
            item.content ||
            item.text ||
            ""
          )

      })
    )

    .filter(
      item =>
        item.content.length > 0
    );

}


/* =========================================================
   EXTRACT MESSAGE FROM REQUEST
========================================================= */

function extractUserMessage(
  body
) {

  /*
    New app:
    body.message
  */

  if (
    typeof body?.message ===
    "string" &&
    body.message.trim()
  ) {

    return body.message.trim();

  }


  /*
    Alternate app:
    body.messages
  */

  if (
    Array.isArray(
      body?.messages
    )
  ) {

    const userMessages =
      body.messages.filter(
        item =>
          item &&
          item.role ===
          "user" &&
          typeof item.content ===
          "string"
      );


    if (
      userMessages.length
    ) {

      return userMessages[
        userMessages.length - 1
      ]
        .content
        .trim();

    }

  }


  return "";

}


/* =========================================================
   EXTRACT HISTORY FROM REQUEST
========================================================= */

function extractHistory(
  body,
  chat
) {

  /*
    Agar frontend history bhej raha hai
  */

  if (
    Array.isArray(
      body?.history
    )
  ) {

    return prepareHistory(
      body.history
    );

  }


  /*
    Agar frontend messages bhej raha hai
  */

  if (
    Array.isArray(
      body?.messages
    )
  ) {

    return prepareHistory(
      body.messages
    );

  }


  /*
    Server ki saved history
  */

  if (
    Array.isArray(
      chat?.messages
    )
  ) {

    return prepareHistory(
      chat.messages
    );

  }


  return [];

}


/* =========================================================
   GENERATE AI RESPONSE
========================================================= */

async function generateAIResponse({

  message,

  history,

  language

}) {

  let selectedLanguage =
    "the same language as the user";


  if (
    language &&
    language !== "auto"
  ) {

    selectedLanguage =
      language;

  }


  const systemPrompt = `

${MEWAT_SYSTEM_PROMPT}

Respond in:
${selectedLanguage}

Conversation rules:

- Understand previous messages.
- Maintain context.
- Answer the user's current question.
- Do not confuse different chats.
- Do not invent information.
- If you don't know something, say so.
- Be clear and useful.

`;


  const messages = [

    {

      role:
        "system",

      content:
        systemPrompt

    },

    ...history.slice(-30),

    {

      role:
        "user",

      content:
        message

    }

  ];


  /*
    IMPORTANT:
    Sirf valid Groq chat completion
    use ki ja rahi hai.
  */

  const completion =
    await groq.chat.completions.create({

      model:
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-20b",

      messages:
        messages,

      temperature:
        0.7,

      max_completion_tokens:
        4096

    });


  const reply =
    completion
      ?.choices?.[0]
      ?.message
      ?.content;


  if (
    !reply ||
    !reply.trim()
  ) {

    return (
      "Sorry, mujhe koi response nahi mila."
    );

  }


  return reply.trim();

}


/* =========================================================
   MAIN CHAT API
========================================================= */

app.post(
  "/api/chat",
  async (req, res) => {

    try {

      console.log("");
      console.log(
        "=================================="
      );

      console.log(
        "MEWAT AI REQUEST"
      );


      /*
        Message dono formats se
        accept hoga.
      */

      const message =
        extractUserMessage(
          req.body
        );


      const language =
        req.body?.language ||
        "auto";


      let chatId =
        cleanText(
          req.body?.chatId
        );


      if (!message) {

        console.log(
          "ERROR: Empty message"
        );


        return res
          .status(400)
          .json({

            success:
              false,

            error:
              "Message empty hai."

          });

      }


      /* =====================================================
         LOAD CHATS
      ===================================================== */

      let chats =
        readChats();


      let chat =
        chats.find(
          item =>
            item.id ===
            chatId
        );


      /* =====================================================
         CREATE CHAT IF NEEDED
      ===================================================== */

      if (!chat) {

        const now =
          new Date()
            .toISOString();


        chat = {

          id:
            chatId ||
            (
              "chat-" +
              Date.now() +
              "-" +
              Math.random()
                .toString(36)
                .substring(2, 8)
            ),

          title:
            createChatTitle(
              message
            ),

          messages:
            [],

          createdAt:
            now,

          updatedAt:
            now

        };


        chats.push(
          chat
        );


        chatId =
          chat.id;

      }


      /* =====================================================
         HISTORY
      ===================================================== */

      let history =
        extractHistory(
          req.body,
          chat
        );


      /*
        Current question agar history me
        already aa gaya hai to duplicate
        nahi bhejna.
      */

      if (
        history.length
      ) {

        const last =
          history[
            history.length - 1
          ];


        if (
          last.role === "user" &&
          last.content === message
        ) {

          history =
            history.slice(
              0,
              -1
            );

        }

      }


      console.log(
        "Chat ID:",
        chatId
      );

      console.log(
        "Question:",
        message
      );

      console.log(
        "History:",
        history.length
      );

      console.log(
        "Founder: AASIF FAJRUDDIN"
      );


      /* =====================================================
         AI
      ===================================================== */

      const reply =
        await generateAIResponse({

          message:
            message,

          history:
            history,

          language:
            language

        });


      /* =====================================================
         SAVE USER MESSAGE
      ===================================================== */

      chat.messages.push(

        createMessage(
          "user",
          message
        )

      );


      /* =====================================================
         SAVE AI MESSAGE
      ===================================================== */

      chat.messages.push(

        createMessage(
          "assistant",
          reply
        )

      );


      /* =====================================================
         TITLE
      ===================================================== */

      if (
        !chat.title ||
        chat.title ===
          "New Chat"
      ) {

        chat.title =
          createChatTitle(
            message
          );

      }


      chat.updatedAt =
        new Date()
          .toISOString();


      /* =====================================================
         UPDATE CHAT
      ===================================================== */

      const index =
        chats.findIndex(
          item =>
            item.id ===
            chat.id
        );


      if (
        index >= 0
      ) {

        chats[index] =
          chat;

      }

      else {

        chats.push(
          chat
        );

      }


      /* =====================================================
         SAVE
      ===================================================== */

      writeChats(
        chats
      );


      console.log(
        "Response generated successfully."
      );


      console.log(
        "=================================="
      );


      /* =====================================================
         ALWAYS JSON RESPONSE
      ===================================================== */

      return res
        .status(200)
        .json({

          success:
            true,

          chatId:
            chat.id,

          reply:
            reply,

          text:
            reply,

          message:
            reply,

          title:
            chat.title,

          founder:
            "AASIF FAJRUDDIN",

          app:
            "MEWAT AI"

        });

    }

    catch (error) {

      console.error("");
      console.error(
        "=================================="
      );

      console.error(
        "MEWAT AI ERROR"
      );

      console.error(
        error
      );

      console.error(
        "=================================="
      );


      let errorMessage =
        "MEWAT AI server error.";


      const errorText =
        error?.message ||
        "";


      if (
        error?.status === 401 ||
        errorText
          .toLowerCase()
          .includes("api key") ||
        errorText
          .toLowerCase()
          .includes("unauthorized")
      ) {

        errorMessage =
          "Groq API key invalid hai ya .env me nahi mili.";

      }


      else if (
        error?.status === 429 ||
        errorText
          .toLowerCase()
          .includes("rate limit")
      ) {

        errorMessage =
          "Groq API rate limit complete ho gayi hai. Thodi der baad try karo.";

      }


      else if (
        error?.status === 404 ||
        errorText
          .toLowerCase()
          .includes("model")
      ) {

        errorMessage =
          "Groq model available nahi hai. GROQ_MODEL check karo.";

      }


      /*
        JSON response guaranteed.
        Isse frontend me
        Unexpected end of JSON input
        wali problem avoid hogi.
      */

      return res
        .status(500)
        .json({

          success:
            false,

          error:
            errorMessage,

          details:
            errorText,

          app:
            "MEWAT AI",

          founder:
            "AASIF FAJRUDDIN"

        });

    }

  }

);


/* =========================================================
   UNKNOWN API ROUTE
========================================================= */

app.use(
  "/api",
  (req, res) => {

    return res
      .status(404)
      .json({

        success:
          false,

        error:
          "API route not found.",

        path:
          req.path

      });

  }
);


/* =========================================================
   GENERAL 404
========================================================= */

app.use(
  (req, res) => {

    res
      .status(404)
      .send(
        "MEWAT AI: Page not found."
      );

  }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "EXPRESS ERROR:",
      error
    );


    if (
      res.headersSent
    ) {

      return next(
        error
      );

    }


    return res
      .status(500)
      .json({

        success:
          false,

        error:
          "Internal server error.",

        details:
          error?.message ||
          ""

      });

  }
);


/* =========================================================
   START SERVER
========================================================= */

ensureChatsFile();


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "             MEWAT AI"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "Status  : RUNNING"
    );

    console.log(
      "Port    :",
      PORT
    );

    console.log(
      "Founder : AASIF FAJRUDDIN"
    );

    console.log(
      "Local   : http://localhost:" +
      PORT
    );

    console.log(
      "Network : http://YOUR-PC-IP:" +
      PORT
    );

    console.log(
      "Chat    : ENABLED"
    );

    console.log(
      "Memory  : ENABLED"
    );

    console.log(
      "=========================================="
    );

    console.log("");

  }
);


/* =========================================================
   SAFE SHUTDOWN
========================================================= */

process.on(
  "SIGINT",
  () => {

    console.log(
      "\nMEWAT AI server stopping..."
    );

    process.exit(0);

  }
);


process.on(
  "SIGTERM",
  () => {

    console.log(
      "\nMEWAT AI server stopping..."
    );

    process.exit(0);

  }
);


/* =========================================================
   UNHANDLED ERRORS
========================================================= */

process.on(
  "unhandledRejection",
  error => {

    console.error(
      "Unhandled Promise Rejection:",
      error
    );

  }
);


process.on(
  "uncaughtException",
  error => {

    console.error(
      "Uncaught Exception:",
      error
    );

  }
);