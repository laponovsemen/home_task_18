// @ts-ignore
import request from "supertest";
import mongoose from "mongoose";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import process from "process";
import cookieParser from "cookie-parser";


const authE2eSpec = 'Authorization'
const basic = 'Basic YWRtaW46cXdlcnR5'
const mongoURI = process.env.MONGO_URL

describe("TESTING OF CREATING USER AND AUTH", () => {
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
    await app.close()
  });
  it("should authorize user //auth is correct", async () => {
    //delete all data
    await request(server).delete("/testing/all-data")
    //create user
    const user = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      })
      .expect(201)
    expect(user.body).toEqual({
      "banInfo":  {
        "banDate": null,
        "banReason": null,
        "isBanned": false,
             },
      "createdAt": expect.any(String),
      "email": "simsbury65@gmail.com",
      "id": expect.any(String),
      "login": "login"
    })
    //login
    const token = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: "simsbury65@gmail.com",
        password: "password"
      })
      .expect(200)

    expect(token.body.accessToken).toEqual(expect.any(String))

    //create 10 users
    for (let i = 0; i < 10; i++) {
      await request(server)
          .post("/sa/users")
          .set(authE2eSpec, basic)
          .send({
            login: `login${i}`,
            password: `password${i}`,
            email: `simsbury65@gmail.com${i}`
          })
    }
    const allUsers = await request(server)
        .get("/sa/users")
        .set(authE2eSpec, basic)
        .expect(200)


  }, 10000)
  it("sdfdsfsdfds", async () => {
    await request(server).delete("/testing/all-data")
    const result = await request(server)
      .post("/auth/registration")
      .send({
      email : "igorlaponov01011972@gmail.com",
      login : "string",
      password : "stringstring",
    }).expect(204)


  }, 10000)
  it("sdfdsfsdfds2", async () => {
    const result = await request(server)
      .post("/auth/registration-confirmation")
      .send({"code":"ee751dc0-bd44-41e2-a303-1c8bfade13bd"})
      .expect(400)


  }, 10000)
  it("creating user, login and get my profile", async () => {
    //delete all information
    await request(server).delete("/testing/all-data")
    // create new user
    const creationOfUser = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      }).expect(201)
    expect(creationOfUser.body).toEqual({
      "banInfo":  {
        "banDate": null,
        "banReason": null,
        "isBanned": false,
      },
      id: expect.any(String),
      createdAt: expect.any(String),
      login: "login",
      email: "simsbury65@gmail.com"})

    // try to login

    const login = await request(server)
      .post("/auth/login")
      .set(authE2eSpec, basic)
      .send({
        loginOrEmail: "login",
        password: "password",
      }).expect(200)
    //expect(login).toEqual({}) // in case to see all incoming information
    const accessToken = login.body.accessToken
    const refreshToken = login.headers["set-cookie"][0].split(";")[0]

    console.log(accessToken, "accessToken")
    console.log(refreshToken, "refreshToken")

    // try to get my profile
    const myProfile = await request(server)
        .get("/auth/me")
        .set("Cookie", refreshToken)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
        loginOrEmail: "login",
        password: "password",
      }).expect(200)

    expect(myProfile.body).toEqual({
      email: expect.any(String),
      login: expect.any(String),
      userId: expect.any(String)
    })

  }, 10000)
  it("creating user, login and try logout", async () => {
    //delete all information
    await request(server).delete("/testing/all-data")
    // create new user
    const creationOfUser = await request(server)
      .post("/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      }).expect(201)
    expect(creationOfUser.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      login: "login",
      email: "simsbury65@gmail.com",
      banInfo:  {
           "banDate": null,
               "banReason": null,
              "isBanned": false,
             },
    })

    // try to login

    const login = await request(server)
      .post("/auth/login")
      .set(authE2eSpec, basic)
      .send({
        loginOrEmail: "login",
        password: "password",
      }).expect(200)
    //expect(login).toEqual({}) // in case to see all incoming information
    const accessToken = login.body.accessToken
    const refreshToken = login.headers["set-cookie"][0]

    console.log(accessToken, "accessToken")
    console.log(refreshToken, "refreshToken")

    // try to logout
    await request(server)
      .post("/auth/logout")
      .set("Authorization", `Bearer sadasd`)
      .set("Cookie", [])
      .expect(401)

    await request(server)
      .post("/auth/logout")
      .set("Cookie", [])
      .expect(401)


    const logoutProcedure = await request(server)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", [refreshToken])
      .expect(204)
    // try to login


    console.log(new Date(), "new date");
    console.log(new Date().toString(), "new date in string format");
    console.log(new Date().toISOString(), "new date in ISOstring format");
  }, 10000)
  it("creating user, login and try refresh token", async () => {
    //delete all information
    await request(server).delete("/testing/all-data")
    // create new user
    const creationOfUser = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      }).expect(201)
    // checking of created user, if it is correct
    expect(creationOfUser.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      login: "login",
      email: "simsbury65@gmail.com",
      "banInfo":  {
           "banDate": null,
               "banReason": null,
               "isBanned": false,
             },})

    // try to login

    const login = await request(server)
      .post("/auth/login")
      .set(authE2eSpec, basic)
      .send({
        loginOrEmail: "login",
        password: "password",
      }).expect(200)

    //expect(login).toEqual({}) // in case to see all incoming information
    const accessToken = login.body.accessToken
    const refreshToken = login.headers["set-cookie"][0].split(";")[0]

    console.log(accessToken, "accessToken")
    console.log(refreshToken, "refreshToken")

    // try to refresh token
    const refreshTokenProcedure = await request(server)
      .post("/auth/refresh-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", [refreshToken])
      .expect(200)

    expect(refreshTokenProcedure.body).toEqual({accessToken: expect.any(String)})
    const accessTokenAfterRefresh = refreshTokenProcedure.body.accessToken
    const refreshTokenAfterRefresh = refreshTokenProcedure.headers["set-cookie"][0]

    const gettingAllDevices = await request(server)
      .get("/security/devices")
      .set("Cookie", [refreshToken])
      .expect(200)
    console.log(gettingAllDevices.body, "1")

    //try to refresh token second time with old credentials

    await request(server)
      .post("/auth/refresh-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", [refreshToken])
      .expect(401)

    await request(server)
      .post("/auth/refresh-token")
      .set("Authorization", `Bearer ${accessTokenAfterRefresh}`)
      .set("Cookie", [refreshTokenAfterRefresh])
      .expect(200)

    const gettingAllDevices2 = await request(server)
      .get("/security/devices")
      .set("Cookie", [refreshTokenAfterRefresh])
      .expect(200)
    console.log(gettingAllDevices2.body, "2")
    expect(gettingAllDevices2.body[0].lastActiveDate).not.toEqual(gettingAllDevices.body[0].lastActiveDate)
  }, 10000)
  it("try to create user through auth flow", async () => {
    //delete all information
    await request(server).delete("/testing/all-data")
    // create new user
    const creationOfUnconfirmedUser = await request(server)
      .post("/auth/registration")
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      }).expect(201)

      expect(creationOfUnconfirmedUser.body).toEqual({
          code : expect.any(String)
      })

      console.log(creationOfUnconfirmedUser.body.code, " code to register")

      const registrationCodeResending = await request(server)
          .post(`/auth/registration-email-resending`)
          .send({
              email: "simsbury65@gmail.com"
          })
          .expect(201)

      console.log(registrationCodeResending.body, " registrationCodeResending")

      const registrationConfirmation = await request(server)
          .post(`/auth/registration-confirmation?code=${registrationCodeResending.body.code}`)
          .expect(204)

      const login = await request(server)
          .post("/auth/login")
          .send({
              loginOrEmail: "login",
              password: "password",
          }).expect(200)
  }, 10000)



})