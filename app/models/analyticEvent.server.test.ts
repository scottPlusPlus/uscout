import {
  getTallyEvents,
  tallyAnalytics,
  addAnalyticEvent,
  getRecentEvents
} from "./analyticEvent.server";

// test("analytic event server: test mocked db part1", async () => {
//   const intialVal = await getTallyEvents();
//   expect(intialVal).toEqual([]);

//   const dateString: string = "2023-08-06T23:39:27.996Z";
//   const dateObj: Date = new Date(dateString);

//   addAnalyticEvent("testIp", "testEvent", "testData", dateObj);
//   await tallyAnalytics();

//   const recentEvents = await getRecentEvents();
//   console.log("Recent Events: ", recentEvents);

//   // Get the current date
//   const currentDate = new Date();
//   // Subtract 90 days from the current date
//   const ninetyDaysAgo = new Date(currentDate);
//   ninetyDaysAgo.setDate(currentDate.getDate() - 90);

//   // Filter the array to get objects with timestamps not beyond 90 days ago
//   const validObjects = recentEvents.filter((item) => item.ts < ninetyDaysAgo);
//   // Now, use the expect function to make sure that all objects passed the filter
//   expect(validObjects.length).toEqual(0);
//   const latestVal = await getTallyEvents();
//   expect(latestVal).toEqual([]);

//   //   const actualVal = await getTallyEvents();
//   //   console.log("Actual Value: ", actualVal);
// });

test("analytic event server: test mocked db part2", async () => {
  const intialVal = await getTallyEvents();
  expect(intialVal).toEqual([]);
  //   const dateString: string = "2022-01-06T23:39:27.996Z";
  //   const dateObj: Date = new Date(dateString);

  const dateStrings: string[] = [
    "2023-01-06T23:39:27.996Z",
    "2022-12-15T12:30:45.123Z",
    "2022-11-20T15:39:27.567Z",
    "2022-11-20T15:39:27.567Z"
  ];

  for (const dateString of dateStrings) {
    const dateObj: Date = new Date(dateString);
    addAnalyticEvent("testIp", "testEvent", "testData", dateObj);
  }

  //   addAnalyticEvent("testIp", "testEvent", "testData", dateObj);

  const recentEvents = await getRecentEvents();
  console.log("Recent Events: ", recentEvents);

  await tallyAnalytics();
  const tallyEvents = await getTallyEvents();
  console.log("Tally Events; ", tallyEvents);
});

//   const recentEvents = await getRecentEvents();
//   console.log("Recent Events: ", recentEvents);

//   // Get the current date
//   const currentDate = new Date();
//   // Subtract 90 days from the current date
//   const ninetyDaysAgo = new Date(currentDate);
//   ninetyDaysAgo.setDate(currentDate.getDate() - 90);

//   // Filter the array to get objects with timestamps not beyond 90 days ago
//   const validObjects = recentEvents.filter((item) => item.ts < ninetyDaysAgo);
//   // Now, use the expect function to make sure that all objects passed the filter
//   expect(validObjects.length).toEqual(0);

//   const actualVal = await getTallyEvents();
//   console.log("Actual Value: ", actualVal);
