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

  await prisma.analyticEvent.deleteMany({
    where: {
      ts: {
        lt: ninetyDaysAgo
      }
    }
  });
}

type AnalyticEventWithCount = AnalyticEvent & { count: number };
type ARes = {
  event: string;
  data: string;
  count: number;
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

export async function tallyAnalytics(): Promise<Array<ARes>> {
  const latestTally = await prisma.analyticEventByDay.findFirst({
    orderBy: {
      day: "desc"
    }
  });

  let startDate;

  if (latestTally) {
    startDate = new Date(latestTally.day);
    startDate.setDate(startDate.getDate() + 1);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 2);
  }

  const analyticsData = await prisma.analyticEvent.findMany({
    where: {
      ts: {
        lt: startDate.toISOString()
      }
    }
  });

  const map = new Map<string, ARes>();
  analyticsData.forEach((x) => {
    const key = x.event + x.data;
    const prev = map.get(key) ?? {
      event: x.event,
      data: x.data,
      count: 0
    };
    prev.count += 1;
    map.set(key, prev);
  });

  var res = [...map.values()];
  res = res.sort((a, b) => b.count - a.count);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of res) {
    const existingRecord = await prisma.analyticEventByDay.findFirst({
      where: {
        event: item.event,
        data: item.data,
        day: today
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
          day: today
        }
      });
    }
  }

  return res;
}
