import nats, { Stan } from "node-nats-streaming";

// This wrapper class will allow us to imitate mongoose' setup functionality
// when we import mongoose we get back an instance of a Mongoose class - so when we connect to the db in the index.ts any subsequent
// imports in other files will get back that connected instance
// node-nats-streaming doesn't have this feature by default - we instantiate the client in index.ts but we somehow need to make the client available to other files
// this opens us up to cyclical dependencies

class NatsWrapper {
  private _client?: Stan;

  // a getter is a function that is called like a class property  - useful when you need to run some logic before returning some data
  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    // allow use of promises
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });

      this.client.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
