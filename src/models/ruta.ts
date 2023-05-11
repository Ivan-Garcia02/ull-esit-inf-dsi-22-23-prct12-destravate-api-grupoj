import { Document, Schema, model } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';

/**
 * ID único de la ruta.
 * Nombre de la ruta.
 * Geolocalización del inicio (coordenadas).
 * Geolocalización del final de la ruta (coordenadas).
 * Longitud de la ruta en kilómetros.
 * Desnivel medio de la ruta.
 * Usuarios que han realizado la ruta (IDs).
 * Tipo de actividad: Indicador si la ruta se puede realizar en bicicleta o corriendo.
 * Calificación media de la ruta.
 */
export interface RutaDocumentInterface extends Document {
  ID: number,
  nombre: string,
  geolocalizacionInicio: [number, number],
  geolocalizacionFinal: [number, number],
  longitud: number,
  desnivel: number,
  usuariosRealizaron: UsuarioDocumentInterface[],
  tipoActividad: 'bicicleta' | 'correr',
  calificacion: number
}

const RutaSchema = new Schema<RutaDocumentInterface>({
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
  geolocalizacionInicio: {
    type: [Number, Number],
    required: true,
  },
  geolocalizacionFinal: {
    type: [Number, Number],
    required: true,
  },
  longitud: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('La longitud no puede ser negativa');
      }
    },
  },
  desnivel: {
    type: Number,
    required: true,
  },
  usuariosRealizaron: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuario',
  },
  tipoActividad: {
    type: String,
    trim: true,
    enum: ['bicicleta', 'correr'],
  },
  calificacion: {
    type: Number,
    required: true,
  },
});

export const Ruta = model<RutaDocumentInterface>('Ruta', RutaSchema);

export type rutaJSON = {
  ID: number,
  nombre: string,
  geolocalizacionInicio: [number, number],
  geolocalizacionFinal: [number, number],
  longitud: number,
  desnivel: number,
  usuariosRealizaron: string[],
  tipoActividad: 'bicicleta' | 'correr',
  calificacion: number
}