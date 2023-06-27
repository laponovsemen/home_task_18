// @ts-ignore
import request from "supertest";
import mongoose from "mongoose";
import {BadRequestException, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../src/app.module";
import cookieParser from "cookie-parser";
import {HttpExceptionFilter} from "../../src/exception.filter";
import {isString, useContainer} from "class-validator";
import {BlogDTO, PostForSpecificBlogDTO, UserDTO} from "../../src/input.classes";



const auth = "Authorization";
const basic = "Basic YWRtaW46cXdlcnR5";

describe("CREATEING COMMENTS FOR SPECIFIED POST TESTFLOW", () => {
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
    it("should create user, blog, pot, comment , auth and get comments //auth is correct", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)

        const users = [];
        for (let i = 0; i <= 2; i++) {
            const createUserDto: UserDTO = {
                login: `login${i}`,
                password: "password",
                email: `simsbury65${i}@gmail.com`
            };
            const res = await request(server)
                .post("/sa/users")
                .set(auth, basic)
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

        const [user0, user1] = users;

        const loginRes0 = await request(server)
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

        expect(loginRes0.status).toBe(200);
        expect(loginRes1.status).toBe(200);
        expect(loginRes0.body).toEqual({ accessToken: expect.any(String) });
        expect(loginRes1.body).toEqual({ accessToken: expect.any(String) });
        const accessToken0  = loginRes0.body.accessToken;
        const accessToken1  = loginRes1.body.accessToken;

        const createBlogDto: BlogDTO = {
            name : "string",
            description: "stringasdstring",
            websiteUrl : "simsbury65@gmail.com"
        }

        const createdBlogRes = await request(server)
            .post(`/blogger/blogs`)
            .auth(accessToken1, {type: 'bearer'})
            .send(createBlogDto)



        expect(createdBlogRes.status).toBe(201)
        expect(createdBlogRes.body).toEqual({
            "createdAt": expect.any(String),
            "description": createBlogDto.description,
            "id": expect.any(String),
            "isMembership": false,
            "name": createBlogDto.name,
            "websiteUrl": createBlogDto.websiteUrl,
        })

        const blogId = createdBlogRes.body.id

        const createPostDTO1 : PostForSpecificBlogDTO = {
            title : "title",
            shortDescription : "shortDescription",
            content : "content",
        }

        const post = await request(server)
            .post(`/blogger/blogs/${blogId}/posts`)
            .auth(accessToken1, {type: 'bearer'})
            .send(createPostDTO1)

        expect(post.status).toBe(201)

        const postId = post.body.id

        const like = await request(server)
            .put(`/posts/${postId}/like-status`)
            .auth(accessToken0, {type: 'bearer'})
            .send({
                likeStatus: "Like"
            })
            .expect(204)

        const getPost = await request(server)
                .get(`/posts/${postId}`)
                .auth(accessToken0, {type: 'bearer'})
                .expect(200)

            expect(getPost.body).toEqual({
               "blogId": expect.any(String),
                   "blogName": "string",
                   "content": "content",
                   "createdAt": expect.any(String),
                   "extendedLikesInfo": {
                       "dislikesCount": 0,
                       "likesCount": 1,
                       "newestLikes": [],
                       "myStatus": "Like"
                       },
                    "id": expect.any(String),
                   "shortDescription": "shortDescription",
                   "title": "title",
                 })




    }, 60000)

    /*it("should create delete and update comments //auth is correct", async () => {



    })*/
})