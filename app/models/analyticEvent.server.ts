import { AnalyticEvent, AnalyticEventByDay } from "@prisma/client";
import { prisma } from "~/db.server";

export async function addAnalyticEvent(
  ip: string,
  event: string,
  data: string,
  ts: number
): Promise<void> {
  await prisma.analyticEvent.create({
    data: {
      ip: ip,
      event: event,
      data: data,
      ts: ts
    }
  });
}

export async function getRecentEvents(): Promise<AnalyticEvent[]> {
  return prisma.analyticEvent.findMany({
    take: 200,
    orderBy: { ts: "desc" }
  });
}

export async function getTallyEvents(): Promise<AnalyticEventByDay[]> {
  return prisma.analyticEventByDay.findMany({
    take: 200,
    orderBy: { day: "desc" }
  });
}

export async function deleteOldEvents(): Promise<void> {
  const currentDate = new Date();
  const ninetyDaysAgo = new Date(currentDate);
  ninetyDaysAgo.setDate(currentDate.getDate() - 90);

  const ninetyDaysAgoUnixTimestamp = Math.floor(ninetyDaysAgo.getTime() / 1000);

  try {
    await prisma.analyticEvent.deleteMany({
      where: {
        ts: {
          lt: ninetyDaysAgoUnixTimestamp
        }
      }
    });
  } catch (error) {
    console.error("Error occurred while deleting 90 day old data: ", error);
    throw error;
  }
}

type AnalyticEventWithCount = AnalyticEvent & { count: number };
type ARes = {
  event: string;
  data: string;
  count: number;
};

type AResByDay = {
  event: string;
  data: string;
  count: number;
  ts: string;
};

export async function getAnalyticsDataLast7Days(): Promise<Array<ARes>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startDateUnixTimestamp = Math.floor(startDate.getTime() / 1000);

  const analyticsData = await prisma.analyticEvent.groupBy({
    where: {
      ts: {
        gte: startDateUnixTimestamp
      }
    },
    by: ["event", "data", "ip"]
  });

  const map = new Map<string, ARes>();
  analyticsData.forEach((x) => {
    const key = x.event + x.data;
    const prev = map.get(key) ?? { event: x.event, data: x.data, count: 0 };
    prev.count += 1;
    map.set(key, prev);
  });

  var res = [...map.values()];
  res = res.sort((a, b) => b.count - a.count);
  return res;
}

export async function tallyAnalytics(): Promise<Array<AResByDay>> {
  try {
    const latestTally = await prisma.analyticEventByDay.findFirst({
      orderBy: {
        day: "desc"
      }
    });

    let startDate;
    let endDate;

    if (latestTally) {
      endDate = new Date(latestTally.day);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      endDate = new Date(0);
    }
    const startDateUnixTimestamp = Math.floor(startDate.getTime() / 1000);
    const endDateUnixTimestamp = Math.floor(endDate.getTime() / 1000);

    console.log("Start Date:", startDateUnixTimestamp);
    console.log("End Date:", endDateUnixTimestamp);

    const analyticsData = await prisma.analyticEvent.findMany({
      where: {
        ts: {
          gt: endDateUnixTimestamp,
          lt: startDateUnixTimestamp
        }
      }
    });

    const map = new Map<string, AResByDay>();
    analyticsData.forEach((x) => {
      const date = new Date(x.ts * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      const key = x.event + x.data + formattedDate;
      const prev = map.get(key) ?? {
        event: x.event,
        data: x.data,
        count: 0,
        ts: formattedDate
      };
      prev.count += 1;
      map.set(key, prev);
    });

    var res = [...map.values()];
    res = res.sort((a, b) => b.count - a.count);

    for (const item of res) {
      await prisma.analyticEventByDay.upsert({
        where: {
          event_data_day: {
            event: item.event,
            data: item.data,
            day: item.ts
          }
        },
        update: {
          count: {
            increment: item.count
          }
        },
        create: {
          event: item.event,
          data: item.data,
          count: item.count,
          day: item.ts
        }
      });
    }

    return res;
  } catch (error) {
    console.error("An error occurred while tallying analytics:", error);
    throw error;
  }
}
