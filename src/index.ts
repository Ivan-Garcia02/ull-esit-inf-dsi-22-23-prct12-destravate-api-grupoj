/**
 * Funcion simple Hola Mundo
 * @param cadena Cadena de Texto
 * @returns cadena
 */
export function holaMundo(cadena: string) : string {
  return cadena;
}

// sudo /home/usuario/mongodb/bin/mongod --dbpath /home/usuario/mongodb-data/
import express from 'express';
import './db/mongoose.js';
import { Note } from './models/note.js';
import { Ruta } from './models/ruta.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/notes', (req, res) => {
  const note = new Note(req.body);

  note.save().then((note) => {
    res.send(note);
  }).catch((error) => {
    res.send(error);
  });
});

app.post('/prueba', (req, res) => {
  const ruta = new Ruta(req.body);

  ruta.save().then((ruta) => {
    res.send(ruta);
  }).catch((error) => {
    res.send(error);
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});