// Every project should have an helathCheck route to tell if the server is running or not
// Whenever we deploy our project at the big service like AWS, AZURE etc... then this is the route tell the aws that one server is running down so up the another server.
import { ApiResponse } from "../utils/api-response.js";

const healthCheck = (req, res) => {
  const timestamp = new Date().toLocaleTimeString();
  res
    .status(200)
    .json(
      new ApiResponse(200, {
        message: "Server healthy and running",
        timestamp,
      }),
    );
};

export { healthCheck };
