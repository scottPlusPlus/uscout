const axios = require("axios");

// export async function getArchiveOrgIdentifier(url: string): Promise<string> {
//   console.log("Getting Identifier");
//   // Extract the domain name from the URL
//   const urlObj = new URL(url);
//   const domainName = urlObj.hostname;
//   console.log("Domain Name: ", domainName);

//   // Call the Wayback Machine API to get the latest capture of the website
//   const apiUrl = `https://archive.org/wayback/available?url=${domainName}&timestamp=`;

//   const response = await fetch(apiUrl + Date.now());

//   if (!response.ok) {
//     throw new Error(`Failed to fetch Wayback Machine API: ${response.status}`);
//   }

//   const data = await response.json();
//   console.log("Data: ", data);

//   // Check if there is an archive available for the website
//   if (!data.archived_snapshots || !data.archived_snapshots.closest) {
//     throw new Error(`No archive available for ${url}`);
//   }

//   // Return the archive.org identifier
//   const archiveMetaData = data.archived_snapshots.closest.url.split("/");
//   console.log("Array: ", archiveMetaData);
//   archiveMetaData.pop();
//   console.log("Array2: ", archiveMetaData);
//   return archiveMetaData.pop();
// }

export async function getLatestSnapshot(url: string) {
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
    return jsonData.archived_snapshots.closest.timestamp;
  } catch (error) {
    console.log("Error:", error);
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
