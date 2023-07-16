import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import cookieParser from "cookie-parser";
import {INestApplication} from "@nestjs/common";
import {DataSource} from "typeorm";

export const getAppAndCleanDB = async () => {
    let app: INestApplication;
    let server : any
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser())
    await app.init();
    server = app.getHttpServer()
    const dataSource = await app.resolve(DataSource)
    await dataSource.query(`
CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = 'laponovsemen' AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;    

SELECT truncate_tables('laponovsemen');`)

    return app
}