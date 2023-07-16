const axios = require("axios");

export async function getLatestSnapshot(url: string): Promise<string | null> {
  console.log("Identifier: ", url);
  const requestUrl = `https://archive.org/wayback/available?url=${url}`;

  try {
    const response = await axios.get(requestUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
      }
    });
    const jsonData = response.data;
    console.log("JSON Data: ", jsonData);
    if (jsonData?.archived_snapshots?.closest?.timestamp) {
      return jsonData.archived_snapshots.closest.timestamp;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

export function getUnixTimeStamp(gmtTime: any): any {
  const year = gmtTime.slice(0, 4);
  const month = parseInt(gmtTime.slice(4, 6)) - 1; // Month is zero-based in JavaScript
  const day = gmtTime.slice(6, 8);
  const hour = gmtTime.slice(8, 10);
  const minute = gmtTime.slice(10, 12);
  const second = gmtTime.slice(12, 14);
  const unixTimestamp = Date.UTC(year, month, day, hour, minute, second) / 1000;
  return unixTimestamp;
}
