// @ts-ignore
import request from "supertest"
import {before} from "node:test";
import mongoose from "mongoose";
import {BadRequestException, INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../src/app.module";
import cookieParser from "cookie-parser";
import {HttpExceptionFilter} from "../../src/exception.filter";
import {useContainer} from "class-validator";

export const auth = 'Authorization'
export const basic = 'Basic YWRtaW46cXdlcnR5'
//POSTS ROUTE
describe("TESTING OF CREATING POST", () => {
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
    it("should create post", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)

        const createdUser = await request(server)
            .post("/sa/users")
            .set(auth, basic)
            .send({
                login : "login",
                email : "simsbury65@gmail.com",
                password : "password"
            })
            .expect(201)

        const loginOfCreatedUser = await request(server)
            .post("/auth/login")
            .set(auth, basic)
            .send({
                loginOrEmail : "login",
                email : "simsbury65@gmail.com",
                password : "password"
            })
            .expect(200)
        const accessToken = loginOfCreatedUser.body.accessToken

        const createdBlog = await request(server)
            .post("/blogger/blogs")
            .auth(accessToken, {type : "bearer"})
            .send({"name":"new blog",
                "description":"description",
                "websiteUrl":"https://github.com/",
            })
            .expect(201)
        const blogId = createdBlog.body.id


        const result = await request(server)
            .post(`/blogger/blogs/${blogId}/posts`)
            .auth(accessToken, {type : "bearer"})
            .send({"content":"new post content",
                "shortDescription":"description",
                "title":"post title",
                "blogId":`${blogId}`})
            .expect(201)
        expect(result.body).toEqual({"id": expect.any(String),
            "blogId": blogId,
            "blogName": "new blog",
            "content": "new post content",
            "createdAt": expect.any(String),
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
                newestLikes: [],
            },
            "shortDescription": "description",
            "title": "post title"})

        const foundPost = await request(server)
            .get(`/posts/${result.body.id}`)
            .set(auth, basic)
            .expect(200)
        expect(foundPost.body).toEqual({"id": expect.any(String),
            "blogId": blogId,
            "blogName": "new blog",
            "content": "new post content",
            "createdAt": expect.any(String),
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
                newestLikes: [],
            },
            "shortDescription": "description",
            "title": "post title"})
        const resultOfReadingAllPosts = await request(server)
            .get(`/posts`)
            .set(auth, basic)
            .expect(200)
        //expect(resultOfReadingAllPosts.body).toEqual(Array)

        const user = await request(server)
            .post(`/users`)
            .set(auth, basic)
            .send({
                login : "Hleb",
                password : "string",
                email : "simsbury65@gmail.com"
            })
            .expect(201)

        /*expect(user.body).toEqual({
            "email": "simsbury65@gmail.com",
            "login": "Hleb",
            "password": "string",
        })*/

        const login = await request(server)
            .post(`/auth/login`)
            .set(auth, basic)
            .send({
                loginOrEmail : "Hleb",
                password : "string"
            })

        expect(login.body).toEqual({
            accessToken : expect.any(String)
        })

        const likedPosts = await request(server)
            .put(`/posts/${result.body.id}/like-status`)
            .auth(accessToken, {type : "bearer"})
            .send({
                likeStatus : "Like"
            })
            .expect(204)

        const foundPostAfterLike = await request(server)
            .get(`/posts/${result.body.id}`)
            .auth(accessToken, {type : "bearer"})
            .expect(200)
        expect(foundPost.body).toEqual({"id": expect.any(String),
            "blogId": blogId,
            "blogName": "new blog",
            "content": "new post content",
            "createdAt": expect.any(String),
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 1,
                myStatus: "None",
                newestLikes: [
                    {
                        addedAt : expect.any(Date),
                        userId : expect.any(String),
                        login : expect.any(String)
                    }
                ],
            },
            "shortDescription": "description",
            "title": "post title",


        })
    }, 15000)

    describe("TESTING OF UPDATING POST BY ID", () => {
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
        it("should create post and by updating it must return 400 status code and array of errors", async () => {
            await request(server).delete("/testing/all-data").set(auth, basic)
            const createdBlog = await request(server)
                .post("/blogs")
                .set(auth, basic)
                .send({
                    "name": "new blog",
                    "description": "description",
                    "websiteUrl": "https://github.com/",
                })
                .expect(201)
            const blogId = createdBlog.body.id
            const result = await request(app)
                .post("/posts")
                .set(auth, basic)
                .send({
                    "content": "new post content",
                    "shortDescription": "description",
                    "title": "post title",
                    "blogId": `${blogId}`
                })
                .expect(201)
            expect(result.body).toEqual({
                "id": expect.any(String),
                "blogId": blogId,
                "blogName": "new blog",
                "content": "new post content",
                "createdAt": expect.any(String),
                "shortDescription": "description",
                "title": "post title"
            })

            const updatedPost = await request(app)
                .put(`/posts/${result.body.id}`)
                .set(auth, basic)
                .send({
                        "title": "valid",
                        "content": "valid",
                        "blogId": "63189b06003380064c4193be",
                        "shortDescription": "length_101-DnZlTI1khUHpqOqCzftIYiSHCV8fKjYFQOoCIwmUczzW9V5K8cqY3aPKo3XKwbfrmeWOJyQgGnlX5sP3aW3RlaRSQx"
                    }
                )
                .expect(400)
            expect(updatedPost.body).toEqual({
                errorsMessages:
                    [
                        {message: "the length of shortDescription field is more than 100 chars", field: "shortDescription"},
                        {message: "No blogs with such id in database", field: "blogId"}
                    ]
            })
        })
        it("should create post", async () => {
            await request(app).delete("/testing/all-data").set(auth, basic)
            const createdBlog = await request(app)
                .post("/blogs")
                .set(auth, basic)
                .send({
                    "name": "new blog",
                    "description": "description",
                    "websiteUrl": "https://github.com/",
                })
                .expect(201)
            const blogId = createdBlog.body.id
            const result = await request(app)
                .post("/posts")
                .set(auth, basic)
                .send({
                    "content": "content",
                    "shortDescription": "description",
                    "title": "post title",
                    "blogId": `${blogId}`
                })
                .expect(201)
            expect(result.body).toEqual({
                "id": expect.any(String),
                "blogId": blogId,
                "blogName": "new blog",
                "content": "content",
                "createdAt": expect.any(String),
                "shortDescription": "description",
                "title": "post title"
            })

            const updatedPost = await request(app)
                .put(`/posts/${result.body.id}`)
                .set(auth, basic)
                .send({
                        "title": "title updated",
                        "content": "new post content",
                        "blogId": "63189b06003380064c4193be",
                        "shortDescription": "shortDescription after update"
                    }
                )
                .expect(204)
            const foundPost = await request(app)
                .get(`/posts/${result.body.id}`)
                .set(auth, basic)
                .expect(200)
            expect(foundPost.body).toEqual({
                id: expect.any(String),
                blogName: "new blog",
                title: "title updated",
                content: "new post content",
                blogId: "63189b06003380064c4193be",
                shortDescription: "shortDescription after update",
                createdAt: expect.any(String)
            })
        })
    })

    describe("TESTING OF DELETING POST BY ID", () => {
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
        it("should create post", async () => {
            await request(app).delete("/testing/all-data").set(auth, basic)
            const createdBlog = await request(app)
                .post("/blogs")
                .set(auth, basic)
                .send({"name":"new blog",
                    "description":"description",
                    "websiteUrl":"https://github.com/",
                })
                .expect(201)
            const blogId = createdBlog.body.id
            const result = await request(app)
                .post("/posts")
                .set(auth, basic)
                .send({"content":"new post content",
                    "shortDescription":"description",
                    "title":"post title",
                    "blogId":`${blogId}`})
                .expect(201)
            expect(result.body).toEqual({"id": expect.any(String),
                "blogId": blogId,
                "blogName": "new blog",
                "content": "new post content",
                "createdAt": expect.any(String),
                "shortDescription": "description",
                "title": "post title"})

            const updatedPost = await request(app)
                .delete(`/posts/${result.body.id}`)
                .set(auth, basic)
                .expect(204)

        })
    })

    describe("TESTING OF READING POST BY ID", () => {
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
        it("should create post", async () => {
            await request(app).delete("/testing/all-data").set(auth, basic)
            const createdBlog = await request(app)
                .post("/blogs")
                .set(auth, basic)
                .send({"name":"new blog",
                    "description":"description",
                    "websiteUrl":"https://github.com/",
                })
                .expect(201)
            const blogId = createdBlog.body.id
            const result = await request(app)
                .post("/posts")
                .set(auth, basic)
                .send({"content":"new post content",
                    "shortDescription":"description",
                    "title":"post title",
                    "blogId":`${blogId}`})
                .expect(201)
            expect(result.body).toEqual({"id": expect.any(String),
                "blogId": blogId,
                "blogName": "new blog",
                "content": "new post content",
                "createdAt": expect.any(String),
                "shortDescription": "description",
                "title": "post title"})

            const foundPost = await request(app)
                .get(`/posts/${result.body.id}`)
                .set(auth, basic)
                .expect(200)
            expect(foundPost.body).toEqual({"id": expect.any(String),
                "blogId": blogId,
                "blogName": "new blog",
                "content": "new post content",
                "createdAt": expect.any(String),
                "shortDescription": "description",
                "title": "post title"})
        })
    })
})