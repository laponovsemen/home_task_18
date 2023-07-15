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
            body : "question",
            correctAnswers : ["correct"]
        }
        for(let i = 0; i < 10 ; i++){
            const createdQuestion = await request(server)
                .post("/sa/quiz/questions")
                .set(auth, basic)
                .send({
                    body : createQuestionDTO.body + `${i}`,
                    correctAnswers: [createQuestionDTO.correctAnswers[0] + `${i}`]
                })
                .expect(201)

            await request(server)
                .put(`/sa/quiz/questions/${createdQuestion.body.id}/publish`)
                .set(auth, basic)
                .send({
                    "published": true
                })
                .expect(204)
        }

        const createFirstUser = await request(server)
            .post(`/sa/users`)
            .set(auth, basic)
            .send({
                login : "login1",
                email : "simsbury65@gmail.com",
                password : "password1"
            })
            .expect(201)

        const createSecondUser = await request(server)
            .post(`/sa/users`)
            .set(auth, basic)
            .send({
                login : "login2",
                email : "simsbury65@gmail.com",
                password : "password2"
            })
            .expect(201)

        const loginOfFirstUser = await request(server)
            .post(`/auth/login`)
            .send({
                loginOrEmail : "login1",
                password : "password1"
            })
            .expect(200)

        const loginOfSecondUser = await request(server)
            .post(`/auth/login`)
            .send({
                loginOrEmail : "login2",
                password : "password2"
            })
            .expect(200)

        await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .expect(401)

        console.log("create pair");
        const createPair = await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
            .expect(201)

        //expect(createPair.body).toEqual({})
        console.log("add second user to pair");
        const connectToTheCreatedPair = await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
            .expect(201)

        console.log("must return 403 because of action in another game");
        await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
            .expect(403)

      await request(server)
        .delete("/testing/all-data")
        .set(auth, basic)
        .expect(204)


    },30000)



})
