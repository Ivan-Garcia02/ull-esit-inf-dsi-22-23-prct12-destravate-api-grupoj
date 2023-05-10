import express from 'express';
import { Reto } from '../models/reto.js';
import { Usuario } from '../models/usuario.js';
import { Ruta } from '../models/ruta.js';

export const retoRouter = express.Router();

/**
 * Crear una reto
 */
retoRouter.post('/challenges', async (req, res) => {
  let rutasRef: typeof Ruta[] = [];
  let rutas: string[] = req.body.rutas;
  let usuariosRealizaronRef: typeof Usuario[] = [];
  let usuariosRealizaron: string[] = req.body.usuariosRealizaron;

  try {
    for (let i = 0; i < rutas.length; i++) {
      const track = await Ruta.findOne({ID: rutas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Ruta no encontrada" 
        });
      }
      rutasRef.push(track._id);
      //console.log("hola");
      console.log(rutas, rutasRef);
    }
    for (let i = 0; i < usuariosRealizaron.length; i++) {
      const track = await Usuario.findOne({ID: usuariosRealizaron[i]});
      if (!track) {
        return res.status(404).send({
          error: "Usuario no encontrado" 
        });
      }
      usuariosRealizaronRef.push(track._id);
      //console.log("hola");
      console.log(usuariosRealizaron, usuariosRealizaronRef);
    }
    const reto = new Reto(req.body);

    await reto.save();
    return res.status(201).send(reto);
  } catch (error) { 
    console.log(error)
    return res.status(400).send(error);
  }
});