import express from 'express';
import { Reto } from '../models/reto.js';

export const retoRouter = express.Router();

/**
 * Crear una reto
 */
retoRouter.post('/challenges', async (req, res) => {
  const reto = new Reto(req.body);

  try {
    await reto.save();
    res.status(201).send(reto);
  } catch (error) { 
    res.status(400).send(error);
  }
});