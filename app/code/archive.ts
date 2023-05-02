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

export async function getLatestSnapshot(identifier: string) {
  const url = `https://archive.org/metadata/${identifier}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
      }
    });
    const json_data = response.data;
    console.log("Last Updated: ", json_data.item_last_updated);
  } catch (error) {
    console.log("Error:", error);
  }
}
