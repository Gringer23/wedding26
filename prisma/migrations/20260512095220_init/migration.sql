-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('WILL_COME', 'WILL_NOT_COME');

-- CreateEnum
CREATE TYPE "SeatingTableType" AS ENUM ('ROUND', 'PRESIDIUM');

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "maxPeople" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestResponse" (
    "id" SERIAL NOT NULL,
    "guestId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "peopleCount" INTEGER,
    "drinks" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingTable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SeatingTableType" NOT NULL DEFAULT 'ROUND',
    "seats" INTEGER NOT NULL DEFAULT 8,
    "positionX" INTEGER NOT NULL DEFAULT 500,
    "positionY" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingAssignment" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "guestId" INTEGER NOT NULL,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "seatStart" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_slug_key" ON "Guest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GuestResponse_guestId_key" ON "GuestResponse"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingAssignment_guestId_key" ON "SeatingAssignment"("guestId");

-- AddForeignKey
ALTER TABLE "GuestResponse" ADD CONSTRAINT "GuestResponse_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "SeatingTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
