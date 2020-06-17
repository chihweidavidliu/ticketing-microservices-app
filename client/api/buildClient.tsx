import axios from "axios";
import { NextPageContext } from "next";

// returns an axios instance preconfigured to our needs depending on whether the request is being made in the browser / in the server
// e.g. when calling getInitialProps any axios requests that are called server side will need to:
// 1. use the cross namespace domain address to reach out to our load balancer from within a container
// 2. pass the original page request headers (esp host name and cookies) to the requests being made on the server

export default ({ req }: NextPageContext) => {
  if (typeof window === "undefined") {
    // we are on the server
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local", // use the cross namespace address for the load balancer
      headers: req?.headers, // pass on the initial page request headers (so that it passes the host name and cookies etc.)
    });
  } else {
    // we are on the browser
    return axios.create({ baseURL: "/" });
  }
};
