import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY_GEMINI,
});

app.post("/chat", async (req, res) => {
  console.log("Phản hồi rồi nè với textarea value: " + req.body.valueTextArea);
  res.json({
      reply: "HIHI",
    });
    
//   try {
//     const response = await ai.interactions.create({
//       model: "gemini-3.8-flash",
//       input: req.body.valueTextArea,
//     });

//     res.json({
//       reply: response.output_text,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       reply: "Có lỗi khi kết nối Gemini.",
//     });
//   }
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
