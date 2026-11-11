
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_jwt_secret_for_automated_testing";

  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
}, 300000);

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);
