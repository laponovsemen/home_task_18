// @ts-ignore
import request from "supertest";
import mongoose from "mongoose";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import process from "process";
import cookieParser from "cookie-parser";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import {ArrayContains, isMongoId, isString, useContainer} from "class-validator";
import {
  BanUserByBloggerDTO,
  BlogDTO,
  CommentForSpecifiedPostDTO,
  PostDTO,
  PostForSpecificBlogDTO,
  UserDTO
} from "../../src/input.classes";


const authE2eSpec = "Authorization";
const basic = "Basic YWRtaW46cXdlcnR5";
const mongoURI = process.env.MONGO_URL;

describe("TESTING OF CREATING USER AND AUTH as", () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe(
        {
          stopAtFirstError: true,
          exceptionFactory: (errors) => {
            const errorsForResponse = [];
            console.log(errors, "ERRORS");

            errors.forEach(e => {
              const constrainedKeys = Object.keys(e.constraints);
              //console.log(constrainedKeys, "constrainedKeys");
              constrainedKeys.forEach((ckey) => {
                errorsForResponse.push({
                  message: e.constraints[ckey],
                  field: e.property
                });
                console.log(errorsForResponse, "errorsForResponse");

              });

            });
            throw new BadRequestException(errorsForResponse);
          }
        }
      )
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();
    server = app.getHttpServer();
  });
  afterAll(async () => {
    await app.close();
  });
  it("create user, login, create blog, create another user and ban user2 for blog", async () => {

    await request(server).delete("/testing/all-data");

      const createMainUserDto: UserDTO = {
          login: `loginMain`,
          password: "passwordpassword",
          email: `simsbury65@gmail.com`
      };
      const res = await request(server)
          .post("/sa/users")
          .set(authE2eSpec, basic)
          .send(createMainUserDto);


      expect(res.status).toBe(201);
      expect(res.body).toEqual({
          id: expect.any(String),
          login: createMainUserDto.login,
          "email": createMainUserDto.email,
          "createdAt": expect.any(String),
          "banInfo": {
              "banDate": null,
              "banReason": null,
              "isBanned": false
          }
      });

      expect(isString(res.body.id)).toBeTruthy();

      console.log({loginOrEmail: res.body.login, password: "passwordpassword"}, "login data")
      console.log(res.body.id, " res.body.id")

      const loginMainRes = await request(server)
          .post("/auth/login")
          .send({
              loginOrEmail: res.body.login,
              password: "passwordpassword"
          });

      expect(loginMainRes.status).toBe(200);
      expect(loginMainRes.body).toEqual({ accessToken: expect.any(String) });
      const { accessToken } = loginMainRes.body;


      const createBlogDto: BlogDTO = {
          name : "string",
          description: "stringasdstring",
          websiteUrl : "simsbury65@gmail.com"
      }

      const createdBlogRes = await request(server)
          .post(`/blogger/blogs`)
          .auth(accessToken, {type: 'bearer'})
          .send(createBlogDto)



    const users = [];
    for (let i = 0; i <= 10; i++) {
      const createUserDto: UserDTO = {
        login: `login${i}`,
        password: "passwordpassword",
        email: `simsbury65${i}@gmail.com`
      };
      const res = await request(server)
        .post("/sa/users")
        .set(authE2eSpec, basic)
        .send(createUserDto);


      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(String),
        login: createUserDto.login,
        "email": createUserDto.email,
        "createdAt": expect.any(String),
        "banInfo": {
          "banDate": null,
          "banReason": null,
          "isBanned": false
        }
      });
        await request(server)
            .put(`/blogger/users/${res.body.id}/ban`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                "isBanned": true,
                "banReason": "stringstringstringst",
                "blogId": createdBlogRes.body.id
            })
            .expect(204)

    }
      await request(server)
          .put(`/blogger/users/602afe92-7d97-4395-b1b9-6cf98b351bbe/ban`)
          .auth(accessToken, {type: 'bearer'})
          .send({
              "isBanned": true,
              "banReason": "stringstringstringst",
              "blogId": createdBlogRes.body.id
          })
          .expect(404)



      await request(server)
          .get(`/blogger/users/blog/:id`)
          .auth(accessToken, {type: 'bearer'})
          .expect(404)


    const allUsersBansInfo = await request(server)
        .get(`/blogger/users/blog/${createdBlogRes.body.id}`)
        .auth(accessToken, {type: 'bearer'})
        .expect(200)

      const bannedUsers = allUsersBansInfo.body.items

      const userIdToUnban = allUsersBansInfo.body.items[0].id
      const bannedUser = bannedUsers.find((user) => user.id === userIdToUnban);
      console.log(bannedUser, " bannedUser")
      console.log(bannedUsers, " bannedUsers")
        expect(bannedUser).toBeDefined()


      expect(allUsersBansInfo.body).toEqual({"items":  [
                {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login10",
                   },
            {
                "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login9",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login8",
                   },
            {
                "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login7",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login6",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login5",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login4",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login3",
                   },
            {
                "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                "id": expect.any(String),
                     "login": "login2",
                   },
            {
                 "banInfo":  {
                       "banDate": expect.any(String),
                           "banReason": "stringstringstringst",
                           "isBanned": true,
                         },
                 "id": expect.any(String),
                     "login": "login1",
                   },

         ],
          "page": 1,
          "pageSize": 10,
          "pagesCount": 2,
          "totalCount": 11,
           })

      await request(server)
          .put(`/blogger/users/${userIdToUnban}/ban`)
          .auth(accessToken, {type: 'bearer'})
          .send({
              "isBanned": false,
              "banReason": "stringstringstringst",
              "blogId": createdBlogRes.body.id
          })
          .expect(204)

      const allUsersAfterUnban = await request(server)
          .get(`/blogger/users/blog/${createdBlogRes.body.id}`)
          .auth(accessToken, {type: 'bearer'})
          .expect(200)
      console.log(allUsersAfterUnban.body, " FINAL")
      expect(allUsersAfterUnban.body.items.find((user) => user.id === userIdToUnban)).toBeUndefined()

      await request(server)
          .put(`/blogger/users/${allUsersAfterUnban.body.items[0].id}/ban`)
          .auth(accessToken, {type: 'bearer'})
          .send({
              "isBanned": false,
              "banReason": "stringstringstringst",
              "blogId": createdBlogRes.body.id
          })
          .expect(204)

      const allUsersAfterUnban2 = await request(server)
          .get(`/blogger/users/blog/${createdBlogRes.body.id}`)
          .auth(accessToken, {type: 'bearer'})
          .expect(200)
      console.log(allUsersAfterUnban2.body, " FINAL2")
      expect(allUsersAfterUnban2.body.items.find((user) => user.id === allUsersAfterUnban.body.items[0].id)).toBeUndefined()

      await request(server)
          .put(`/blogger/users/${allUsersAfterUnban.body.items[allUsersAfterUnban.body.items.length - 1].id}/ban`)
          .auth(accessToken, {type: 'bearer'})
          .send({
              "isBanned": false,
              "banReason": "stringstringstringst",
              "blogId": createdBlogRes.body.id
          })
          .expect(204)


      const allUsersAfterUnban3 = await request(server)
          .get(`/blogger/users/blog/${createdBlogRes.body.id}`)
          .auth(accessToken, {type: 'bearer'})
          .expect(200)
      console.log(allUsersAfterUnban2.body, " FINAL2")

      expect(allUsersAfterUnban2.body.items.find((user) =>
          user.id === allUsersAfterUnban.body.items[allUsersAfterUnban.body.items.length - 1].id)).toBeDefined()

      console.log(allUsersAfterUnban2.body.items, " allUsersAfterUnban2.body.items")

      expect(allUsersAfterUnban3.body.items.find((user) =>
          user.id === allUsersAfterUnban.body.items[allUsersAfterUnban.body.items.length - 1].id)).toBeUndefined()

      console.log(allUsersAfterUnban3.body.items, " allUsersAfterUnban3.body.items")


  }, 30000);
  it("create user, login, create blog, ", async () => {

    await request(server).delete("/testing/all-data");

      const createMainUserDto: UserDTO = {
          login: `loginMain`,
          password: "passwordpassword",
          email: `simsbury65@gmail.com`
      };
      const res = await request(server)
          .post("/sa/users")
          .set(authE2eSpec, basic)
          .send(createMainUserDto);


      const loginMainRes = await request(server)
          .post("/auth/login")
          .send({
              loginOrEmail: res.body.login,
              password: "passwordpassword"
          });

      const allUsersBeforeBan = await request(server)
          .get(`/sa/users`)
          .set(authE2eSpec, basic)
          .expect(200)

      expect(allUsersBeforeBan.body.items.length).toEqual(1)


      await request(server)
          .put(`/sa/users/${res.body.id}/ban`)
          .send({
              "isBanned": true,
              "banReason": "stringstringstringst"
          }).expect(401)

      const ban = await request(server)
          .put(`/sa/users/${res.body.id}/ban`)
          .set(authE2eSpec, basic)
          .send({
              "isBanned": true,
              "banReason": "stringstringstringst"
          }).expect(204)


      const allUsersAfterBan = await request(server)
          .get(`/sa/users`)
          .set(authE2eSpec, basic)
          .expect(200)

      expect(allUsersAfterBan.body.items[0].banInfo.isBanned).toEqual(true)




      const loginOfBannedUser = await request(server)
          .put(`/auth/login`)
          .send({
              loginOrEmail: res.body.login,
              password: "passwordpassword"
          }).expect(404)

      const unban = await request(server)
          .put(`/sa/users/${res.body.id}/ban`)
          .set(authE2eSpec, basic)
          .send({
              "isBanned": false,
              "banReason": "stringstringstringst"
          }).expect(204)


      const allUsersAfterUnBan = await request(server)
          .get(`/sa/users`)
          .set(authE2eSpec, basic)
          .expect(200)

      expect(allUsersAfterUnBan.body.items.length).toEqual(1)

  }, 10000);


});