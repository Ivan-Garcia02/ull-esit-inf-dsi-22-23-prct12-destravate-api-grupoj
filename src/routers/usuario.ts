import express from 'express';
import { Usuario } from '../models/usuario.js';

export const usuarioRouter = express.Router();

/**
 * Crear una ruta
 */
usuarioRouter.post('/users', async (req, res) => {
  const usuario = new Usuario(req.body);

  try {
    await usuario.save();
    res.status(201).send(usuario);
  } catch (error) { 
    res.status(400).send(error);
  }
});
