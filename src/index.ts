// sudo /home/usuario/mongodb/bin/mongod --dbpath /home/usuario/mongodb-data/
import { app } from './app.js';

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});