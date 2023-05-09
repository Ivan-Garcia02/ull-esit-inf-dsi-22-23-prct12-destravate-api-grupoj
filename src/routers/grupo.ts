import express from 'express';
import { Grupo } from '../models/grupo.js';
import { Usuario } from '../models/usuario.js';
import { Ruta } from '../models/ruta.js';

export const grupoRouter = express.Router();

/**
 * Crear un grupo
 */
grupoRouter.post('/groups', async (req, res) => {
  //const grupo = new Grupo(req.body);
  let participantesRef: typeof Usuario[] = [];
  let participantes: string[] = req.body.participantes;
  let rutasRef: typeof Ruta[] = [];
  let rutas: string[] = req.body.rutasFavoritas;
  
  try {
    /*await participantes.forEach(usuario => {
      console.log(usuario);
      const user = Usuario.findOne({ID: usuario});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      //participantesRef.push(user.);
      console.log("hola");
      console.log(participantesRef);
    });*/
    for (let i = 0; i < participantes.length; i++) {
      const user = await Usuario.findOne({ID: participantes[i]});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      participantesRef.push(user._id);
      console.log("hola");
      console.log(participantesRef);
    }
    for (let i = 0; i < rutas.length; i++) {
      const track = await Ruta.findOne({ID: rutas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Track not found" 
        });
      }

      rutasRef.push(track._id);
      console.log("hola");
      console.log(rutas, rutasRef);
    }

    console.log(req.body.participantes);
    req.body.participantes = participantesRef;
    req.body.rutasFavoritas = rutasRef;
    const grupo = new Grupo(req.body);

    await grupo.save();
    return res.status(201).send(grupo);
  } catch (error) { 
    console.log(error)
    return res.status(400).send(error);
  }
});