import { DataSource, QueryRunner } from "typeorm";
import { Injectable, Scope } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { randomUUID } from "crypto";

@Injectable()
export class TypeORMTransactionService {

  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {

  }

  private arrayOfQr: {qRId: string, queryRunner: QueryRunner}[] = [];

  async createRunner () {
      const queryRunner: QueryRunner = this.dataSource.createQueryRunner()
      const qRId = randomUUID()
      const data = {qRId, queryRunner}
      this.arrayOfQr.push(data)
      return qRId
  }

  async connect(qRId: string) {
    const data = this.arrayOfQr.find(el => el.qRId === qRId)
    return data.queryRunner.connect()
  }

  async startTransaction(qRId: string) {
      const data = this.arrayOfQr.find(el => el.qRId === qRId)
      return data.queryRunner.startTransaction()
  }

  async commitTransaction(qRId: string) {
      const data = this.arrayOfQr.find(el => el.qRId === qRId)
      return data.queryRunner.commitTransaction()
  }

  async rollbackTransaction(qRId: string) {
      const data = this.arrayOfQr.find(el => el.qRId === qRId)
      return data.queryRunner.rollbackTransaction()
  }

  async release(qRId: string) {
      const data = this.arrayOfQr.find(el => el.qRId === qRId)
      await data.queryRunner.release()
      this.arrayOfQr.filter(el => el.qRId !== qRId)
      return true

  }

}