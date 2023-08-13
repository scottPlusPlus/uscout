import {
  getTallyEvents,
  tallyAnalytics,
  addAnalyticEvent,
  getRecentEvents
} from "./analyticEvent.server";

test("analytic event server: test mocked db part1 tally events", async () => {
  const intialVal = await getTallyEvents();
  expect(intialVal).toEqual([]);

  const dateUnixTimeStamps: number[] = [
    678293369, 678293369, 678293369, 678293369, 778293369, 778293369, 778293369
  ];

  for (const ts of dateUnixTimeStamps) {
    addAnalyticEvent("testIp", "testEvent", "testData", ts);
  }

  const recentEvents = await getRecentEvents();
  console.log("Recent Events: ", recentEvents);

  await tallyAnalytics();
  const tallyEvents = await getTallyEvents();
  expect(tallyEvents[0].count).toEqual(4);
  expect(tallyEvents[1].count).toEqual(3);

  console.log("Tally Events; ", tallyEvents);
});
