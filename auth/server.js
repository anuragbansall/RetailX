import app from "./src/app.js";
import { connectDB } from "./src/db/index.js";
import { config } from "./src/config/index.js";

(async () => {
  await connectDB();

  app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
  });
})();
