import * as dotenv from "dotenv";
import { initServer } from "./apps";
dotenv.config();
const PORT = 8000;
(async function init() {
  const app = await initServer();

  app.listen(PORT, () =>
    console.log(`Server Has been initialized successfully on Port ${PORT}`)
  );
})();
