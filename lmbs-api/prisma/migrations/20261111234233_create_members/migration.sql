-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "membershipNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "hobbies" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_membershipNumber_key" ON "Member"("membershipNumber");
