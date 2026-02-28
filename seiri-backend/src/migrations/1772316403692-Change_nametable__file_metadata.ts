import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeNametable_fileMetadata1772316403692 implements MigrationInterface {
    name = 'ChangeNametable_fileMetadata1772316403692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file-metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "size" bigint NOT NULL, "MIME_type" character varying NOT NULL, "extension" character varying NOT NULL, "s3_key" character varying NOT NULL, "ai_results" jsonb NOT NULL DEFAULT '{}', "is_processed" boolean NOT NULL DEFAULT false, "item_id" uuid, CONSTRAINT "REL_b10d250a9494bca757cee9e545" UNIQUE ("item_id"), CONSTRAINT "PK_377d74f1087475539bd99e19d3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file-metadata" ADD CONSTRAINT "FK_b10d250a9494bca757cee9e5453" FOREIGN KEY ("item_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file-metadata" DROP CONSTRAINT "FK_b10d250a9494bca757cee9e5453"`);
        await queryRunner.query(`DROP TABLE "file-metadata"`);
    }

}
