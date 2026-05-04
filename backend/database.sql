USE master
GO

ALTER DATABASE TruyenDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

DROP DATABASE IF EXISTS TruyenDB
GO

CREATE DATABASE TruyenDB
GO

USE TruyenDB
GO

CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    displayName NVARCHAR(100) NOT NULL,
    avatarUrl NVARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,
    role NVARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    isActive BIT NOT NULL DEFAULT 1,
    isBanned BIT NOT NULL DEFAULT 0,
    banReason NVARCHAR(255)
)

CREATE TABLE Follows (
    followerId UNIQUEIDENTIFIER NOT NULL,
    followingId UNIQUEIDENTIFIER NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (followerId, followingId),

    CONSTRAINT CHK_Follows_NoSelfFollow CHECK (followerId <> followingId),
    CONSTRAINT FK_Follows_Follower FOREIGN KEY (followerId) REFERENCES Users(id),
    CONSTRAINT FK_Follows_Following FOREIGN KEY (followingId) REFERENCES Users(id)
)

CREATE TABLE Categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    slug NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL
)

CREATE TABLE Stories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    uploaderId UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    coverUrl NVARCHAR(255),
    summary NVARCHAR(MAX),
    viewCount INT NOT NULL DEFAULT 0,
    reviewCount INT NOT NULL DEFAULT 0,
    chapterCount INT NOT NULL DEFAULT 0,
    averageRating FLOAT NOT NULL DEFAULT 0,
    moderationStatus NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (moderationStatus IN ('draft', 'pending', 'approved', 'rejected', 'locked')),
    writingStatus NVARCHAR(20) NOT NULL DEFAULT 'ongoing' CHECK (writingStatus IN ('ongoing', 'completed', 'hiatus')),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,
 
    CONSTRAINT FK_Stories_Users FOREIGN KEY (uploaderId) REFERENCES Users(id)
)

CREATE TABLE StoryCategories (
    storyId UNIQUEIDENTIFIER NOT NULL,
    categoryId UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (storyId, categoryId),
    
    CONSTRAINT FK_StoryCategories_Stories FOREIGN KEY (storyId) REFERENCES Stories(id) ON DELETE CASCADE,
    CONSTRAINT FK_StoryCategories_Categories FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE CASCADE
)

CREATE TABLE Chapters (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    storyId UNIQUEIDENTIFIER NOT NULL,
    chapterIndex FLOAT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    viewCount INT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,
    
    CONSTRAINT FK_Chapters_Stories FOREIGN KEY (storyId) REFERENCES Stories(id) ON DELETE CASCADE
)

CREATE TABLE ReadingHistory (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    storyId UNIQUEIDENTIFIER NOT NULL,
    chapterId UNIQUEIDENTIFIER NOT NULL,
    UNIQUE (userId, storyId),
    progressPercent INT NOT NULL DEFAULT 0 CHECK (progressPercent BETWEEN 0 AND 100),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,
    
    CONSTRAINT FK_ReadingHistory_Users FOREIGN KEY (userId) REFERENCES Users(id),
    CONSTRAINT FK_ReadingHistory_Stories FOREIGN KEY (storyId) REFERENCES Stories(id),
    CONSTRAINT FK_ReadingHistory_Chapters FOREIGN KEY (chapterId) REFERENCES Chapters(id) ON DELETE CASCADE
)

CREATE TABLE Bookmarks (
    userId UNIQUEIDENTIFIER NOT NULL,
    storyId UNIQUEIDENTIFIER NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (userId, storyId),
    CONSTRAINT FK_Bookmarks_Users FOREIGN KEY (userId) REFERENCES Users(id),
    CONSTRAINT FK_Bookmarks_Stories FOREIGN KEY (storyId) REFERENCES Stories(id) ON DELETE CASCADE
)

CREATE TABLE Reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    storyId UNIQUEIDENTIFIER NOT NULL,
    ratingScore INT NOT NULL CHECK (ratingScore BETWEEN 1 AND 5),
    content NVARCHAR(MAX),
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,

    CONSTRAINT UQ_Reviews_User_Story UNIQUE (userId, storyId),
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (userId) REFERENCES Users(id),
    CONSTRAINT FK_Reviews_Stories FOREIGN KEY (storyId) REFERENCES Stories(id) ON DELETE CASCADE
)

CREATE TABLE Comments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    storyId UNIQUEIDENTIFIER NOT NULL,
    chapterId UNIQUEIDENTIFIER,
    parentId UNIQUEIDENTIFIER,
    content NVARCHAR(MAX) NOT NULL,
    isDeleted BIT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME,
    
    CONSTRAINT CHECK_Comments_NoSelfParent CHECK (id <> parentId),
    CONSTRAINT FK_Comments_Users FOREIGN KEY (userId) REFERENCES Users(id),
    CONSTRAINT FK_Comments_Stories FOREIGN KEY (storyId) REFERENCES Stories(id),
    CONSTRAINT FK_Comments_Chapters FOREIGN KEY (chapterId) REFERENCES Chapters(id) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (parentId) REFERENCES Comments(id) 
)



CREATE TABLE Notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    receiverId UNIQUEIDENTIFIER NOT NULL,
    senderId UNIQUEIDENTIFIER,
    targetType NVARCHAR(50),
    targetId UNIQUEIDENTIFIER, 
    actionType NVARCHAR(50) NOT NULL,
    notificationMessage NVARCHAR(255) NOT NULL,
    isRead BIT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Notifications_Receiver FOREIGN KEY (receiverId) REFERENCES Users(id),
    CONSTRAINT FK_Notifications_Sender FOREIGN KEY (senderId) REFERENCES Users(id)
)