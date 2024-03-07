import { initServer } from "./apps";
const PORT = 8000;
(async function init() {
  const app = await initServer();

  app.listen(PORT, () =>
    console.log(`Server Has been initialized successfully on Port ${PORT}`)
  );
})();
