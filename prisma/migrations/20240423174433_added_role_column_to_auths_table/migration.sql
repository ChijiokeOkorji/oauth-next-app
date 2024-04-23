/*
  Warnings:

  - Added the required column `role` to the `auths` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auths" ADD COLUMN     "role" VARCHAR(100) NOT NULL;
