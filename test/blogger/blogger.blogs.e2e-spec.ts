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
    for (let i = 0; i <= 2; i++) {
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

    const countOfBannedUsersBeforeBanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersBeforeBanRes.body.items).toHaveLength(0);


    const banUserDto: BanUserByBloggerDTO = {
      "isBanned": true,
      "banReason": "stringstringstringst",
      blogId
    }

    console.log('start ban user for blog');
    await request(server)
      .put(`/blogger/users/${user1.id}/ban`)
      .auth(accessToken, {type: 'bearer'})
      .send(banUserDto)
      .expect(204)

    const countOfBannedUsersAfterBanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersAfterBanRes.body.items).toHaveLength(1);

    const unbanUserDto: BanUserByBloggerDTO = {
      "isBanned": false,
      "banReason": "stringstringstringst",
      blogId
    }

    await request(server)
      .put(`/blogger/users/${user1.id}/ban`)
      .auth(accessToken, {type: 'bearer'})
      .send(unbanUserDto)
      .expect(204)

    const countOfBannedUsersAfterUnbanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersAfterUnbanRes.body.items).toHaveLength(0);

  }, 10000);
  it("create user, login, create blog, create another user , create posts for specific blog, comment them and get them", async () => {

    await request(server).delete("/testing/all-data");

    const users = [];
    for (let i = 0; i <= 2; i++) {
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

    const [user0, user1] = users;

    const loginRes1 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user0.login,
        password: user0.password
      });

    const loginRes2 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user1.login,
        password: user1.password
      });

    expect(loginRes1.status).toBe(200);
    expect(loginRes1.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken1  = loginRes1.body.accessToken;
    expect(loginRes2.status).toBe(200);
    expect(loginRes2.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken2  = loginRes2.body.accessToken;

    const createBlogDto1: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createCommentDto1: CommentForSpecifiedPostDTO = {
      content : "ldklkdjflnalduhsajklcnzLKkcnx"
    }

    const createBlogDto2: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createdBlogRes1 = await request(server)
      .post(`/blogger/blogs`)
      .auth(loginRes1.body.accessToken, {type: 'bearer'})
      .send(createBlogDto1)

    const createdBlogRes2 = await request(server)
      .post(`/blogger/blogs`)
      .auth(loginRes1.body.accessToken, {type: 'bearer'})
      .send(createBlogDto2)





    expect(createdBlogRes1.status).toBe(201)
    expect(createdBlogRes1.body).toEqual({
        "createdAt": expect.any(String),
         "description": createBlogDto1.description,
         "id": expect.any(String),
         "isMembership": false,
         "name": createBlogDto1.name,
         "websiteUrl": createBlogDto1.websiteUrl,
    })

    const blogId1 = createdBlogRes1.body.id

    expect(createdBlogRes2.status).toBe(201)
    expect(createdBlogRes2.body).toEqual({
      "createdAt": expect.any(String),
      "description": createBlogDto2.description,
      "id": expect.any(String),
      "isMembership": false,
      "name": createBlogDto2.name,
      "websiteUrl": createBlogDto2.websiteUrl,
    })

    const blogId2 = createdBlogRes2.body.id

      // update uncreated blog
      await request(server)
          .put(`/blogger/blogs/2281337`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              name : "another name",
              description: "another string",
              websiteUrl : createBlogDto2.websiteUrl
          }).expect(404)

      // delete uncreated blog
      await request(server)
          .put(`/blogger/blogs/2281337`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              name : "another name",
              description: "another string",
              websiteUrl : createBlogDto2.websiteUrl
          }).expect(404)


      const updatedBlogRes2 = await request(server)
          .put(`/blogger/blogs/${blogId2}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              name : "another name",
              description: "another string",
              websiteUrl : createBlogDto2.websiteUrl
          }).expect(204)

      const  foundBlog = await request(server)
          .get(`/blogger/blogs/${blogId2}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(200)

      console.log(foundBlog.body, " foundBlog2")
      console.log(createdBlogRes1.body, " createdBlogRes1")
      console.log(createdBlogRes2.body, " createdBlogRes2")
      console.log(blogId1, " blogId1")
      console.log(blogId2, " blogId2")
      expect(foundBlog.body).toEqual({
          id : expect.any(String),
          name : "another name",
          description: "another string",
          isMembership: false,
          websiteUrl : createBlogDto2.websiteUrl,
          createdAt : createdBlogRes2.body.createdAt
      })

    const createPostDTO1 : PostForSpecificBlogDTO = {
      title : "title",
      shortDescription : "shortDescription",
      content : "content",
    }

    const createPostDTO2 : PostForSpecificBlogDTO = {
      title : "title",
      shortDescription : "shortDescription",
      content : "content",
    }
    console.log(accessToken2 ," accessToken2");
    for (let i = 0; i < 1; i++) {
      const post = await request(server)
        .post(`/blogger/blogs/${blogId1}/posts`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createPostDTO1)

      expect(post.status).toBe(201)

      const comment = await request(server)
        .post(`/posts/${post.body.id}/comments`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createCommentDto1)

      expect(comment.status).toBe(201)
    }

    for (let i = 0; i < 1; i++) {
      const post = await request(server)
        .post(`/blogger/blogs/${blogId2}/posts`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createPostDTO2)

        await request(server)
            .post(`/blogger/blogs/${blogId2}/posts`)
            .auth(accessToken2, {type: 'bearer'})
            .send(createPostDTO2)
            .expect(403)

      expect(post.status).toBe(201)

      const comment = await request(server)
        .post(`/posts/${post.body.id}/comments`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createCommentDto1)



      expect(comment.status).toBe(201)
    }


    console.log("final request");
    const allCommentsForSpecifiedUser = await request(server)
      .get(`/blogger/blogs/comments`)
      .auth(accessToken1, {type: 'bearer'})
    expect(allCommentsForSpecifiedUser.status).toEqual(200)
    expect(allCommentsForSpecifiedUser.body).toEqual({
           "items":  [
              {
             "commentatorInfo":  {
                 "userId": expect.any(String),
                     "userLogin": "login0",
                   },
             "content": "ldklkdjflnalduhsajklcnzLKkcnx",
                 "createdAt":expect.any(String),
                 "id": expect.any(String),
                 "likesInfo":  {
                 "dislikesCount": 0,
                     "likesCount": 0,
                     "myStatus": "None",
                   },
             "postInfo":  {
                 "blogId": expect.any(String),
                     "blogName": "another name",
                     "id": expect.any(String),
                     "title": "title",
                   },
           },
          {
             "commentatorInfo":  {
                 "userId": expect.any(String),
                     "userLogin": "login0",
                   },
             "content": "ldklkdjflnalduhsajklcnzLKkcnx",
                 "createdAt": expect.any(String),
                 "id": expect.any(String),
                 "likesInfo":  {
                 "dislikesCount": 0,
                     "likesCount": 0,
                     "myStatus": "None",
                   },
             "postInfo":  {
                 "blogId": expect.any(String),
                     "blogName": "string",
                     "id":expect.any(String),
                     "title": "title",
                   },
           },
       ],
       "page": 1,
           "pageSize": 10,
           "pagesCount": 1,
           "totalCount": 2,
         })
  }, 200000);
  it("create user, login, create blog, create another user , create posts for specific blog, comment them and ", async () => {

    await request(server).delete("/testing/all-data");

    const users = [];
    for (let i = 0; i <= 2; i++) {
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

    const [user0, user1] = users;

    const loginRes1 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user0.login,
        password: user0.password
      });

    const loginRes2 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user1.login,
        password: user1.password
      });

    expect(loginRes1.status).toBe(200);
    expect(loginRes1.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken1  = loginRes1.body.accessToken;
    expect(loginRes2.status).toBe(200);
    expect(loginRes2.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken2  = loginRes2.body.accessToken;

      const createBlogDto1: BlogDTO = {
          name : "string",
          description: "stringasdstring",
          websiteUrl : "simsbury65@gmail.com"
      }

      const createBlogDto2: BlogDTO = {
          name : "string",
          description: "stringasdstring",
          websiteUrl : "simsbury65@gmail.com"
      }

      const createdBlogRes1 = await request(server)
          .post(`/blogger/blogs`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send(createBlogDto1)

      const blogId1 = createdBlogRes1.body.id

    const ban = await request(server)
          .put(`/blogger/users/${user1.id}/ban`)
            .auth(accessToken1, {type: 'bearer'})
          .send({
              "isBanned":true,
              "banReason":"length_21-weqweqweqwq",
              "blogId": createdBlogRes1.body.id
          }).expect(204);



      const createdPost = await request(server)
          .post(`/blogger/blogs/${blogId1}/posts`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content",
              "shortDescription":"shortDescription",
              "title":"title",
              "blogId": blogId1
          })
          .expect(201)

      expect(createdPost.body).toEqual({
          id : expect.any(String),
          content:"content",
          blogName: "string",
          createdAt: expect.any(String),
          extendedLikesInfo:  {
               dislikesCount: 0,
              likesCount : 0,
              myStatus: "None",
              newestLikes: [],
                 },
          shortDescription:"shortDescription",
          title:"title",
          blogId: blogId1
      })

      const postId1 = createdPost.body.id

      const updatedPost = await request(server)
          .put(`/blogger/blogs/${blogId1}/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content after update",
              "shortDescription":"shortDescription after update",
              "title":"title updated",
              "blogId": blogId1
          })
          .expect(204)

      await request(server)
          .put(`/blogger/blogs/${blogId1}/posts/${postId1}`)
          .auth(loginRes2.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content after update",
              "shortDescription":"shortDescription after update",
              "title":"title updated",
              "blogId": blogId1
          })
          .expect(403)

      await request(server)
          .put(`/blogger/blogs/2281337/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content after update",
              "shortDescription":"shortDescription after update",
              "title":"title updated",
              "blogId": blogId1
          })
          .expect(404)

      await request(server)
          .put(`/blogger/blogs/${blogId1}/posts/2281337`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content after update",
              "shortDescription":"shortDescription after update",
              "title":"title updated",
              "blogId": blogId1
          })
          .expect(404)

      await request(server)
          .put(`/blogger/blogs/${blogId1}/posts/602afe92-7d97-4395-b1b9-6cf98b351bbe`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .send({
              "content":"content after update",
              "shortDescription":"shortDescription after update",
              "title":"title updated",
              "blogId": blogId1
          })
          .expect(404)

      const foundPost =  await request(server)
          .get(`/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(200)

      expect(foundPost.body).toEqual({
          "blogId": expect.any(String),
          "blogName": "string",
          "content": "content after update",
          "createdAt": expect.any(String),
          "extendedLikesInfo": {
              "dislikesCount": 0,
              "likesCount": 0,
              "myStatus": "None",
              "newestLikes": [],
          },
          "id": expect.any(String),
          "shortDescription": "shortDescription after update",
          "title": "title updated",
      })

      await request(server)
          .delete(`/blogger/blogs/${blogId1}/posts/2281337`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(404)

      await request(server)
          .delete(`/blogger/blogs/${blogId1}/posts/2281337`)
          .auth(loginRes2.body.accessToken, {type: 'bearer'})
          .expect(403)

      await request(server)
          .delete(`/blogger/blogs/2281337/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(404)

      await request(server)
          .delete(`/blogger/blogs/${blogId1}/posts/602afe92-7d97-4395-b1b9-6cf98b351bbe`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(404)

      await request(server)
          .delete(`/blogger/blogs/${blogId1}/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(204)

      await request(server)
          .get(`/posts/${postId1}`)
          .auth(loginRes1.body.accessToken, {type: 'bearer'})
          .expect(404)






  }, 200000);

});