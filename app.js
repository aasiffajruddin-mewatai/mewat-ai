/* =========================================================
   MEWAT AI BACKEND CONNECTION
   Founder: AASIF FAJRUDDIN
========================================================= */

const API_BASE_URL = window.location.origin;

function apiFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, options);
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const chatBox = document.getElementById("chatBox");
const chatContent = document.getElementById("chatContent");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const sidebar = document.getElementById("sidebar");
const hamburgerBtn = document.getElementById("hamburgerBtn");

const newChatButton = document.getElementById("newChatButton");
const sidebarNewChatBtn = document.getElementById("sidebarNewChatBtn");

const chatList = document.getElementById("chatList");
const historyCount = document.getElementById("historyCount");

const themeButton = document.getElementById("themeButton");
const headerThemeButton = document.getElementById("headerThemeButton");
const darkModeButton = document.getElementById("darkModeButton");

const themeModal = document.getElementById("themeModal");
const closeThemeModal = document.getElementById("closeThemeModal");

const languageSelect = document.getElementById("languageSelect");
const micButton = document.getElementById("micButton");

const plusButton = document.getElementById("plusButton");
const plusMenu = document.getElementById("plusMenu");

const fileInput = document.getElementById("fileInput");
const imageInput = document.getElementById("imageInput");

const uploadFileOption = document.getElementById("uploadFileOption");
const uploadImageOption = document.getElementById("uploadImageOption");
const webSearchOption = document.getElementById("webSearchOption");
const analyzeOption = document.getElementById("analyzeOption");

const toast = document.getElementById("toast");
const headerTitle = document.getElementById("headerTitle");

let currentChatId = null;
let isSending = false;
let recognition = null;


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {
  document.body.classList.remove("theme-two");
  document.body.classList.remove("light");

  if (theme === "theme-two") {
    document.body.classList.add("theme-two");
  }

  if (theme === "light") {
    document.body.classList.add("light");
  }

  if (theme === "dark") {
    document.body.classList.remove("light");
  }

  localStorage.setItem("mewat-ai-theme", theme);
}

function loadTheme() {
  const savedTheme =
    localStorage.getItem("mewat-ai-theme") || "theme-one";

  applyTheme(savedTheme);
}

themeButton?.addEventListener("click", () => {
  themeModal.classList.add("show");
});

headerThemeButton?.addEventListener("click", () => {
  themeModal.classList.add("show");
});

darkModeButton?.addEventListener("click", () => {
  const isLight =
    document.body.classList.contains("light") ||
    document.body.classList.contains("theme-two");

  if (isLight) {
    applyTheme("theme-one");
    showToast("Dark mode enabled");
  } else {
    applyTheme("light");
    showToast("Light mode enabled");
  }
});

document.querySelectorAll(".theme-option").forEach(button => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;

    applyTheme(theme);

    themeModal.classList.remove("show");

    showToast("Theme changed");
  });
});

closeThemeModal?.addEventListener("click", () => {
  themeModal.classList.remove("show");
});

themeModal?.addEventListener("click", event => {
  if (event.target === themeModal) {
    themeModal.classList.remove("show");
  }
});


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

hamburgerBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});


/* =========================================================
   PLUS MENU
========================================================= */

plusButton?.addEventListener("click", event => {
  event.stopPropagation();
  plusMenu.classList.toggle("show");
});

document.addEventListener("click", event => {
  if (
    plusMenu &&
    !plusMenu.contains(event.target) &&
    event.target !== plusButton
  ) {
    plusMenu.classList.remove("show");
  }
});


/* =========================================================
   FILE UPLOAD
========================================================= */

uploadFileOption?.addEventListener("click", () => {
  plusMenu.classList.remove("show");
  fileInput.click();
});

uploadImageOption?.addEventListener("click", () => {
  plusMenu.classList.remove("show");
  imageInput.click();
});

fileInput?.addEventListener("change", () => {
  if (!fileInput.files.length) return;

  const names = Array.from(fileInput.files)
    .map(file => file.name)
    .join(", ");

  messageInput.value =
    `I uploaded these files: ${names}\n\nPlease help me with them.`;

  showToast("File selected");
});

imageInput?.addEventListener("change", () => {
  if (!imageInput.files.length) return;

  const file = imageInput.files[0];

  messageInput.value =
    `I uploaded an image named "${file.name}". Please help me analyze it.`;

  showToast("Image selected");
});


/* =========================================================
   OTHER PLUS OPTIONS
========================================================= */

webSearchOption?.addEventListener("click", () => {
  plusMenu.classList.remove("show");

  messageInput.value =
    "Please search the web and give me the latest information about ";

  messageInput.focus();

  showToast("Web Search option selected");
});

analyzeOption?.addEventListener("click", () => {
  plusMenu.classList.remove("show");

  messageInput.value =
    "Please analyze this information carefully: ";

  messageInput.focus();

  showToast("Analyze option selected");
});


/* =========================================================
   TEXTAREA AUTO RESIZE
========================================================= */

function resizeInput() {
  messageInput.style.height = "auto";

  const height =
    Math.min(messageInput.scrollHeight, 150);

  messageInput.style.height = height + "px";
}

messageInput.addEventListener("input", resizeInput);


/* =========================================================
   MARKDOWN
========================================================= */

function renderMarkdown(text) {
  if (typeof marked !== "undefined") {
    return marked.parse(text);
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}


/* =========================================================
   WELCOME SCREEN
========================================================= */

function hideWelcome() {
  const welcome = document.getElementById("welcomeScreen");

  if (welcome) {
    welcome.remove();
  }
}


/* =========================================================
   USER MESSAGE
========================================================= */

function addUserMessage(text) {
  hideWelcome();

  const message = document.createElement("div");

  message.className = "message user";

  const content = document.createElement("div");

  content.className = "message-content";

  content.textContent = text;

  message.appendChild(content);

  chatContent.appendChild(message);

  scrollToBottom();

  return message;
}


/* =========================================================
   AI MESSAGE
========================================================= */

function addAIMessage(text = "") {
  hideWelcome();

  const message = document.createElement("div");

  message.className = "message ai";

  const avatar = document.createElement("div");

  avatar.className = "ai-avatar";

  avatar.textContent = "MI";

  const content = document.createElement("div");

  content.className = "message-content";

  content.innerHTML = renderMarkdown(text);

  message.appendChild(avatar);
  message.appendChild(content);

  chatContent.appendChild(message);

  scrollToBottom();

  return {
    message,
    content
  };
}


/* =========================================================
   LOADING / THINKING
========================================================= */

function addThinkingMessage() {
  hideWelcome();

  const message = document.createElement("div");

  message.className = "message ai";

  const avatar = document.createElement("div");

  avatar.className = "ai-avatar";

  avatar.textContent = "MI";

  const content = document.createElement("div");

  content.className = "message-content";

  const typing = document.createElement("div");

  typing.className = "typing";

  typing.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  content.appendChild(typing);

  message.appendChild(avatar);
  message.appendChild(content);

  chatContent.appendChild(message);

  scrollToBottom();

  return message;
}


/* =========================================================
   STREAMING AI RESPONSE
========================================================= */

async function streamAIResponse(
  messageId,
  aiContent,
  messages
) {

  try {

    const response =
      await apiFetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            chatId:
              currentChatId,

            messages:
              messages,

            language:
              languageSelect?.value ||
              "auto"
          })
        }
      );


    if (!response.ok) {

      let errorMessage =
        "AI response failed.";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData.error ||
          errorData.message ||
          errorMessage;

      } catch (_) {}

      throw new Error(
        errorMessage
      );

    }


    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    /*
      Agar backend normal JSON response deta hai
    */

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      const data =
        await response.json();

      const reply =
        data.reply ||
        data.message ||
        data.content ||
        "";

      aiContent.innerHTML =
        renderMarkdown(reply);

      return reply;

    }


    /*
      Streaming response
    */

    if (!response.body) {

      throw new Error(
        "Server ne response nahi diya."
      );

    }


    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let fullText = "";


    while (true) {

      const {
        done,
        value
      } =
        await reader.read();

      if (done) break;


      const chunk =
        decoder.decode(
          value,
          {
            stream: true
          }
        );

      fullText += chunk;

      aiContent.innerHTML =
        renderMarkdown(
          fullText
        );

      scrollToBottom();

    }


    return fullText;

  } catch (error) {

    console.error(
      "AI response error:",
      error
    );

    aiContent.innerHTML =
      renderMarkdown(
        `⚠️ ${error.message}`
      );

    throw error;

  }
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

  if (isSending) return;

  const text =
    messageInput.value.trim();

  if (!text) return;


  isSending = true;

  sendButton.disabled = true;


  addUserMessage(text);


  messageInput.value = "";

  resizeInput();


  const thinking =
    addThinkingMessage();


  try {

    const messages = [
      {
        role: "user",
        content: text
      }
    ];


    thinking.remove();


    const ai =
      addAIMessage("");


    await streamAIResponse(
      Date.now().toString(),
      ai.content,
      messages
    );


    await loadChatHistory();


  } catch (error) {

    console.error(error);

    if (thinking) {
      thinking.remove();
    }

    addAIMessage(
      `⚠️ ${error.message}`
    );

  } finally {

    isSending = false;

    sendButton.disabled = false;

    messageInput.focus();

  }

}


/* =========================================================
   SEND BUTTON
========================================================= */

sendButton?.addEventListener(
  "click",
  sendMessage
);


/* =========================================================
   ENTER KEY
========================================================= */

messageInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

  if (!chatBox) return;

  chatBox.scrollTop =
    chatBox.scrollHeight;

}


/* =========================================================
   CLEAR CHAT SCREEN
========================================================= */

function clearChatScreen() {

  chatContent.innerHTML = `
    <div class="welcome" id="welcomeScreen">

      <div class="welcome-logo">

        <svg viewBox="0 0 100 100">

          <defs>

            <linearGradient
              id="clearMewatGradient"
              x1="10%"
              y1="10%"
              x2="90%"
              y2="90%">

              <stop
                offset="0%"
                stop-color="#25d9ff"/>

              <stop
                offset="52%"
                stop-color="#5d7cff"/>

              <stop
                offset="100%"
                stop-color="#9a5cff"/>

            </linearGradient>

          </defs>

          <circle
            cx="50"
            cy="50"
            r="44"
            fill="#070b16"
            stroke="url(#clearMewatGradient)"
            stroke-width="5"/>

          <path
            d="M27 68 L27 32 L48 32 L48 68
               M52 32 L73 32 L73 68"
            fill="none"
            stroke="url(#clearMewatGradient)"
            stroke-width="9"
            stroke-linecap="round"
            stroke-linejoin="round"/>

          <circle
            cx="50"
            cy="50"
            r="5"
            fill="#ffffff"/>

        </svg>

      </div>

      <h1>MEWAT AI</h1>

      <p>
        Your intelligent AI assistant for questions,
        learning, coding, ideas and everyday help.
      </p>

      <div class="creator-line">
        Created by
        <strong>AASIF FAJRUDDIN</strong>
      </div>

      <div class="suggestions">

        <button class="suggestion">
          💡 Explain something to me
        </button>

        <button class="suggestion">
          💻 Help me write code
        </button>

        <button class="suggestion">
          📝 Write something for me
        </button>

        <button class="suggestion">
          🎓 Help me study
        </button>

      </div>

    </div>
  `;

  addSuggestionEvents();

}
/* =========================================================
   CLEAR CHAT SCREEN
========================================================= */

function clearChatScreen() {

  chatContent.innerHTML = "";

  const welcome =
    document.createElement("div");

  welcome.className =
    "welcome";

  welcome.id =
    "welcomeScreen";

  welcome.innerHTML = `

    <div class="welcome-logo">

      <svg viewBox="0 0 100 100">

        <defs>

          <linearGradient
            id="clearMewatGradient"
            x1="10%"
            y1="10%"
            x2="90%"
            y2="90%">

            <stop
              offset="0%"
              stop-color="#25d9ff"/>

            <stop
              offset="52%"
              stop-color="#5d7cff"/>

            <stop
              offset="100%"
              stop-color="#9a5cff"/>

          </linearGradient>

        </defs>

        <circle
          cx="50"
          cy="50"
          r="44"
          fill="#070b16"
          stroke="url(#clearMewatGradient)"
          stroke-width="5"/>

        <!-- MI LOGO -->

        <path
          d="M27 68 L27 32 L48 32 L48 68
             M52 32 L73 32 L73 68"
          fill="none"
          stroke="url(#clearMewatGradient)"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"/>

        <circle
          cx="50"
          cy="50"
          r="5"
          fill="#ffffff"/>

      </svg>

    </div>

    <h1>How can I help you?</h1>

    <p>
      Welcome to MEWAT AI. Ask questions,
      write code, learn something new,
      or continue your previous conversation.
    </p>

    <div class="creator-line">
      Created by
      <strong>AASIF FAJRUDDIN</strong>
    </div>

    <div class="suggestions">

      <button class="suggestion">
        💡 Explain something to me
      </button>

      <button class="suggestion">
        💻 Help me write code
      </button>

      <button class="suggestion">
        📝 Write something for me
      </button>

      <button class="suggestion">
        🎓 Help me study
      </button>

    </div>

  `;

  chatContent.appendChild(
    welcome
  );

  addSuggestionEvents();

}


/* =========================================================
   LOAD CHAT / OPEN CHAT
========================================================= */

async function openChat(chatId) {

  if (isSending) return;

  try {

    const response =
      await apiFetch(
        `/api/chats/${encodeURIComponent(chatId)}`
      );

    if (!response.ok) {

      throw new Error(
        "Chat not found"
      );

    }

    const chat =
      await response.json();

    currentChatId =
      chat.id;

    clearChatScreen();

    const welcome =
      document.getElementById(
        "welcomeScreen"
      );

    if (welcome) {

      welcome.remove();

    }

    if (
      Array.isArray(chat.messages) &&
      chat.messages.length
    ) {

      for (
        const message
        of chat.messages
      ) {

        if (
          message.role === "user"
        ) {

          addUserMessage(
            message.content || ""
          );

        }

        else if (
          message.role === "assistant"
        ) {

          addAIMessage(
            message.content || ""
          );

        }

      }

    }

    else {

      clearChatScreen();

    }

    headerTitle.textContent =
      chat.title ||
      "MEWAT AI";

    setActiveChat(
      currentChatId
    );

    if (
      window.innerWidth <= 800
    ) {

      sidebar.classList.remove(
        "open"
      );

    }

    scrollToBottom();

  }

  catch (error) {

    console.error(error);

    showToast(
      "Chat open nahi ho paayi."
    );

  }

}


/* =========================================================
   CHAT HISTORY
========================================================= */

async function loadChatHistory() {

  try {

    const response =
      await apiFetch(
        "/api/chats"
      );

    if (!response.ok) {

      throw new Error(
        "History load failed"
      );

    }

    const chats =
      await response.json();

    chatList.innerHTML = "";

    historyCount.textContent =
      chats.length;


    if (!chats.length) {

      const empty =
        document.createElement(
          "div"
        );

      empty.style.padding =
        "20px 10px";

      empty.style.color =
        "var(--muted)";

      empty.style.fontSize =
        "13px";

      empty.textContent =
        "No chat history yet.";

      chatList.appendChild(
        empty
      );

      return;

    }


    chats.forEach(
      chat => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "history-item";


        if (
          chat.id ===
          currentChatId
        ) {

          item.classList.add(
            "active"
          );

        }


        const icon =
          document.createElement(
            "span"
          );

        icon.className =
          "history-icon";

        icon.textContent =
          "💬";


        const text =
          document.createElement(
            "span"
          );

        text.className =
          "history-text";

        text.textContent =
          chat.title ||
          "New Chat";


        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "history-delete";

        deleteButton.textContent =
          "🗑";

        deleteButton.title =
          "Delete chat";


        deleteButton.addEventListener(
          "click",
          async event => {

            event.stopPropagation();

            await deleteChat(
              chat.id
            );

          }
        );


        item.appendChild(
          icon
        );

        item.appendChild(
          text
        );

        item.appendChild(
          deleteButton
        );


        item.addEventListener(
          "click",
          () => {

            openChat(
              chat.id
            );

          }
        );


        chatList.appendChild(
          item
        );

      }
    );

  }

  catch (error) {

    console.error(
      "History error:",
      error
    );

  }

}


/* =========================================================
   ACTIVE HISTORY ITEM
========================================================= */

function setActiveChat(
  chatId
) {

  document
    .querySelectorAll(
      ".history-item"
    )
    .forEach(
      item => {

        item.classList.remove(
          "active"
        );

      }
    );


  /*
    History reload hone ke baad
    active class already lag sakti hai.
  */

  loadChatHistory();

}


/* =========================================================
   DELETE CHAT
========================================================= */

async function deleteChat(
  chatId
) {

  const confirmDelete =
    confirm(
      "Kya aap is chat ko delete karna chahte ho?"
    );

  if (!confirmDelete) {
    return;
  }


  try {

    const response =
      await apiFetch(
        `/api/chats/${encodeURIComponent(chatId)}`,
        {
          method: "DELETE"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Delete failed"
      );

    }


    if (
      currentChatId ===
      chatId
    ) {

      currentChatId =
        null;

      headerTitle.textContent =
        "MEWAT AI";

      clearChatScreen();

    }


    await loadChatHistory();

    showToast(
      "Chat deleted"
    );

  }

  catch (error) {

    console.error(error);

    showToast(
      "Chat delete nahi hui."
    );

  }

}


/* =========================================================
   NEW CHAT
========================================================= */

async function createNewChat() {

  if (isSending) return;

  try {

    const response =
      await apiFetch(
        "/api/chats",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        "New chat failed"
      );

    }


    const chat =
      await response.json();

    currentChatId =
      chat.id;

    headerTitle.textContent =
      "MEWAT AI";

    clearChatScreen();

    await loadChatHistory();

    setActiveChat(
      currentChatId
    );

    messageInput.focus();

  }

  catch (error) {

    console.error(error);

    showToast(
      "New chat create nahi ho paayi."
    );

  }

}


sidebarNewChatBtn?.addEventListener(
  "click",
  createNewChat
);


newChatButton?.addEventListener(
  "click",
  createNewChat
);


/* =========================================================
   SUGGESTION BUTTONS
========================================================= */

function addSuggestionEvents() {

  document
    .querySelectorAll(
      ".suggestion"
    )
    .forEach(
      button => {

        button.onclick = () => {

          messageInput.value =
            button.textContent
              .replace(/^.\s*/, "")
              .trim();

          resizeInput();

          messageInput.focus();

        };

      }
    );

}


addSuggestionEvents();


/* =========================================================
   VOICE INPUT
========================================================= */

function setupVoiceRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    micButton.addEventListener(
      "click",
      () => {

        showToast(
          "Is browser me voice input supported nahi hai."
        );

      }
    );

    return;

  }


  recognition =
    new SpeechRecognition();

  recognition.continuous =
    false;

  recognition.interimResults =
    true;


  recognition.onstart =
    () => {

      micButton.textContent =
        "🔴";

      showToast(
        "Listening..."
      );

    };


  recognition.onresult =
    event => {

      let finalText = "";

      for (
        let i =
          event.resultIndex;

        i <
        event.results.length;

        i++
      ) {

        finalText +=
          event.results[i][0]
            .transcript;

      }


      messageInput.value =
        finalText;

      resizeInput();

    };


  recognition.onerror =
    event => {

      console.error(
        "Speech error:",
        event.error
      );

      showToast(
        "Voice input me problem aa gayi."
      );

    };


  recognition.onend =
    () => {

      micButton.textContent =
        "🎤";

    };


  micButton.addEventListener(
    "click",
    () => {

      if (isSending) return;


      let language =
        languageSelect.value;


      if (
        !language ||
        language === "auto"
      ) {

        language =
          "en-IN";

      }


      recognition.lang =
        language;


      try {

        recognition.start();

      }

      catch (error) {

        console.log(
          "Recognition already running."
        );

      }

    }
  );

}


setupVoiceRecognition();


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      messageInput.focus();

    }

  }
);
/* =========================================================
   INITIALIZE MEWAT AI
========================================================= */

async function init() {

  /* Theme load */
  loadTheme();


  /* Chat history load */
  await loadChatHistory();


  /*
    Agar purani chats available hain
    to latest chat open hogi.
  */

  try {

    const response =
      await apiFetch("/api/chats");


    if (!response.ok) {

      throw new Error(
        "Chat history load nahi hui."
      );

    }


    const chats =
      await response.json();


    if (
      Array.isArray(chats) &&
      chats.length > 0
    ) {

      await openChat(
        chats[0].id
      );

    }

    else {

      /*
        Agar koi chat nahi hai,
        to nayi chat create hogi.
      */

      await createNewChat();

    }

  }

  catch (error) {

    console.error(
      "MEWAT AI initialization error:",
      error
    );

    clearChatScreen();

  }

}


/* =========================================================
   MEWAT AI BRANDING
========================================================= */

/*
   App Name:
   MEWAT AI

   Founder:
   AASIF FAJRUDDIN

   Logo:
   MI
*/

document.title =
  "MEWAT AI";


if (headerTitle) {

  /*
    Sirf default title set karna hai.
    Open chat hone par actual chat title
    automatically update ho jayega.
  */

  if (
    !headerTitle.textContent ||
    headerTitle.textContent.includes("ORVEXA")
  ) {

    headerTitle.textContent =
      "MEWAT AI";

  }

}


/* =========================================================
   LANGUAGE
========================================================= */

if (languageSelect) {

  const savedLanguage =
    localStorage.getItem(
      "mewat-ai-language"
    );

  if (savedLanguage) {

    languageSelect.value =
      savedLanguage;

  }


  languageSelect.addEventListener(
    "change",
    () => {

      localStorage.setItem(
        "mewat-ai-language",
        languageSelect.value
      );

    }
  );

}


/* =========================================================
   CLOSE SIDEBAR AFTER CHAT
========================================================= */

chatContent?.addEventListener(
  "click",
  () => {

    if (
      window.innerWidth <= 800
    ) {

      sidebar.classList.remove(
        "open"
      );

    }

  }
);


/* =========================================================
   START MEWAT AI
========================================================= */

init();


/* =========================================================
   END OF APP.JS
   MEWAT AI
   Founder: AASIF FAJRUDDIN
========================================================= */