import { AnalyticEvent, AnalyticEventByDay } from "@prisma/client";
import { prisma } from "~/db.server";

export async function addAnalyticEvent(
  ip: string,
  event: string,
  data: string
): Promise<void> {
  await prisma.analyticEvent.create({
    data: {
      ip: ip,
      event: event,
      data: data
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
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    await prisma.analyticEvent.deleteMany({
      where: {
        ts: {
          lt: ninetyDaysAgo
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
  ts: Date;
};

export async function getAnalyticsDataLast7Days(): Promise<Array<ARes>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const analyticsData = await prisma.analyticEvent.groupBy({
    where: {
      ts: {
        gte: startDate.toISOString()
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

    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());

    const analyticsData = await prisma.analyticEvent.findMany({
      // orderBy: { ts: "desc" }

      where: {
        ts: {
          gt: endDate.toISOString(),
          lt: startDate.toISOString()
        }
      }
    });

    console.log("Length: ", analyticsData.length);

    const map = new Map<string, AResByDay>();
    analyticsData.forEach((x) => {
      const key = x.event + x.data + x.ts;
      const prev = map.get(key) ?? {
        event: x.event,
        data: x.data,
        count: 0,
        ts: x.ts
      };
      prev.count += 1;
      map.set(key, prev);
    });

    var res = [...map.values()];
    res = res.sort((a, b) => b.count - a.count);

    for (const item of res) {
      item.ts.setHours(0, 0, 0, 0);
      const existingRecord = await prisma.analyticEventByDay.findFirst({
        where: {
          event: item.event,
          data: item.data,
          day: item.ts
        }
      });

      if (existingRecord) {
        await prisma.analyticEventByDay.update({
          where: {
            id: existingRecord.id
          },
          data: {
            count: existingRecord.count + item.count
          }
        });
      } else {
        await prisma.analyticEventByDay.create({
          data: {
            event: item.event,
            data: item.data,
            count: item.count,
            day: item.ts
          }
        });
      }
    }

    return res;
  } catch (error) {
    console.error("An error occurred while tallying analytics:", error);
    throw error;
  }
}
