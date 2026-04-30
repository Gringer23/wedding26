-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('WILL_COME', 'WILL_NOT_COME');

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

-- CreateIndex
CREATE UNIQUE INDEX "Guest_slug_key" ON "Guest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GuestResponse_guestId_key" ON "GuestResponse"("guestId");

-- AddForeignKey
ALTER TABLE "GuestResponse" ADD CONSTRAINT "GuestResponse_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
