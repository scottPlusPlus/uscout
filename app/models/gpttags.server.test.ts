import axios from "axios";
import { requestGpttags } from "../code/scout/gpttags";

// Mocking axios.post method
jest.mock("axios");

describe("requestGpttags", () => {
  it("should mock axios and test requestGpttags function", async () => {
    // Arrange
    const mockPrompt = "What is the OpenAI mission?";
    const mockResponseData = {
      id: "chatcmpl-6p5FEv1JHictSSnDZsGU4KvbuBsbu",
      object: "messages",
      created: 1677693600,
      model: "gpt-3.5-turbo",
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content:
              "OpenAI's mission is to ensure that artificial general intelligence benefits all of humanity."
          }
        }
      ],
      usage: {
        prompt_tokens: 20,
        completion_tokens: 18,
        total_tokens: 38
      }
    };

    // Mocking axios.post to return the expected response
    (axios.post as jest.Mock).mockResolvedValue({ data: mockResponseData });

    // Act
    await requestGpttags(mockPrompt);

    // Expectations can be added if needed
  });
});
