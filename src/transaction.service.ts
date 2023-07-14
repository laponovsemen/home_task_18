import {DataSource, QueryRunner} from "typeorm";
import {OnModuleInit} from "@nestjs/common";

export class  TypeORMTransactionService implements OnModuleInit {
    private queryRunner : QueryRunner
    constructor(
        protected dataSource : DataSource
    ) {
    }
    onModuleInit() {
        this.queryRunner = this.dataSource.createQueryRunner()
    }

    async startTransaction(){
        await this.queryRunner.connect()
    }

    async commitTransaction(){
        await this.queryRunner.connect()
    }

    async rollbackTransaction(){
        await this.queryRunner.rollbackTransaction()
    }

    async release(){
        await this.queryRunner.release()
    }

}