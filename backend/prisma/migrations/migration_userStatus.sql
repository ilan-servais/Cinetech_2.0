-- CreateTable
CREATE TABLE "user_status" (
  "id" SERIAL NOT NULL,
  "userId" TEXT NOT NULL,
  "mediaId" INTEGER NOT NULL,
  "mediaType" TEXT NOT NULL,
  "favorite" BOOLEAN NOT NULL DEFAULT false,
  "watched" BOOLEAN NOT NULL DEFAULT false,
  "watchLater" BOOLEAN NOT NULL DEFAULT false,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_status_userId_mediaId_mediaType_key" ON "user_status"("userId", "mediaId", "mediaType");

-- AddForeignKey
ALTER TABLE "user_status" ADD CONSTRAINT "user_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
