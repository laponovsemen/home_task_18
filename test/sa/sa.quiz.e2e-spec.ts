// @ts-ignore
import request from "supertest"
import {before} from "node:test";
import mongoose from "mongoose";
import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../src/app.module";
import cookieParser from "cookie-parser";
import {getAppAndCleanDB} from "../test-utils";
import {QuizDTO} from "../../src/input.classes";

const auth = "Authorization"
const basic = 'Basic YWRtaW46cXdlcnR5'

//TESTING ROUTE
describe("start creating quiz question", () => {
    let app: INestApplication;
    let server : any
    beforeAll(async () => {


        app = await getAppAndCleanDB()
        app.use(cookieParser())
        await app.init();
        server = app.getHttpServer()
    });
    afterAll(async () => {
        app.close()
    });
    it("delete All Data, create question and get them all",async () => {
        await request(server)
            .delete("/testing/all-data")
            .set(auth, basic)
            .expect(204)


        const createQuestionDTO : QuizDTO = {
            body : "question body01",
            correctAnswers : ["correct1"]
        }

        const createQuestion2DTO: QuizDTO = {
            "body": "question body 104061",
            "correctAnswers": ["correct answer 1, correct answer 2"]
        }

        const createdQuestion = await request(server)
            .post("/sa/quiz/questions")
            .set(auth, basic)
            .send(createQuestionDTO)
            .expect(201)

        expect(createdQuestion.body).toEqual({
            "body": "question body01",
               "correctAnswers":  [
                 "correct1",
                  ],
               "createdAt": expect.any(String),
               "id": expect.any(String),
               "published": false,
               "updatedAt": null})

        const createdQuestion2 = await request(server)
            .post("/sa/quiz/questions")
            .set(auth, basic)
            .send(createQuestion2DTO)
            .expect(201)

        expect(createdQuestion2.body).toEqual({
            "body": "question body 104061",
            "correctAnswers":  [
                "correct answer 1, correct answer 2"
            ],
            "createdAt": expect.any(String),
            "id": expect.any(String),
            "published": false,
            "updatedAt": null})

        const getAllQuestions = await request(server)
            .get("/sa/quiz/questions")
            .set(auth, basic)
            .expect(200)

        expect(getAllQuestions.body).toEqual({})

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

})