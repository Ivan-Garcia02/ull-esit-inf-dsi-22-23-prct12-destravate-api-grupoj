import { Document, Schema, model } from 'mongoose';
import { RutaDocumentInterface } from './ruta.js';
import { RetoDocumentInterface } from './reto.js';

/**
 * ID único del usuario.
 * Nombre del usuario.
 * Tipo de actividad: Indicador si la ruta se puede realizar en bicicleta o corriendo.
 * Amigos en la aplicación: Colección de las IDs de los usuarios con los que interacciona.
 * Grupos de amigos: Diferentes colecciones de IDs de usuarios con los que suele realizar rutas.
 * Estadísticas de entrenamiento: Cantidades de km y desnivel total acumulados en la semana, mes y año.
 * Rutas favoritas: IDs de las rutas que el usuario ha realizado con mayor frecuencia.
 * Retos activos: IDs de los retos que el usuario está realizando actualmente.
 * Histórico de rutas: Almacen del historial de rutas realizadas desde que se registraron en el sistema.
 * La información almacenada contiene la información de la fecha y el ID de la ruta realizada
 */
export interface UsuarioDocumentInterface extends Document {
  ID: string,
  nombre: string,
  tipoActividad: 'bicicleta' | 'correr',
  amigos: UsuarioDocumentInterface[],
  grupoAmigos: UsuarioDocumentInterface[][],
  estadisticasEntrenamiento: [number, number, string, number],
  rutasFavoritas: RutaDocumentInterface[],
  retosActivos: RetoDocumentInterface[],
  historicoRutas: [string, RutaDocumentInterface][],
}

const UsuarioSchema = new Schema<UsuarioDocumentInterface>({
  ID: {
    type: String,
    unique: true,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  tipoActividad: {
    type: String,
    trim: true,
    required: true,
    enum: ['bicicleta', 'correr'],
  },
  amigos: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuario'
  },
  grupoAmigos: {
    type: [[Schema.Types.ObjectId]],
    required: true,
    ref: 'Usuario'
  },
  estadisticasEntrenamiento: {
    type: [Number, Number, String, Number],
    required: true,
  },
  rutasFavoritas: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Ruta'
  },
  retosActivos: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Reto'
  },
  historicoRutas: {
    type: [[String, Schema.Types.ObjectId]],
    required: true,
    ref: 'Ruta'
  },
});

export const Usuario = model<UsuarioDocumentInterface>('Usuario', UsuarioSchema);

export type usuarioJSON = {
  ID: string,
  nombre: string,
  tipoActividad: string,
  amigos: string[],
  grupoAmigos: string[][],
  estadisticasEntrenamiento: [number, number, string, number],
  rutasFavoritas: string[],
  retosActivos: string[],
  historicoRutas: [string, string][],
}