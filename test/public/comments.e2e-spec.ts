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
        await request(server).delete("/testing/all-data").set(auth, basic) // ask why it does not work without await

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

        const loginRes = await request(server)
            .post("/auth/login")
            .send({
                loginOrEmail: user0.login,
                password: user0.password
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
            .auth(accessToken, {type: 'bearer'})
            .send(createPostDTO1)

        expect(post.status).toBe(201)

        const postId = post.body.id


        //console.log(JWT)
        const createdComment = await request(server)
            .post(`/posts/${postId}/comments`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                content: "stringstringstringst"
            }).expect(201)
        expect(createdComment.body).toEqual(
            {
                commentatorInfo:
                    {
                        userId: expect.any(String),
                        userLogin: expect.any(String)
                    },
                likesInfo: {
                    "dislikesCount": 0,
                    "likesCount": 0,
                    "myStatus": "None",
                },
                content: "stringstringstringst",
                createdAt: expect.any(String),
                id: expect.any(String)
            })
        //http://localhost:8080/comments/646f748d05499080fde26c66/like-status
        const commentId = createdComment.body.id

        const wrongId = "6452328cf49782a0f0000000"
        //console.log(wrongId)
        //console.log(postId)
        await request(server)
            .post(`/posts/${wrongId}/comments`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                content: "stringstringstringst"
            }).expect(404)

        await request(server)
            .delete(`/comments/${wrongId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(404)

        await request(server)
            .put(`/comments/${wrongId}`)
            .auth(accessToken, {type: 'bearer'})
            .send({content: "length25 - kkkkkkkkkkkkkkk"})
            .expect(404)

        const tryOfUpdatingComment = await request(server)
            .put(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .send({content: "length25 - kkkkkkkkkkkkkkk"})
            .expect(204)

        await request(server)
            .delete(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(204)

        console.log(commentId)
        await request(server)
            .get(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(404)


        //expect(tryOfUpdatingComment.body).toEqual("")
    }, 60000)

    /*it("should create delete and update comments //auth is correct", async () => {



    })*/
})
describe("CREATING COMMENTS FOR Likes procedures testing", () => {
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

        await request(server).delete("/testing/all-data").set(auth, basic)

        const createUserDto: UserDTO = {
            login: `login`,
            password: "password",
            email: `simsbury65@gmail.com`
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

        const loginRes = await request(server)
            .post("/auth/login")
            .send({
                loginOrEmail: res.body.login,
                password: "password"
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


        const createdPost = await request(server).post(`/blogger/blogs/${blogId}/posts`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                title: `string`, //    maxLength: 30
                shortDescription: "string", //maxLength: 100
                content: "string", // maxLength: 1000
                blogId: blogId
            })
            .expect(201)
        const postId = createdPost.body.id

        console.log(createdPost.body, " createdPost in test")

        for(let i = 0; i < 4 ; i++){
            await request(server)
                .post("/sa/users")
                .set(auth, basic)
                .send({
                    login: `login${i}`,
                    password: "password",
                    email: "simsbury65@gmail.com"
                }).expect(201)
        }



        expect(accessToken).toEqual(expect.any(String))

        //console.log(JWT)
        const createdComment = await request(server)
            .post(`/posts/${postId}/comments`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                content: "stringstringstringst"
            }).expect(201)

        expect(createdComment.body).toEqual(
            {
                commentatorInfo:
                    {
                        userId: expect.any(String),
                        userLogin: expect.any(String)
                    },
                content: "stringstringstringst",
                createdAt: expect.any(String),
                id: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                },
            })
        const commentId = createdComment.body.id
        await request(server)
            .put(`/comments/${commentId}/like-status`)
            .auth(accessToken, {type: 'bearer'})
            .send({
                likeStatus: "Like"
            }).expect(204)

        const likedComment = await request(server)
            .get(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(200)
        expect(likedComment.body).toEqual({
            commentatorInfo: {
                userId: expect.any(String),
                userLogin: "login",
            },
            content: "stringstringstringst",
            createdAt: expect.any(String),
            id: commentId,
            likesInfo: {
                dislikesCount: 0,
                likesCount: 1,
                myStatus: "Like"
            },
        })
            await request(server)
                .get(`/comments/2281337`)
                .auth(accessToken, {type: 'bearer'})
                .expect(404)

        await request(server)
            .get(`/comments/2281337`)
            .expect(404)
        await request(server)
            .get(`/comments/${commentId}`)
            .expect(200)

        await request(server)
            .put(`/comments/2281337`)
            .auth(accessToken, {type: 'bearer'})
            .send({content : "stringstringstringstring"})
            .expect(404)

        await request(server)
            .delete(`/comments/2281337`)
            .auth(accessToken, {type: 'bearer'})
            .expect(404)

        await request(server)
            .put(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .send({content : "stringstringstringstring2"})
            .expect(204)

        const likedCommentAfterUpdate = await request(server)
            .get(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(200)




        const likedCommentAfterUpdatethroughPostCotroller = await request(server)
                .get(`/posts/${postId}/comments`)
                .auth(accessToken, {type: 'bearer'})
                .expect(200)

        await request(server)
            .get(`/posts/602afe92-7d97-4395-b1b9-6cf98b351bbe/comments`)
            .auth(accessToken, {type: 'bearer'})
            .expect(404)



        expect(likedCommentAfterUpdate.body).toEqual({
            commentatorInfo: {
                userId: expect.any(String),
                userLogin: "login",
            },
            content: "stringstringstringstring2",
            createdAt: expect.any(String),
            id: commentId,
            likesInfo: {
                dislikesCount: 0,
                likesCount: 1,
                myStatus: "Like"
            },
        })


        const user2 = await request(server)
            .post("/sa/users")
            .set(auth, basic)
            .send({
                login: `newlogin`,
            password: "newpassword",
            email: `simsbury65@gmail.com`
            });


        expect(user2.status).toBe(201);
        expect(user2.body).toEqual({
            id: expect.any(String),
            login: `newlogin`,
            "email": createUserDto.email,
            "createdAt": expect.any(String),
            "banInfo": {
                "banDate": null,
                "banReason": null,
                "isBanned": false
            }
        });

        const loginRes2 = await request(server)
            .post("/auth/login")
            .send({
                loginOrEmail: `newlogin`,
                password: "newpassword"
            });

        await request(server)
            .delete(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${loginRes2.body.accessToken}`)
            .expect(403)

        await request(server)
            .put(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${loginRes2.body.accessToken}`)
            .send({content : "stringstringstringstring3"})
            .expect(403)





        await request(server)
            .delete(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(204)

        await request(server)
            .get(`/comments/${commentId}`)
            .auth(accessToken, {type: 'bearer'})
            .expect(404)

    }, 60000)

})