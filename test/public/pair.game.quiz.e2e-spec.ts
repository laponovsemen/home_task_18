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
    jest.setTimeout(60000)
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
                    correctAnswers: [createQuestionDTO.correctAnswers[0]]
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

      const createThirdUser = await request(server)
        .post(`/sa/users`)
        .set(auth, basic)
        .send({
          login : "login3",
          email : "simsbury65@gmail.com",
          password : "password3"
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

      const loginOfThirdUser = await request(server)
        .post(`/auth/login`)
        .send({
          loginOrEmail : "login3",
          password : "password3"
        })
        .expect(200)

        await request(server)
          .post(`/pair-game-quiz/pairs/connection`)
          .expect(401);

        await request(server)
          .get("/pair-game-quiz/pairs/my-current")
          .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
          .expect(404);

        console.log("create pair");
        const createPair = await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
            .expect(200)

      expect(createPair.body.firstPlayer.id).toEqual(createFirstUser.body.id)
      console.log(createPair.body, " createPair.body.");


        //TRY TO CONNECT TO CREATED PAIR
      await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
        .expect(403)

      const foundGameByIdWhereStatusIsPendingSeconfUser = await request(server)
        .get(`/pair-game-quiz/pairs/${createPair.body.id}`)
        .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
        .expect(200)

      expect(foundGameByIdWhereStatusIsPendingSeconfUser.body).toEqual({
        finishGameDate: null,
        firstPlayerProgress: {
          answers: [],
          player: {
            id: expect.any(String),
            login: "login1"
          },
          score: 0

        },
        id: expect.any(String),
        pairCreatedDate: expect.any(String),
        questions: null,
        secondPlayerProgress: null,
        startGameDate: null,
        status: "PendingSecondPlayer"
      });

        //expect(createPair.body).toEqual({})
        console.log("add second user to pair");
        const connectToTheCreatedPair = await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
            .expect(200)

        console.log("must return 403 because of action of user 2 in another game");
        await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
            .expect(403)

      console.log("must return 403 because of action of user 1 in another game");
      await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(403);

      const foundGameByIdByUserOne =
        await request(server)
          .get(`/pair-game-quiz/pairs/${connectToTheCreatedPair.body.id}`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .expect(200);

      const foundGameByIdByUserTwo =
        await request(server)
          .get(`/pair-game-quiz/pairs/${connectToTheCreatedPair.body.id}`)
          .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
          .expect(200);

      await request(server)
        .get(`/pair-game-quiz/pairs/2281337`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
        .expect(400);

      await request(server)
        .get(`/pair-game-quiz/pairs/${connectToTheCreatedPair.body.id}`)
        .auth(loginOfThirdUser.body.accessToken, { type: "bearer" })
        .expect(403);

      await request(server)
        .get(`/pair-game-quiz/pairs/602afe92-7d97-4395-b1b9-6cf98b351bbe`)
        .auth(loginOfThirdUser.body.accessToken, { type: "bearer" })
        .expect(404);


      await request(server)
        .get(`/pair-game-quiz/pairs/18009213`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(400);

      expect(foundGameByIdByUserOne.body).toEqual(foundGameByIdByUserTwo.body)

      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfThirdUser.body.accessToken, { type: "bearer" })
        .send({"answer":"correct answer"})
        .expect(403);


      //expect(foundGameByIdByUserOne.body).toEqual({})
      const questionsOfTheGame = foundGameByIdByUserOne.body.questions
      console.log(questionsOfTheGame);

      console.log("start making answers for the quiz")

      for (let i = 0; i < 5; i++){
        console.log(i, " attempt");
        await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);

        await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);
      }
      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
        .send({"answer":"correct"})
        .expect(403);

    },60000)



})
