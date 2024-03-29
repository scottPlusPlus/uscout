import { AnalyticEvent } from "@prisma/client";
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
        data: data,
      },
    });
  }

export async function getRecentEvents(): Promise<AnalyticEvent[]> {
  return prisma.analyticEvent.findMany({
    take: 200,
    orderBy: { ts: "desc" },
  });
}

type AnalyticEventWithCount = AnalyticEvent & { count: number };
type ARes = {
  event:string,
  data:string,
  count:number
}

export async function getAnalyticsDataLast7Days(): Promise<Array<ARes>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const analyticsData = await prisma.analyticEvent.groupBy({
    where: {
      ts: {
        gte: startDate.toISOString(),
      },
    },
    by: ['event', 'data', 'ip'],
  });

  const map = new Map<string,ARes>();
  analyticsData.forEach(x => {
    const key = x.event+x.data;
    const prev = map.get(key) ?? {event:x.event, data:x.data, count:0};
    prev.count +=1;
    map.set(key, prev);
  });

  var res = [...map.values()];
  res = res.sort((a, b) => b.count - a.count);
  return res;
}