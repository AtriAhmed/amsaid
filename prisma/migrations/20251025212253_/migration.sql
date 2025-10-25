-- CreateTable
CREATE TABLE `stats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visits` INTEGER NOT NULL DEFAULT 0,
    `totalBooks` INTEGER NOT NULL DEFAULT 0,
    `bookDownloads` INTEGER NOT NULL DEFAULT 0,
    `totalVideos` INTEGER NOT NULL DEFAULT 0,
    `videoViews` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
