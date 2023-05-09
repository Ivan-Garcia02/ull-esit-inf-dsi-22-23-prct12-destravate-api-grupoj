import { Document, Schema, model } from 'mongoose';

//type Coordenada = [number, number, number, 'N' | 'S' | 'E' | 'O'];


/*interface Coordenada extends Document {
  coordenada1: number,
  coordenada2: number,
  coordenada3: number,
  orientacion: 'N' | 'S' | 'E' | 'O'
}*/

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
interface RutaDocumentInterface extends Document {
  ID: number,
  nombre: string,
  geolocalizacionInicio: string /*Coordenada*/,
  geolocalizacionFinal: string /*Coordenada*/,
  longitud: number,
  desnivel: number,
  usuariosRealizaron: string[],
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
  },
  geolocalizacionInicio: {
    type: String,
    required: true,
    trim: true,
  },
  geolocalizacionFinal: {
    type: String,
    required: true,
    trim: true,
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
    type: [String],
    required: true,
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