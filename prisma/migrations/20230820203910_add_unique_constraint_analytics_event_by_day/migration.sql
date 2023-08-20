/*
  Warnings:

  - A unique constraint covering the columns `[event,data,day]` on the table `AnalyticEventByDay` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AnalyticEventByDay_event_data_day_key" ON "AnalyticEventByDay"("event", "data", "day");
