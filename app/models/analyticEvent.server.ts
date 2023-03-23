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

