import { Feedback } from "@prisma/client";
import { prisma } from "~/db.server";

// id       Int      @id @default(autoincrement())
// ts       DateTime @default(now())
// ip       String
// context  String
// feedback String
// email    String
// status   String

export async function addFeedback(
  ip: string,
  context: string,
  feedback: string,
  email: string = ""
): Promise<void> {
  await prisma.feedback.create({
    data: {
      ip: ip,
      context: context,
      feedback: feedback,
      email: email,
      status: "new",
    },
  });
}

interface FeedbackWhere {
  context?: string;
  status?: string;
}

export async function getRecentFeedback(
  contextFilter: string | null,
  statusFilter: string | null
): Promise<Array<Feedback>> {
  if (contextFilter == null && statusFilter == null) {
    return await prisma.feedback.findMany({
      take: 200,
      orderBy: { ts: "desc" },
    });
  }

  var whereFilter: FeedbackWhere = {};
  if (contextFilter != null) {
    whereFilter.context = contextFilter;
  }
  if (statusFilter != null) {
    whereFilter.status = statusFilter;
  }
  return await prisma.feedback.findMany({
    take: 200,
    orderBy: { ts: "desc" },
    where: whereFilter,
  });
}
