// @ts-ignore
import request from "supertest";
import jwt from "jsonwebtoken";
import exp = require("constants");
import {ObjectId} from "mongodb";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import cookieParser from "cookie-parser";
import process from "process";
import {delay} from "rxjs";


const mongoURI = process.env.MONGO_URL

const auth = 'Authorization'
const basic = 'Basic YWRtaW46cXdlcnR5'
const someRandomObjectIdToString = "64820e7bce17712b5c9e3c23"

describe("TEST OF CHECKING CONNECTED DEVICES", () => {
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
  jest.setTimeout(30000)
  it("creating user, login 4 times and check devices", async () => {
    // deleting all info
    await request(server).delete("/testing/all-data")
    // creation of User
    const createdUser = await request(server)
      .post("/users")
      .set(auth, basic)
      .send({
        login : "login",
        email: "simsbury65@gmail.com",
        password : "password"
      }).expect(201)

    // login of created User
    const login = await request(server)
        .post("/auth/login")
        .set('user-agent', 'FIREFOX')
        .send({
            loginOrEmail : "login",
            password : "password"
        }).expect(200)

    const loginizationOfUser2 = await request(server)
        .post("/auth/login")
        .set('user-agent', 'CHROME')
        .send({
            loginOrEmail : "login",
            password : "password"
        }).expect(200)

    await request(server)
        .post("/auth/login")
        .set('user-agent', 'SAFARI')
        .send({
            loginOrEmail : "login",
            password : "password"
        }).expect(200)

    await request(server)
        .post("/auth/login")
        .send({
            loginOrEmail : "login",
            password : "password"
        }).expect(200)

    const accessToken = login.body.accessToken
    const refreshToken = login.headers['set-cookie'][0].split(";")[0].slice(13)
    const refreshTokenOfUser2 = loginizationOfUser2.headers['set-cookie'][0].split(";")[0].slice(13)

    console.log(accessToken , " access token of first created user")
    console.log(refreshToken, " refresh token of first created user")

    const gettingAllDevicesForSpecificUser = await request(server)
        .get("/security/devices")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(200)
    expect(gettingAllDevicesForSpecificUser.body).toEqual([
        {"deviceId": expect.any(String),
          "ip": "::ffff:127.0.0.1",
          "lastActiveDate": expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/),
          "title": "FIREFOX"},

        {"deviceId": expect.any(String),
          "ip": "::ffff:127.0.0.1",
          "lastActiveDate": expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/),
          "title": "CHROME"},

        {"deviceId": expect.any(String),
          "ip": "::ffff:127.0.0.1",
          "lastActiveDate": expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/),
          "title": "SAFARI"},

        {"deviceId": expect.any(String),
          "ip": "::ffff:127.0.0.1",
          "lastActiveDate": expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/),
          "title": "unknown"}]
)
    const logout = await request(server)
      .post("/auth/logout")
      .set("Cookie", [`refreshToken=${refreshTokenOfUser2}`])
      .expect(204)

    const gettingAllDevicesForSpecificUserAfterLogout = await request(server)
      .get("/security/devices")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(200)
    expect(gettingAllDevicesForSpecificUserAfterLogout.body.length).toEqual(3)

  })
  it("creating user and login and try to delete sessions by id", async () => {
    // deleting all data
    await request(server).delete("/testing/all-data")
    // creating user
    const createdUser = await request(server)
      .post("/users")
      .set(auth, basic)
      .send({
        login : "login",
        email: "simsbury65@gmail.com",
        password : "password"
      }).expect(201)
    const login = await request(server)
        .post("/auth/login")
        .send({
            loginOrEmail : "login",
            password : "password"
        }).expect(200)

    const accessToken = login.body.accessToken
    const refreshToken = [login.headers['set-cookie'][0].split(";")[0]] //
    //console.log(accessToken)

    console.log("refreshToken ", refreshToken)

    const gettingAllDevicesForSpecificUser = await request(server)
        .get("/security/devices")
        .set("Cookie", refreshToken)
        .expect(200)

    const deviceId = gettingAllDevicesForSpecificUser.body[0].deviceId
    console.log("deviceId - " + deviceId)
    console.log("body of all devices request", gettingAllDevicesForSpecificUser.body)

    const deleteDeviceById = await request(server)
        .delete(`/security/devices/${deviceId}`)
        .set("Cookie", refreshToken)
        .expect(204)
    await request(server)
      .delete(`/security/devices/${deviceId}`)
      .set("Cookie", refreshToken)
      .expect(404)
    await request(server)
        .delete(`/security/devices/${someRandomObjectIdToString}`)
        .set("Cookie", refreshToken)
        .expect(404)
    //expect(gettingAllDevicesForSpecificUser.body).toEqual({})

  })
  it("creating user and check for deleting all devices excluding current device", async () => {
    await request(server).delete("/testing/all-data")
    const registration = await request(server)
      .post("/users")
      .set("Authorization", basic)
      .send({
        login: "login",
        email : "igorlaponov01011972@gmail.com",
        password : "password"
      }).expect(201)



    const login = await request(server)
      .post("/auth/login")
      .set('user-agent', 'FIREFOX')
      .send({
        loginOrEmail : "login",
        password : "password"
      }).expect(200)

    await request(server)
      .post("/auth/login")
      .set('user-agent', 'CHROME')
      .send({
        loginOrEmail : "login",
        password : "password"
      }).expect(200)

    await request(server)
      .post("/auth/login")
      .set('user-agent', 'SAFARI')
      .send({
        loginOrEmail : "login",
        password : "password"
      }).expect(200)

    await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail : "login",
        password : "password"
      }).expect(200)

    const accessToken = login.body.accessToken
    const refreshToken = login.headers['set-cookie'][0]
    const payload : any = jwt.decode(refreshToken)
    const deviceId = payload.id
    //console.log(accessToken)


    const gettingAllDevices = await request(app)
      .get("/testing/all-data/all-security-devices")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(200)
    console.log(gettingAllDevices.body)

    //console.log("refresh - " + deviceId)
    //console.log("body - ", gettingAllDevicesForSpecificUser.body)


    //expect(gettingAllDevicesForSpecificUser.body).toEqual({})

  })
  it("creating user and user2, check for deleting one device by id", async () => {
    await request(server).delete("/testing/all-data")
    const user1 = await request(server)
        .post("/sa/users")
        .set(auth, basic)
        .send({
            login : "login1",
            password : "password1",
            email : "simsbury65@gmail.com"
        })
        .expect(201)

      const user2 = await request(server)
          .post("/sa/users")
          .set(auth, basic)
          .send({
              login : "login2",
              password : "password2",
              email : "simsbury65@gmail.com"
          })
          .expect(201)

      //FIRST USER LOGINS

      const login1 = await request(server)
          .post("/auth/login")
          .set('user-agent', 'FIREFOX')
          .send({
              loginOrEmail : "login1",
              password : "password1"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'CHROME')
          .send({
              loginOrEmail : "login1",
              password : "password1"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'INTERNET')
          .send({
              loginOrEmail : "login1",
              password : "password1"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'DF')
          .send({
              loginOrEmail : "login1",
              password : "password1"
          }).expect(200)

      //SECOND USER LOGINS
      const login2 = await request(server)
          .post("/auth/login")
          .set('user-agent', 'CHROME')
          .send({
              loginOrEmail : "login2",
              password : "password2"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'CHROME')
          .send({
              loginOrEmail : "login2",
              password : "password2"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'INTERNET')
          .send({
              loginOrEmail : "login2",
              password : "password2"
          }).expect(200)

      await request(server)
          .post("/auth/login")
          .set('user-agent', 'DF')
          .send({
              loginOrEmail : "login2",
              password : "password2"
          }).expect(200)


      const accessToken1 = login1.body.accessToken
      const refreshToken1 = login1.headers['set-cookie'][0].split(";")[0].split("=")[1]
      console.log(refreshToken1, " refreshToken1")
      const payload1 : any = jwt.decode(refreshToken1)
      console.log(payload1, " payload1")
      const deviceId1 = payload1.deviceId

      const accessToken2 = login1.body.accessToken
      const refreshToken2 = login1.headers['set-cookie'][0].split(";")[0].split("=")[1]
      const payload2 : any = jwt.decode(refreshToken1)
      const deviceId2 = payload2.deviceId


      const allDevices = await request(server)
          .get("/security/devices")
          .set("Cookie", [`refreshToken=${refreshToken1}`])
          .expect(200)

      expect(allDevices.body).toHaveLength(4)
      const firstDeviceOfUser1 = allDevices.body[0]
      console.log(firstDeviceOfUser1, " firstDeviceOfUser1")


      await request(server)
          .delete(`/security/devices/${firstDeviceOfUser1.deviceId}`)
          .set("Cookie", [`refreshToken=${refreshToken2}`])
          .expect(403)

      await request(server)
          .delete(`/security/devices/76982348790-8-kjksd029032123`)
          .set("Cookie", [`refreshToken=${refreshToken2}`])
          .expect(404)

      const deleteAllOthersDevices1 = await request(server)
          .delete(`/security/devices`)
          .set("Cookie", [`refreshToken=${refreshToken1}`])
          .expect(204)


      const allDevicesAfterdeleteAllOthersDevices1 = await request(server)
          .get("/security/devices")
          .set("Cookie", [`refreshToken=${refreshToken1}`])
          .expect(200)

      expect(allDevicesAfterdeleteAllOthersDevices1.body).toHaveLength(1)

      //const leftDevice =




    /*const gettingAllDevices = await request(app)
      .get("/testing/all-data/all-security-devices")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(200)
    console.log(gettingAllDevices.body)*/

    //console.log("refresh - " + deviceId)
    //console.log("body - ", gettingAllDevicesForSpecificUser.body)


    //expect(gettingAllDevicesForSpecificUser.body).toEqual({})

  })

})