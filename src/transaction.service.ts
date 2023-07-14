import {DataSource, QueryRunner} from "typeorm";
import {Injectable, OnModuleInit} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";

@Injectable()
export class  TypeORMTransactionService {
    private queryRunner : QueryRunner
    constructor(
        @InjectDataSource() protected dataSource : DataSource
    ) {
        this.queryRunner = this.dataSource.createQueryRunner()
    }

    async connect(){
        return this.queryRunner.connect()
    }

    async startTransaction(){
        return this.queryRunner.startTransaction()
    }

    async commitTransaction(){
        return  this.queryRunner.commitTransaction()
    }

    async rollbackTransaction(){
        return this.queryRunner.rollbackTransaction()
    }

    async release(){
        await this.queryRunner.release()
    }

}