const API_GEMINI_KEY = window.APP_CONFIG.API_GEMINI_KEY;
const model = "gemini-3.5-flash-lite";

var buttonSend = document.querySelector(".button");
var textareaSend = document.querySelector(".textarea");
var loadingDiv = document.querySelector(".loading");

buttonSend.addEventListener("click", sendMessage);

buttonSend.disabled = true;

textareaSend.addEventListener("input", function () {
  buttonSend.disabled = textareaSend.value.trim() === "";
});

textareaSend.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    buttonSend.click();
    textareaSend.value = "";

    //   show loading
    loadingDiv.classList.add("show");
  }
});

async function sendMessage() {
  // Lấy giá trị người nhập trong ô textarea
  var valueTextArea = textareaSend.value;

  //   Tạo thẻ div với value từ ô textarea class "own"
  var newDivOwn = document.createElement("div");
  newDivOwn.classList.add("own");
  newDivOwn.innerText = valueTextArea;

  //   đưa div thành con của main
  document.querySelector("#main").appendChild(newDivOwn);

  main.scrollTo({
    top: main.scrollHeight,
    behavior: "smooth",
  });

  //   gửi yêu cầu qua gemini
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_GEMINI_KEY}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: valueTextArea
              }
            ]
          }
        ]
      })
    }
  );

  // đợi yêu cầu phản hồi và hứng câu trả lời
  const dataConvertJson = await response.json();

  //  Lấy giá trị phản hồi từ gemini
  const valueResponse = dataConvertJson.candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text || "Không nhận được phản hồi.";
                
  //   hidden
  loadingDiv.classList.remove("show");

  //   HIển thị câu phản hồi ra ngoài màn hình
  //   Tạo thẻ div với value từ ô textarea class "guest"
  var newDivGuest = document.createElement("div");
  newDivGuest.classList.add("guest");
  newDivGuest.innerText = valueResponse;

  //   đưa div thành con của main
  document.querySelector("#main").appendChild(newDivGuest);

  main.scrollTo({
    top: main.scrollHeight,
    behavior: "smooth",
  });
}