import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1776858502816 implements MigrationInterface {
    name = 'Migrations1776858502816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file-metadata" ALTER COLUMN "s3_key" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file-metadata" ALTER COLUMN "s3_key" SET NOT NULL`);
    }

}
