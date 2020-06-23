import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// mock out our NATS client initialiser (jest will instead look for the corresponding file in the __mocks__ folder in the same directory)
jest.mock("../events/nats-wrapper.ts");

let mongo: any;

beforeAll(async () => {
  // set env variables
  process.env.JWT_KEY = "agaewgg3";

  // we use Mongo memory server to run instances of mongodb in memory - allows us to direct access to db and each test suit can have its own db
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // clear mocks
  jest.clearAllMocks();

  // clear data before each test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
