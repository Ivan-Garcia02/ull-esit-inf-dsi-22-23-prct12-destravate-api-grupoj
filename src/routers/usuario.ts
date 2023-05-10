import express from 'express';
import { Grupo } from '../models/grupo.js';
import { Usuario } from '../models/usuario.js';
import { Ruta } from '../models/ruta.js';
import { Reto } from '../models/reto.js';

export const usuarioRouter = express.Router();

/**
 * Crear un usuario
 */
usuarioRouter.post('/users', async (req, res) => {

  let amigosRef: typeof Usuario[] = [];
  let amigos: string[] = req.body.amigos;

  let grupoAmigosRef: typeof Usuario[][] = [];
  let grupoAmigos: string[][] = req.body.grupoAmigos;

  let rutasFavoritasRef: typeof Ruta[] = [];
  let rutasFavoritas: string[] = req.body.rutasFavoritas;

  let retosActivosRef: typeof Reto[] = [];
  let retosActivos: string[] = req.body.retosActivos;

  let historicoRutasRef: [string, typeof Ruta][] = [];
  let historicoRutas: string[] = req.body.historicoRutas;
  
  try {
    // amigos
    for (let i = 0; i < amigos.length; i++) {
      const user = await Usuario.findOne({ID: amigos[i]});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }
      amigosRef.push(user._id);
    }

    // grupoAmigos
    for (let i = 0; i < grupoAmigos.length; i++) {
      let aux:  typeof Usuario[] = []
      for (let j = 0; j < grupoAmigos[i].length; j++) {
        const user = await Usuario.findOne({ID: grupoAmigos[i][j]});
        if (!user) {
          return res.status(404).send({
            error: "User not found" ,
            adicional_information: {ID: grupoAmigos[i][j]},
          });
        }
        aux.push(user._id);
      }
      grupoAmigosRef.push(aux);
    }

    // rutasFavoritas
    for (let i = 0; i < rutasFavoritas.length; i++) {
      const track = await Ruta.findOne({ID: rutasFavoritas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Track for rutasFavoritas not found" 
        });
      }

      rutasFavoritasRef.push(track._id);
    }

    // retosActivos
    for (let i = 0; i < retosActivos.length; i++) {
      const challenge = await Ruta.findOne({ID: retosActivos[i]});
      if (!challenge) {
        return res.status(404).send({
          error: "Challenge for retosActivos not found" 
        });
      }
      retosActivosRef.push(challenge._id);
    }

    // historicoRutas
    for (let i = 0; i < historicoRutas.length; i++) {
      const track = await Ruta.findOne({ID: historicoRutas[i][1]});
      if (!track) {
        return res.status(404).send({
          error: "Track for historicoRuta not found" 
        });
      }

      historicoRutasRef.push([historicoRutas[i][0], track._id]);
    }

    req.body.amigos = amigosRef;
    req.body.grupoAmigos = grupoAmigosRef;
    req.body.rutasFavoritas = rutasFavoritasRef;
    req.body.retosActivos = retosActivosRef;
    req.body.historicoRutas = historicoRutasRef;

    const usuario = new Usuario(req.body);
    await usuario.save();
    return res.status(201).send(usuario);
  } catch (error) { 
    console.log(error)
    return res.status(400).send(error);
  }
});