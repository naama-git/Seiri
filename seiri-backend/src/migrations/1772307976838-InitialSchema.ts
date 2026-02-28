import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772307976838 implements MigrationInterface {
    name = 'InitialSchema1772307976838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fileMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "size" bigint NOT NULL, "MIME_type" character varying NOT NULL, "extension" character varying NOT NULL, "s3_key" character varying NOT NULL, "ai_results" jsonb NOT NULL DEFAULT '{}', "is_processed" boolean NOT NULL DEFAULT false, "item_id" uuid, CONSTRAINT "REL_eb5aebc914ff0687db0eb3db79" UNIQUE ("item_id"), CONSTRAINT "PK_490aae1de8a71eeff8ea58b40da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."file_system_items_type_enum" AS ENUM('file', 'folder')`);
        await queryRunner.query(`CREATE TABLE "file_system_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."file_system_items_type_enum" NOT NULL DEFAULT 'file', "ai_tags" jsonb DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "mpath" character varying DEFAULT '', "owner_id" uuid, "parent_id" uuid, CONSTRAINT "PK_e1ba71feca503df1925f8c516b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "root_folder_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_ffc1e12ddff770c3b3be2e4391e" UNIQUE ("root_folder_id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "fileMetadata" ADD CONSTRAINT "FK_eb5aebc914ff0687db0eb3db79d" FOREIGN KEY ("item_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0" FOREIGN KEY ("parent_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ffc1e12ddff770c3b3be2e4391e" FOREIGN KEY ("root_folder_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ffc1e12ddff770c3b3be2e4391e"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d"`);
        await queryRunner.query(`ALTER TABLE "fileMetadata" DROP CONSTRAINT "FK_eb5aebc914ff0687db0eb3db79d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_ffc1e12ddff770c3b3be2e4391e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "root_folder_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`DROP TABLE "file_system_items"`);
        await queryRunner.query(`DROP TYPE "public"."file_system_items_type_enum"`);
        await queryRunner.query(`DROP TABLE "fileMetadata"`);
    }

}
