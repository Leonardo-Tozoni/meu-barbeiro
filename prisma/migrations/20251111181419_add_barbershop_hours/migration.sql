-- CreateTable
CREATE TABLE "BarbershopHours" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BarbershopHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarbershopHours_barbershopId_dayOfWeek_key" ON "BarbershopHours"("barbershopId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "BarbershopHours_barbershopId_idx" ON "BarbershopHours"("barbershopId");

-- AddForeignKey
ALTER TABLE "BarbershopHours" ADD CONSTRAINT "BarbershopHours_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

