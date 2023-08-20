import { requestChatgpt } from "../code/scout/chatgpt";

jest.mock("../code/scout/chatgpt", () => ({
  requestChatgpt: jest.fn()
}));

describe("requestChatgpt", () => {
  it("should mock axios and test requestChatgpt function", async () => {
    const mockPrompt = "What is the OpenAI mission?";
    const mockGeneratedText =
      "OpenAI's mission is to ensure that artificial general intelligence benefits all of humanity.";
    (requestChatgpt as jest.Mock).mockResolvedValue(mockGeneratedText);
    const result = await requestChatgpt(mockPrompt);
    expect(result).toEqual(mockGeneratedText);
  });
});
