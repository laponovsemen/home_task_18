// @ts-ignore
import request from "supertest"
import mongoose from "mongoose";
require('dotenv').config()

import {Common} from "../../src/common";
import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../../src/app.module";
import cookieParser from "cookie-parser";



const auth = 'Authorization'
const basic = 'Basic YWRtaW46cXdlcnR5'
const mongoURI = process.env.MONGO_URL!
//BLOGS ROUTE
describe("TESTING OF GETTING ALL BLOGS", () => {
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
        app.close()
    });
    it("should return all blogs //auth is correct", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(server)
            .get("/blogs")
            .expect(200)
        expect(result.body).toEqual( {"items": [], "page": 1, "pageSize": 10, "pagesCount": 0, "totalCount": 0}
        )
    })
    it("should return all blogs //auth is incorrect", async () => {
        await request(server).delete("/testing/all-data")
        const result = await request(server)
            .get("/blogs")
            .expect(200)
        expect(result.body).toEqual({"items": [], "page": 1, "pageSize": 10, "pagesCount": 0, "totalCount": 0}
        )
    })


})


describe("TESTING OF CREATING BLOGS", () => {
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
        app.close()
    });
    it("should return STATRUS CODE 201 and created  blogs //Authorization field is correct", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(server)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "string", //maxLength: 15
                description : "string",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(201)
        expect(result.body).toEqual({
            id : expect.any(String),
            name : "string", //maxLength: 15
            description : "string",// maxLength: 500
            websiteUrl : "https://samurai.it-incubator.io/pc",// maxLength: 100 pattern
            createdAt : expect.any(String),
            isMembership : false
        })
    })
    it("should return STATRUS CODE 401 //Authorization field is incorrect", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(server)
            .post("/blogs")
            .set(auth, "")
            .send({
                name : "string", //maxLength: 15
                description : "string",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc/video-content/watch/6255d0837db18afb3691560d" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(401)
    })
    it("should return STATRUS CODE 400 //Validation field is incorrect, name and description is empty", async () => {
        request(app).delete("/testing/all-data").set(auth, basic)
        const result = await request(app)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "", //maxLength: 15
                description : "",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc/video-content/watch/6255d0837db18afb3691560d" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(400)
        expect(result.body).toEqual({"errorsMessages": [{"field": "name", "message": "the length of name field is less than 1 chars "},
                {"field": "description", "message": "the length of description field is less than 1"}]}
        )
    })
    it("should return STATRUS CODE 400 //Validation field is incorrect, name is empty", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(server)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "", //maxLength: 15
                description : "dsfsd",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc/video-content/watch/6255d0837db18afb3691560d" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(400)
        expect(result.body).toEqual({"errorsMessages": [{"field": "name", "message": "the length of name field is less than 1 chars "}]}
        )
    })
    it("should return STATRUS CODE 400 //Validation field is incorrect, WebUrl is incrrect", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(server)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "name", //maxLength: 15
                description : "dsfsd",// maxLength: 500
                websiteUrl : "htt.io/pc/video-content/watch/6255d0837db18afb3691560d" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(400)
        expect(result.body).toEqual({"errorsMessages": [{"field": "websiteUrl", "message": "the websiteUrl field is not URL"}]}
        )
    })
    it("should return STATRUS CODE 400 //Validation field is incorrect, all fields are empty strings", async () => {
        request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(app)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : " ", //maxLength: 15
                description : " ",// maxLength: 500
                websiteUrl : " " // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(400)
        expect(result.body).toEqual({"errorsMessages": [{"field": "name","message": "the length of name field is less than 1 chars "},
                {"field": "description", "message": "the length of description field is less than 1"},
                {"field": "websiteUrl", "message": "the websiteUrl field is not URL"}

            ]}
        )
    })
})

describe("TESTING OF GETTING BLOG BY ID", () => {
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
        app.close()
    });
    it("should return status code 404 if blog not found is not found", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        await request(server).get("/blog/399482304723908").expect(404)
    })
    it("should return status code 200 if blog found found", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        const createdBlog = await request(server).post("/blogs").set(auth, basic).send({
            name : "string", //maxLength: 15
            description : "string",// maxLength: 500
            websiteUrl : "https://samurai.it-incubator.io/pc"
        }).expect(201)

        const ID = createdBlog.body.id

        const result = await request(app).get(`/blogs/${ID}`).expect(200)
        expect(result.body).toEqual({
            id: ID,
            name : "string", //maxLength: 15
            description : "string",// maxLength: 500
            websiteUrl : "https://samurai.it-incubator.io/pc",
            createdAt: expect.any(String),
            isMembership: false
        })
    })
})

describe("TESTING OF DELETING BLOG BY ID", () => {
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
        app.close()
    });
    it("should return status code 404 if blog not found", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        await request(server).delete("/blogs/643899abf224160164b2ad25").set(auth, basic).expect(404)
    })
    it("should return status code 404 if blog not found", async () => {
        await request(server).delete("/blogs/643899abf224160164b2ad25").set("dfsdf", "dsfdslfjklfdj").expect(401)
    })
    it("should return status code 204 if blog found and delete it", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        const createdBlog = await request(server)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "string", //maxLength: 15
                description : "string",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })
            .expect(201)
        const blogId = createdBlog.body.id
        await request(server).delete(`/blogs/${blogId}`).set(auth, basic).expect(204)
    })
})

describe("TESTING OF UPDATING BLOG BY ID", () => {
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
        app.close()
    });
    it("should return status code 400 if blog wiyh no fields", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        await request(server).put("/blogs/399482304723908").set(auth, basic).expect(400)
    })
    it("should return status code 204 if blog found // all data is correct", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        const result = await request(app)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name: "name",
                description: "string",
                websiteUrl: "https://samurai.it-incubator.io",
            }).expect(201)
        const blogId = result.body.id
        const updatedBlog = await request(app)
            .put(`/blogs/${blogId}`)
            .set(auth, basic)
            .send({name: "noname",
                description: "nostring",
                websiteUrl: "https://samurai.it-incubator.io",})
            .expect(204)
    })
    it("should return status code 401 if unauthorized", async () => {
        const updatedBlog = await request(server)
            .put(`/blogs/1`)
            .set("f", "sdf;kkndsfl")
            .send({name: "noname",
                description: "nostring",
                websiteUrl: "https://samurai.it-incubator.io/lessons/homeworks?id=624afdcde3f66c9c19412171",})
            .expect(401)
    })
    it("should return status code 401 if unauthorized", async () => {
        const updatedBlog = await request(server)
            .put(`/blogs/1`)
            .set("f", "sdf;kkndsfl")
            .send({name: "noname",
                description: "nostring",
                websiteUrl: "https://samurai.it-incubator.io/lessons/homeworks?id=624afdcde3f66c9c19412171",})
            .expect(401)
    })
    it("should return status code 400 if data is incorrect // empty name field", async () => {
        const result = await request(server)
            .put(`/blogs/1`)
            .set(auth, basic)
            .send({name: "",
                description: "nostring",
                websiteUrl: "https://samurai.it-incubator.io",})
            .expect(400)
        expect(result.body).toEqual({errorsMessages : [{message : expect.any(String), field: expect.any(String)}]})
    })
    it("should return status code 400 if data is incorrect // empty description field", async () => {

        const result = await request(server)
            .put(`/blogs/1`)
            .set(auth, basic)
            .send({name: "nostring",
                description: "",
                websiteUrl: "https://samurai.it-incubator.io",})
            .expect(400)
        expect(result.body).toEqual({errorsMessages : [{message : "the length of description field is less than 1", field: "description"}]})
    })
    it("should return status code 400 if data is incorrect // empty description field", async () => {
        const result = await request(server)
            .put(`/blogs/1`)
            .set(auth, basic)
            .send({name: "nostring",
                description: "https://samurai.it-incubator",
                websiteUrl: "",})
            .expect(400)
        expect(result.body).toEqual({errorsMessages : [{message : "the websiteUrl field is not URL", field: "websiteUrl"}]})
    })
})

describe("TESTING OF CREATING POST FOR SPECIFIED BLOG", () => {
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
        app.close()
    });
    it("should return status code 200 BY CREATING POSTS FOR SPECIFIED BLOG", async () => {

        await request(server).delete("/testing/all-data")
        const createdBlog = await request(server).post("/blogs")
            .set(auth, basic)
            .send({
                name : "name",
                description : "string",// maxLength: 500
                websiteUrl : "https://www.youtube.com"
            })
            .expect(201)
        const blogId = createdBlog.body.id
        for(let i = 0; i < 10; i++) {
            await request(server).post(`/posts`)
                .set(auth, basic)
                .send({
                    title: `string${i}`, //    maxLength: 30
                    shortDescription: "string", //maxLength: 100
                    content: "string", // maxLength: 1000
                    blogId: blogId
                })
                .expect(201)
            await new Common().delay(30)
        }

        const allPostsForspecifiedBlogASC = await request(server).get(`/blogs/${blogId}/posts`).query({sortDirection: "asc"})
        expect(allPostsForspecifiedBlogASC.body).toEqual({"items":
                [
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String),"shortDescription": "string", "title": "string0"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string1"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string2"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string3"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string4"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string5"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string6"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string7"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string8"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string9"},

                ], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 10})

        const allPostsForspecifiedBlogDESC = await request(server).get(`/blogs/${blogId}/posts`).query({sortDirection: "desc"})
        expect(allPostsForspecifiedBlogDESC.body).toEqual({"items":
                [
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String),"shortDescription": "string", "title": "string9"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string8"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string7"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string6"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string5"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string4"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string3"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string2"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string1"},
                    {"id": expect.any(String), "blogId": blogId, "blogName": "name", "content": "string", "createdAt": expect.any(String), "shortDescription": "string", "title": "string0"},

                ], "page": 1, "pageSize": 10, "pagesCount": 1, "totalCount": 10})
    }, 30000)
})

describe("TESTING OF CREATING POSTS FOR SPECIFIC BLOG", () => {
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
        app.close()
    });
    it("should return STATRUS CODE 201 and created  POST //Authorization field is correct", async () => {
        await request(server).delete("/testing/all-data").set(auth, basic)
        const createdBlog = await request(server)
            .post("/blogs")
            .set(auth, basic)
            .send({
                name : "string", //maxLength: 15
                description : "string",// maxLength: 500
                websiteUrl : "https://samurai.it-incubator.io/pc" // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
            })

        await request(server)
            .post(`/blogs/${createdBlog.body.id}/posts`)
            .set(auth, basic)
            .send({"content":"new post content","shortDescription":"description","title":"post title"}).expect(201)
    })
})
