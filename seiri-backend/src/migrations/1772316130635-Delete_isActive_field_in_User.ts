import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteIsActiveFieldInUser1772316130635 implements MigrationInterface {
    name = 'DeleteIsActiveFieldInUser1772316130635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

}
