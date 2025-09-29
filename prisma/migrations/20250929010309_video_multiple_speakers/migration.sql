/*
  Warnings:

  - You are about to drop the column `speakerId` on the `video` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `video` DROP FOREIGN KEY `Video_speakerId_fkey`;

-- DropIndex
DROP INDEX `Video_speakerId_fkey` ON `video`;

-- AlterTable
ALTER TABLE `video` DROP COLUMN `speakerId`;

-- CreateTable
CREATE TABLE `VideoSpeaker` (
    `videoId` INTEGER NOT NULL,
    `personId` INTEGER NOT NULL,

    PRIMARY KEY (`videoId`, `personId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VideoSpeaker` ADD CONSTRAINT `VideoSpeaker_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoSpeaker` ADD CONSTRAINT `VideoSpeaker_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
