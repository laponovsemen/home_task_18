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
import { PairGameQuizViewModel } from "../../src/pair.quiz.game/view.model.classess/pair.game.quiz.view.model";
import { delay } from "rxjs";
import setTimeout = jest.setTimeout;
import { Common } from "../../src/common";

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
        console.log("start test");
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

      console.log(createPair.body, " createPair.body.");


        //TRY TO CONNECT TO CREATED PAIR
      await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
        .expect(403)

      const firstUserGamesAfterBeforeActiveGames = await request(server)
        .get(`/pair-game-quiz/pairs/my`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(200);

      //expect(firstUserGamesAfterBeforeActiveGames.body).toEqual({})

      const foundGameByIdWhereStatusIsPendingSeconfUser = await request(server)
        .get(`/pair-game-quiz/pairs/${createPair.body.id}`)
        .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
        .expect(200)

      const foundMyCurrentGameWhereStatusIsPendingSeconfUser = await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
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
      expect(foundGameByIdWhereStatusIsPendingSeconfUser.body).toStrictEqual(createPair.body)

      expect(foundMyCurrentGameWhereStatusIsPendingSeconfUser.body).toEqual({
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
        const connectToTheCreatedPair  = await request(server)
            .post(`/pair-game-quiz/pairs/connection`)
            .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
            .expect(200)

      expect(connectToTheCreatedPair.body).toStrictEqual({
          id: expect.any(String),
          finishGameDate: null,
          status: "Active",
          pairCreatedDate: expect.any(String),
          startGameDate: expect.any(String),
          firstPlayerProgress: {
            answers: [],
            player: {
              id: expect.any(String),
              login: "login1"
            },
            score: 0
          },
          secondPlayerProgress: {
            answers: [],
            player: {
              id: expect.any(String),
              login: "login2"
            },
            score: 0
          },

          questions: [{ body: expect.any(String), id: expect.any(String) },
            { body: expect.any(String), id: expect.any(String) },
            { body: expect.any(String), id: expect.any(String) },
            { body: expect.any(String), id: expect.any(String) },
            { body: expect.any(String), id: expect.any(String) }
          ]
        })


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

      await request(server)
        .get(`/pair-game-quiz/pairs/18sd009213`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
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
        console.log(i + 1, " attempt");
        const answerOfFirstUser = await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);

        expect(answerOfFirstUser.body).toEqual({
          questionId : expect.any(String),
          answerStatus : "Correct",
          addedAt : expect.any(String)
        })

        await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);
      }
      console.log("hard place num 1");
      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
        .send({"answer":"correct"})
        .expect(403);

      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .send({"answer":"correct"})
        .expect(403);

      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(404);

      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
        .expect(404);

      await request(server)
        .get(`/pair-game-quiz/pairs/2281337`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(400);

      const finishedGame = await request(server)
        .get(`/pair-game-quiz/pairs/${createPair.body.id}`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(200);

      /*expect(finishedGame.body).toEqual({
        finishGameDate: expect.any(String),
        firstPlayerProgress: {
          answers: [
            {},
            {},
            {},
          {},
            {}],
          player: {
            id: expect.any(String),
            login: "login1"
          },
          score: 6

        },
        id: expect.any(String),
        pairCreatedDate: expect.any(String),
        questions: [{},{},{},{},{}],
        secondPlayerProgress: {
          answers: [
            {},
            {},
            {},
            {},
            {}],
          player: {
            id: expect.any(String),
            login: "login2"
          },
          score: 5

        },
        startGameDate: expect.any(String),
        status: "Finished"
      })*/

      const createSecondPair = await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(loginOfFirstUser.body.accessToken, {type : 'bearer'})
        .expect(200)

      const connectToSecondPair = await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(loginOfSecondUser.body.accessToken, {type : 'bearer'})
        .expect(200)

      for (let i = 0; i < 4; i++){
        console.log(i + 1, " attempt of game number 2");
        await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .send({"answer":"incorrect"})
          .expect(200);

        const currentGameOfFirstUser = await request(server)
          .get(`/pair-game-quiz/pairs/my-current`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .expect(200);
        //expect(currentGameOfFirstUser.body).toEqual({})

        await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);

        const currentGameOfSecondUser = await request(server)
          .get(`/pair-game-quiz/pairs/my-current`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .expect(200);
        //expect(currentGameOfSecondUser.body).toEqual({})

        const currentGameOfSecondUserById = await request(server)
          .get(`/pair-game-quiz/pairs/${createSecondPair.body.id}`)
          .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
          .expect(200);

        //expect(currentGameOfSecondUser.body).toStrictEqual(currentGameOfSecondUserById.body)
      }

      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .send({"answer":"incorrect"})
        .expect(200);

      const currentGameOfFirstUser = await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(200);
      //expect(currentGameOfFirstUser.body).toEqual({})

      await request(server)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .auth(loginOfSecondUser.body.accessToken, { type: "bearer" })
        .send({"answer":"correct"})
        .expect(200);

      const currentGameOfSecondUser = await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(404);


      const firstUserGamesAfterTwoGames = await request(server)
        .get(`/pair-game-quiz/pairs/my`)
        .auth(loginOfFirstUser.body.accessToken, { type: "bearer" })
        .expect(200);

      //expect(firstUserGamesAfterTwoGames.body).toEqual({})

    },60000)
    it("clone of test home task №27",async () => {
      console.warn("Homework 27 > Top players DELETE -> \"/testing/all-data\":" +
        " should remove all data; status 204;");
      await request(server).delete("/testing/all-data").expect(204)

      console.warn(" Homework 27 > Top players POST -> \"/sa/quiz/questions\"," +
        " PUT -> \"/sa/quiz/questions/:questionId/publish\":" +
        " should create and publish several questions; status 201;" +
        " content: created question;");

      const createQuestionDTO : QuizDTO = {
        body : "question",
        correctAnswers : ["correct"]
      }

      for(let i = 0; i < 5 ; i++){
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

      console.warn("Homework 27 > Top players POST -> \"/sa/users\"," +
        " \"/auth/login\": should create and login 5 users; status 201; content: created users;");

      let usersArray = []
      for(let i = 0; i < 5 ; i++){
        const createdUser = await request(server)
          .post(`/sa/users`)
          .set(auth, basic)
          .send({
            login : `login${i}`,
            email : "simsbury65@gmail.com",
            password : `password${i}`
          })
          .expect(201)

        console.log(createdUser, " createdUser" );

        const loginOfCreatedUser = await request(server)
          .post(`/auth/login`)
          .send({
            loginOrEmail : `login${i}`,
            password : `password${i}`
          })
          .expect(200)

        console.log(loginOfCreatedUser, " loginOfCreatedUser" );

        usersArray.push({
          id : createdUser.body.id,
          login : createdUser.body.login,
          password : createdUser.body.password,
          accessToken : loginOfCreatedUser.body.accessToken,
        })
      }

      console.log(usersArray, " usersArray");

      console.warn("Homework 27 > Top players\n" +
        "POST -> \"/pair-game-quiz/pairs/my-current/answers\"," +
        " GET -> \"/pair-game-quiz/pairs\", GET -> \"/pair-game-quiz/pairs/my-current\": " +
        "create game by user1, connect to the game by user2, then: add correct answer by firstPlayer;" +
        " add incorrect answer by firstPlayer; add correct answer by secondPlayer; add incorrect answer by secondPlayer; " +
        "add incorrect answer by secondPlayer; add incorrect answer by secondPlayer; add incorrect answer by secondPlayer;" +
        " add correct answer by firstPlayer; add correct answer by firstPlayer; add incorrect answer by firstPlayer;" +
        " firstPlayer should win, scores: 3 - 2; ; status 200;");

      const createPairByUser1 = await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(usersArray[0].accessToken, {type : 'bearer'})
        .expect(200)

      const connectToTheCreatedPairByUser2  = await request(server)
        .post(`/pair-game-quiz/pairs/connection`)
        .auth(usersArray[1].accessToken, {type : 'bearer'})
        .expect(200)


      const createdGameId  = connectToTheCreatedPairByUser2.body.id
      
      for (let i = 0; i < 5; i++){
        console.log(i + 1, " attempt");
        const answerOfFirstUser = await request(server)
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .auth(usersArray[0].accessToken, { type: "bearer" })
          .send({"answer":"correct"})
          .expect(200);

        expect(answerOfFirstUser.body).toEqual({
          questionId : expect.any(String),
          answerStatus : "Correct",
          addedAt : expect.any(String)
        })

      }
      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(usersArray[1].accessToken, {type : 'bearer'})
        .expect(200)

      const common = new Common()
      await common.delay(3000)


      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(usersArray[1].accessToken, {type : 'bearer'})
        .expect(200)

      await common.delay(7000)

      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .auth(usersArray[1].accessToken, {type : 'bearer'})
        .expect(404)




    })



})
