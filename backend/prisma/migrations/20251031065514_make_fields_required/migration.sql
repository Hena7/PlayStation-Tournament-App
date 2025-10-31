/*
  Warnings:

  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ethiopian_phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values to default values
UPDATE "users" SET "email" = 'placeholder@example.com' WHERE "email" IS NULL;
UPDATE "users" SET "ethiopian_phone" = '+251000000000' WHERE "ethiopian_phone" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "ethiopian_phone" SET NOT NULL;
