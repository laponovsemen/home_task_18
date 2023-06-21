// @ts-ignore
import request from "supertest"
import {before} from "node:test";
import mongoose from "mongoose";
import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../src/app.module";
import cookieParser from "cookie-parser";

const auth = "Authorization"
const basic = 'Basic YWRtaW46cXdlcnR5'

//TESTING ROUTE
describe("testing od deleting all data  ", () => {
    let app: INestApplication;
    let server : any
    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser())
        await app.init();
        server = app.getHttpServer()
    });
    afterAll(async () => {
        app.close()
    });
    it("testing od deleting all data // correct authorization ",async () => {
        request(server)
            .delete("/testing/all-data")
            .set(auth, basic)
            .expect(204)
    })

    it("testing od deleting all data // incorrect authorization // wrong Authorization field value", () => {
        request(server)
            .delete("/testing/all-data")
            .set(auth, "ksdjfl;skdfjlkds")
            .expect(401)
    })

    it("testing od deleting all data // incorrect authorization // no Authorization field in header", () => {
        request(server)
            .delete("/testing/all-data")
            .set("lkdhjflksdfhkldsjhf", basic)
            .expect(401)
    })
    it("testing of getting all security devices", async () => {
        const gettingAllDevices = await request(server)
            .get("/testing/all-data/all-security-devices")
            .expect(200)
        console.log(gettingAllDevices.body)
    })
})
