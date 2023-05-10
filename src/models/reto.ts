import { Document, Schema, model } from 'mongoose';
import { RutaDocumentInterface } from './ruta.js';
import { UsuarioDocumentInterface } from './usuario.js';

/**
 * ID único del reto,
 * Nombre del reto,
 * Rutas que forman parte del reto,
 * Tipo de actividad del reto: bicicleta o correr,
 * Km totales a realizar (como la suma de los kms de las rutas que lo engloban),
 * Usuarios que están realizando el reto
 */
export interface RetoDocumentInterface extends Document {
  ID: number,
  nombre: string,
  rutas: RutaDocumentInterface[],
  tipoActividad: 'bicicleta' | 'correr',
  kmTotales: number,
  usuariosRealizaron: UsuarioDocumentInterface[]
}

const RetoSchema = new Schema<RetoDocumentInterface>({ 
  ID: {
    type: Number,
    unique: true,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    uniqued: true,
  },
  rutas: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Ruta'
  },
  tipoActividad: {
    type: String,
    trim: true,
    enum: ['bicicleta', 'correr'],
  },
  kmTotales: {
    type: Number,
    required: true,
  },
  usuariosRealizaron: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuario'
  },
});

export const Reto = model<RetoDocumentInterface>('Reto', RetoSchema);