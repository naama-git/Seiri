import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1775762479135 implements MigrationInterface {
    name = 'Migrations1775762479135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0" FOREIGN KEY ("parent_id") REFERENCES "file_system_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_system_items" ADD CONSTRAINT "FK_9f2f8eebaf1c8bf19f7b5a3d1a0" FOREIGN KEY ("parent_id") REFERENCES "file_system_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
