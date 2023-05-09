// sudo /home/usuario/mongodb/bin/mongod --dbpath /home/usuario/mongodb-data/
import express from 'express';
import './db/mongoose.js';
import { rutaRouter } from './routers/ruta.js';
import { defaultRouter } from './routers/default.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(rutaRouter);
app.use(defaultRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

///////////////////


/*
app.post('/notes', (req, res) => {
  const note = new Note(req.body);

  note.save().then((note) => {
    res.send(note);
  }).catch((error) => {
    res.send(error);
  });
});


postRouter.post('/notes', async (req, res) => {
  const note = new Note(req.body);
  try {
  await note.save();
  res.status(201).send(note);
  } catch (error) {
  res.status(400).send(error);
  }
  });

export const postRouter = express.Router();

  /*try {
    await user.save();
    return res.status(201).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }

  // user.save().then((user) => {
  //   res.status(201).send(user);
  // }).catch((error) => {
  //   res.status(500).send(error);
  // });
*/

/*
app.post('/prueba', (req, res) => {
  const ruta = new Ruta(req.body);

  ruta.save().then((ruta) => {
    res.send(ruta);
  }).catch((error) => {
    res.send(error);
  });

  try {
    const ruta = new Ruta(req.body);
    if (ruta.length !== 0) {
      ruta.save();
      res.send(Estudiante);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }

});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
*/