import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1776861297525 implements MigrationInterface {
    name = 'Migrations1776861297525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "size" bigint NOT NULL, "MIME_type" character varying NOT NULL, "extension" character varying NOT NULL, "s3_key" character varying, "ai_results" jsonb NOT NULL DEFAULT '{}', "is_processed" boolean NOT NULL DEFAULT false, "item_id" uuid, CONSTRAINT "REL_bdc1a126bc4d80f4b86459bc0a" UNIQUE ("item_id"), CONSTRAINT "PK_b8805dd11c868561f260a0410ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file_metadata" ADD CONSTRAINT "FK_bdc1a126bc4d80f4b86459bc0ae" FOREIGN KEY ("item_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_metadata" DROP CONSTRAINT "FK_bdc1a126bc4d80f4b86459bc0ae"`);
        await queryRunner.query(`DROP TABLE "file_metadata"`);
    }

}
