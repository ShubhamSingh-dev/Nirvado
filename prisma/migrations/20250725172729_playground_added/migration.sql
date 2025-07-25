-- CreateEnum
CREATE TYPE "Templates" AS ENUM ('REACT', 'NEXTJS', 'EXPRESS', 'VUE', 'HONO', 'ANGULAR');

-- CreateTable
CREATE TABLE "Playground" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "template" "Templates" NOT NULL DEFAULT 'REACT',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarMark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playgroundId" TEXT NOT NULL,
    "isMarked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StarMark_userId_playgroundId_key" ON "StarMark"("userId", "playgroundId");

-- AddForeignKey
ALTER TABLE "Playground" ADD CONSTRAINT "Playground_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarMark" ADD CONSTRAINT "StarMark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarMark" ADD CONSTRAINT "StarMark_playgroundId_fkey" FOREIGN KEY ("playgroundId") REFERENCES "Playground"("id") ON DELETE CASCADE ON UPDATE CASCADE;
