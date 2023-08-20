import axios from "axios";

const CHATGPT_API_URL = process.env.CHATGPT_API_URL;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;

export async function requestChatgpt(prompt: string) {
  // console.log(CHATGPT_API_URL);

  // if (!CHATGPT_API_URL) {
  //   console.log(CHATGPT_API_URL);
  //   console.warn("Warning: url does not exist.");
  //   return null;
  // }

  // if (!CHATGPT_API_KEY) {
  //   console.warn("Warning: Bearer token does not exist.");
  //   return null;
  // }
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: prompt,
        max_tokens: 50 // Adjust this value as needed
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CHATGPT_API_KEY}`
        }
      }
    );
    console.log("Response: ", response);

    const generatedText = response.data.choices[0].message.content;
    console.log("Generated Text:", generatedText);
    return generatedText;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
      }
    } else {
      console.error("Error:", error);
    }
  }
}
