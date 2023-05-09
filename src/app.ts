import express from 'express';
import './db/mongoose.js';
import { rutaRouter } from './routers/ruta.js';
import { grupoRouter } from './routers/grupo.js';
import { usuarioRouter } from './routers/usuario.js';
import { retoRouter } from './routers/reto.js';
import { defaultRouter } from './routers/default.js';

export const app = express();
app.use(express.json());
app.use(rutaRouter);
app.use(grupoRouter);
app.use(usuarioRouter);
app.use(retoRouter);
app.use(defaultRouter);