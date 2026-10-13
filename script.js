const API_GEMINI_KEY =
  window.APP_CONFIG?.API_GEMINI_KEY 
    ? window.APP_CONFIG.API_GEMINI_KEY
    : "key gemini";
const model = "qwen/qwen3.8-27b";

var main = document.querySelector("#main");
var buttonSend = document.querySelector(".button");
var buttonVoice = document.querySelector(".voice-button");
var buttonSpeak = document.querySelector(".speak-button");
var textareaSend = document.querySelector(".textarea");
var loadingDiv = document.querySelector(".loading");

var isSpeakingEnabled = true;
var isListening = false;
var SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = SpeechRecognition ? new SpeechRecognition() : null;

buttonSend.addEventListener("click", sendMessage);
buttonVoice.addEventListener("click", toggleVoiceInput);
buttonSpeak.addEventListener("click", toggleSpeechOutput);

buttonSend.disabled = true;

textareaSend.addEventListener("input", function () {
  updateSendButton();
});

textareaSend.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

setupVoiceInput();

async function sendMessage() {
  var valueTextArea = textareaSend.value.trim();

  if (!valueTextArea) {
    updateSendButton();
    return;
  }

  textareaSend.value = "";
  updateSendButton();
  addMessage("own", valueTextArea);
  scrollToBottom();
  showOrHideLoading(true);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_GEMINI_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Hãy trả lời bằng tiếng Việt, rõ ràng và dễ hiểu.",
            },
            {
              role: "user",
              content: valueTextArea,
            },
          ],
          max_tokens: 1024,
          stream: false,
        }),
      },
    );

    const dataConvertJson = await response.json();
    const valueResponse = response.ok
      ? dataConvertJson.choices?.[0]?.message?.content ||
        "Không nhận được phản hồi."
      : `Lỗi: ${dataConvertJson.error?.message || `HTTP ${response.status}`}`;

    addMessage("guest", valueResponse);
    speak(valueResponse);
  } catch (error) {
    addMessage("guest", "Không thể kết nối đến chatbot. Vui lòng thử lại.");
  } finally {
    showOrHideLoading(false);
    scrollToBottom();
  }
}

function setupVoiceInput() {
  if (!recognition) {
    buttonVoice.disabled = true;
    buttonVoice.title = "Trình duyệt này chưa hỗ trợ nhận giọng nói";
    return;
  }

  recognition.lang = "vi-VN";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.addEventListener("start", function () {
    isListening = true;
    buttonVoice.classList.add("listening");
    buttonVoice.title = "Đang nghe...";
  });

  recognition.addEventListener("result", function (event) {
    var transcript = "";

    for (var i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    textareaSend.value = transcript.trim();
    updateSendButton();

    if (event.results[event.results.length - 1].isFinal) {
      sendMessage();
    }
  });

  recognition.addEventListener("end", function () {
    isListening = false;
    buttonVoice.classList.remove("listening");
    buttonVoice.title = "Nói với chatbot";
  });

  recognition.addEventListener("error", function (event) {
    isListening = false;
    buttonVoice.classList.remove("listening");
    buttonVoice.title = "Nói với chatbot";

    if (event.error === "not-allowed") {
      addMessage(
        "guest",
        "Trình duyệt đang chặn microphone. Hãy cấp quyền mic rồi thử lại.",
      );
      scrollToBottom();
    }
  });
}

function toggleVoiceInput() {
  if (!recognition) {
    return;
  }

  cancelSpeech();

  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

function toggleSpeechOutput() {
  isSpeakingEnabled = !isSpeakingEnabled;
  buttonSpeak.classList.toggle("active", isSpeakingEnabled);
  buttonSpeak.innerHTML = isSpeakingEnabled
    ? '<i class="fas fa-volume-high"></i>'
    : '<i class="fas fa-volume-xmark"></i>';

  if (!isSpeakingEnabled) {
    cancelSpeech();
  }
}

function speak(text) {
  if (!isSpeakingEnabled || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function cancelSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function showOrHideLoading(isShow) {
  loadingDiv.classList.toggle("show", isShow);
  updateSendButton();
}

function updateSendButton() {
  buttonSend.disabled =
    textareaSend.value.trim() === "" || loadingDiv.classList.contains("show");
}

function addMessage(type, valueResponse) {
  var newDivGuest = document.createElement("div");
  newDivGuest.classList.add(type);
  newDivGuest.innerText = valueResponse;
  main.appendChild(newDivGuest);
}

function scrollToBottom() {
  main.scrollTo({
    top: main.scrollHeight,
    behavior: "smooth",
  });
}
