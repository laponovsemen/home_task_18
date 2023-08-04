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
import path from "node:path";


const authE2eSpec = "Authorization";
const basic = "Basic YWRtaW46cXdlcnR5";
const mongoURI = process.env.MONGO_URL;

describe("TESTING OF CREATING USER AND AUTH", () => {
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

    const users = [];
    for (let i = 0; i <= 3; i++) {
      const createUserDto: UserDTO = {
        login: `login${i}`,
        password: "password",
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
      expect(isString(res.body.id)).toBeTruthy();
      users.push({ ...createUserDto, ...res.body });
    }

    const [user0, user1, user2] = users;

    const loginRes = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user0.login,
        password: user0.password
      });
    const loginRes1 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user1.login,
        password: user1.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginRes.body;


    const createBlogDto: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createdBlogRes = await request(server)
      .post(`/blogger/blogs`)
      .auth(accessToken, {type: 'bearer'})
      .send(createBlogDto)


    expect(createdBlogRes.status).toBe(201);
    expect(createdBlogRes.body).toEqual({
      "createdAt": expect.any(String),
      "description": createBlogDto.description,
      "id": expect.any(String),
      "images": {
        "main": [],
        "wallpaper": null
      },
      "isMembership": false,
      "name": createBlogDto.name,
      "websiteUrl": createBlogDto.websiteUrl
    });

    const blogId = createdBlogRes.body.id

    console.log(loginRes1.body.accessToken,"accesstoken");
    await request(server)
      .post(`/blogs/${blogId}/subscription`)
      .auth(loginRes1.body.accessToken, {type : "bearer"})
      .expect(204)

    const foundBlog = await request(server)
      .get(`/blogs/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)
    expect(foundBlog.body).toEqual({
        "createdAt": expect.any(String),
         "description": "stringasdstring",
         "id": expect.any(String),
         "images":  {
           "main":  [],
             "wallpaper":  null
        },
      "subscribersCount": 1,
      "currentUserSubscriptionStatus": "",
        "isMembership": false,
         "name": "string",
         "websiteUrl": "simsbury65@gmail.com"
    })
  }, 10000);

});
