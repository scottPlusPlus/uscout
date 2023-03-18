export default function sendAnalyticEvent(event: string, data: string) {
  console.log("sendAnalyticEvent: " + data);
  return postEvent(event, data);
}

async function postEvent(event: string, data: string): Promise<Response> {
  return fetch("/api/ae", {
    method: "POST",
    body: JSON.stringify({ event: event, data: data }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
