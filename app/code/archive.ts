const axios = require("axios");

export async function getLatestSnapshotTime(
  url: string
): Promise<number | null | undefined> {
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
      let lastModifiedTime = getUnixTimeStamp(
        jsonData.archived_snapshots.closest.timestamp
      );
      return lastModifiedTime;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

export function getUnixTimeStamp(gmtTime: string): number {
  // Expects a string showing date in GMT format.
  // Expected Input String: 20230706212016
  const year = parseInt(gmtTime.slice(0, 4));
  const month = parseInt(gmtTime.slice(4, 6)) - 1; // Month is zero-based in JavaScript
  const day = parseInt(gmtTime.slice(6, 8));
  const hour = parseInt(gmtTime.slice(8, 10));
  const minute = parseInt(gmtTime.slice(10, 12));
  const second = parseInt(gmtTime.slice(12, 14));
  const unixTimestamp = Date.UTC(year, month, day, hour, minute, second) / 1000;
  return unixTimestamp;
}
