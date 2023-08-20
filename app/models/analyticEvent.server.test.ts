import {
  getTallyEvents,
  tallyAnalytics,
  addAnalyticEvent,
  getRecentEvents,
  deleteOldEvents
} from "./analyticEvent.server";

test("analytic event server: test mocked db part1 tally events", async () => {
  const intialVal = await getTallyEvents();
  expect(intialVal).toEqual([]);

  const dayXTimestamps = [678293369, 678293369, 678293369, 678293369];
  const dayYTimestamps = [778293369, 778293369, 778293369];
  const otherTimestamps = [
    478293369, 478293369, 878293369, 878293369, 878293369, 978293369, 178293369,
    178293369
  ];

  for (const ts of dayXTimestamps) {
    addAnalyticEvent("testIp", "testEvent", "testData", ts);
  }
  for (const ts of dayYTimestamps) {
    addAnalyticEvent("testIp2", "testEvent2", "testData2", ts);
  }
  for (const ts of otherTimestamps) {
    addAnalyticEvent("testIp", "testEvent3", "testData3", ts);
  }

  // const recentEvents = await getRecentEvents();

  await tallyAnalytics();
  const tallyEvents = await getTallyEvents();
  console.log(tallyEvents);
  console.log(tallyEvents);
  expect(tallyEvents[0].count).toEqual(4);
  expect(tallyEvents[1].count).toEqual(3);
  expect(tallyEvents.length).toEqual(6);
});

test("analytic event server: test mocked db part1 delete events", async () => {
  const intialVal = await getTallyEvents();
  expect(intialVal).toEqual([]);

  const dateUnixTimeStamps: number[] = [
    678293369, 678293369, 678293369, 678293369, 778293369, 778293369, 778293369
  ];

  for (const ts of dateUnixTimeStamps) {
    addAnalyticEvent("testIp", "testEvent", "testData", ts);
  }

  await deleteOldEvents();

  const oldEvents = await getRecentEvents();
  expect(oldEvents).toEqual([]);

  const currentUnixTimestamp = Math.floor(Date.now() / 1000);
  addAnalyticEvent("testIp", "testEvent", "testData", currentUnixTimestamp);
  await deleteOldEvents();
  const recentEvents = await getRecentEvents();
  expect(recentEvents.length).toEqual(1);
});
