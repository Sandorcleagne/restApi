import app from "./app";
import { config } from "./config/config";
import { connectDB } from "./db";
const startServer = () => {
  const port = config.port || 8080;
  connectDB()
    .then(() =>
      app.listen(port, () => {
        console.log(`http://localhost:${port}`);
      })
    )
    .catch((err): any => {
      console.log("Mongodb connection failed", err);
    });
};

startServer();
