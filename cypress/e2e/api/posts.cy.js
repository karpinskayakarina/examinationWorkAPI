import faker from "faker";

describe("Get all posts", () => {
  it("should return all posts and verify status code and content type", () => {
    cy.request("/posts").then((response) => {
      expect(response.status).to.equal(200);

      expect(response.headers["content-type"]).to.include("application/json");
    });
  });
});

describe("Get only first 10 posts", () => {
  it("should return only first 10 posts and verify status code", () => {
    cy.request("/posts?_limit=10").then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.length).to.equal(10);
    });
  });
});

describe("Get posts with id = 55 and id = 60", () => {
  it("should return posts with id = 55 and id = 60, and verify status code", () => {
    cy.request("/posts?id=55&id=60").then((response) => {
      expect(response.status).to.equal(200);
      const posts = response.body;
      const ids = posts.map((post) => post.id);
      expect(ids).to.include(55);
      expect(ids).to.include(60);
    });
  });
});

describe("Create a post", () => {
  it("should create a post and verify status code", () => {
    const postData = {
      title: "New Post Title",
      body: "New Post Body",
      userId: 1,
    };

    cy.request({
      method: "POST",
      url: "/664/posts",
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });
});

describe("Create post entity", () => {
  it("should create a post entity and verify status code", () => {
    const postData = {
      title: "New Post Title",
      body: "New Post Body",
      userId: 1,
    };

    cy.request({
      method: "POST",
      url: "/posts",
      body: postData,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(201);

      expect(response.headers).to.have.property("location");
      const location = response.headers.location;
      expect(location).to.match(/\/posts\/\d+/);
    });
  });
});

describe("Update non-existing entity", () => {
  it("should return status code 404", () => {
    const updateData = {
      title: "Updated Post Title",
      body: "Updated Post Body",
      userId: 1,
    };

    cy.request({
      method: "PUT",
      url: "/posts/non-existing-id",
      body: updateData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});

describe("Create post entity and update the created entity", () => {
  it("should create a post entity and update it, and verify status code", () => {
    let postId;

    const postData = {
      title: "New Post Title",
      body: "New Post Body",
      userId: 1,
    };

    cy.request({
      method: "POST",
      url: "/posts",
      body: postData,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(201);

      const location = response.headers.location;
      const match = location.match(/\/posts\/(\d+)/);
      if (match) {
        postId = match[1];
      }

      expect(postId).to.not.be.undefined;

      const updateData = {
        title: "Updated Post Title",
        body: "Updated Post Body",
        userId: 1,
      };

      cy.request({
        method: "PUT",
        url: `/posts/${postId}`,
        body: updateData,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((updateResponse) => {
        expect(updateResponse.status).to.equal(200);

        expect(updateResponse.body.title).to.equal(updateData.title);
        expect(updateResponse.body.body).to.equal(updateData.body);
        expect(updateResponse.body.userId).to.equal(updateData.userId);
      });
    });
  });
});

describe("Delete non-existing post entity", () => {
  it("should return status code 404", () => {
    cy.request({
      method: "DELETE",
      url: "/posts/non-existing-id",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});

describe("Create, Update, and Delete post entity", () => {
  let postId;

  it("should create a post entity and verify status code", () => {
    const postData = {
      title: "New Post Title",
      body: "New Post Body",
      userId: 1,
    };

    cy.request({
      method: "POST",
      url: "/posts",
      body: postData,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("id");
      postId = response.body.id;
    });
  });

  it("should update the created post entity and verify status code", () => {
    const updateData = {
      title: "Updated Post Title",
      body: "Updated Post Body",
      userId: 1,
    };

    cy.request({
      method: "PUT",
      url: `/posts/${postId}`,
      body: updateData,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });

  it("should delete the created post entity and verify status code", () => {
    cy.request({
      method: "DELETE",
      url: `/posts/${postId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});

describe("Register a new user", () => {
  let user;

  before(() => {
    user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      age: faker.random.number({ min: 18, max: 100 }),
    };
  });

  it("should register a new user and return JWT access token", () => {
    cy.request({
      method: "POST",
      url: "/register",
      body: user,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("accessToken");
      expect(response.body.user).to.have.property("id");
      expect(response.body.user.email).to.equal(user.email);
      expect(response.body.user.firstname).to.equal(user.firstname);
      expect(response.body.user.lastname).to.equal(user.lastname);
      expect(response.body.user.age).to.equal(user.age);
    });
  });

  it("should log in the registered user and return JWT access token", () => {
    cy.request({
      method: "POST",
      url: "/login",
      body: {
        email: user.email,
        password: user.password,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("accessToken");
      expect(response.body.user).to.have.property("id");
      expect(response.body.user.email).to.equal(user.email);
    });
  });
});
