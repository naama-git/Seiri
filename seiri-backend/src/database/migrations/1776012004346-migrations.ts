import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1776012004346 implements MigrationInterface {
    name = 'Migrations1776012004346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_a96f8d02d2344ef12ddf56f524d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
