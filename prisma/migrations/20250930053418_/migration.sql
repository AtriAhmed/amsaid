/*
  Warnings:

  - You are about to drop the `booktag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `videospeaker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `videotag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `booktag` DROP FOREIGN KEY `BookTag_bookId_fkey`;

-- DropForeignKey
ALTER TABLE `booktag` DROP FOREIGN KEY `BookTag_tagId_fkey`;

-- DropForeignKey
ALTER TABLE `videospeaker` DROP FOREIGN KEY `VideoSpeaker_personId_fkey`;

-- DropForeignKey
ALTER TABLE `videospeaker` DROP FOREIGN KEY `VideoSpeaker_videoId_fkey`;

-- DropForeignKey
ALTER TABLE `videotag` DROP FOREIGN KEY `VideoTag_tagId_fkey`;

-- DropForeignKey
ALTER TABLE `videotag` DROP FOREIGN KEY `VideoTag_videoId_fkey`;

-- DropTable
DROP TABLE `booktag`;

-- DropTable
DROP TABLE `videospeaker`;

-- DropTable
DROP TABLE `videotag`;

-- CreateTable
CREATE TABLE `_PersonToVideo` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PersonToVideo_AB_unique`(`A`, `B`),
    INDEX `_PersonToVideo_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TagToVideo` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TagToVideo_AB_unique`(`A`, `B`),
    INDEX `_TagToVideo_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BookToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BookToTag_AB_unique`(`A`, `B`),
    INDEX `_BookToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PersonToVideo` ADD CONSTRAINT `_PersonToVideo_A_fkey` FOREIGN KEY (`A`) REFERENCES `Person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PersonToVideo` ADD CONSTRAINT `_PersonToVideo_B_fkey` FOREIGN KEY (`B`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToVideo` ADD CONSTRAINT `_TagToVideo_A_fkey` FOREIGN KEY (`A`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToVideo` ADD CONSTRAINT `_TagToVideo_B_fkey` FOREIGN KEY (`B`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookToTag` ADD CONSTRAINT `_BookToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookToTag` ADD CONSTRAINT `_BookToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
