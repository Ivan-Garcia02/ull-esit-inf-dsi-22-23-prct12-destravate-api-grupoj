import { Document, Schema, model } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js'
import { RutaDocumentInterface } from './ruta.js';

/**
 * ID único del grupo.
 * Nombre del grupo.
 * Participantes: IDs de los miembros del grupo.
 * Estadísticas de entrenamiento grupal: Cantidad de km y desnivel total acumulados de manera grupal en la semana, mes y año
 * Clasificación de los usuarios: Ranking de los usuarios que más entrenamientos han realizado históricamente dentro del grupo, es decir, ordenar los usuarios por la cantidad de km totales o desnivel total que han acumulado.
 * Rutas favoritas del grupo: Rutas que los usuarios del grupo han realizado con mayor frecuencia en sus salidas conjuntas.
 * Histórico de rutas realizadas por el grupo: Información similar que almacenan los usuarios pero en este caso referente a los grupos. Nótese que un usuario puede realizar rutas con un grupo y/o de manera individual el mismo día. Es decir, a modo de simplificación, asumimos que todos los usuarios de un grupo realizan la actividad cuando se planifica. Aunque, también pueden realizar otras actividades de manera individual.
 */
export interface GrupoDocumentInterface extends Document {
  ID: number,
  nombre: string,
  participantes: UsuarioDocumentInterface[],
  estadisticasEntrenamiento: [number, number, string, number],
  clasificacionUsuarios: UsuarioDocumentInterface[],
  rutasFavoritas: RutaDocumentInterface[],
  historicoRutas: [string, RutaDocumentInterface][],
}

const GrupoSchema = new Schema<GrupoDocumentInterface>({
  ID: {
    type: Number,
    unique: true,
    required: true,
    trim: true,
  },
  nombre: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  participantes: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuario',
  },
  estadisticasEntrenamiento: {
    type: [Number, Number, String, Number],
    required: true,
  },
  clasificacionUsuarios: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuario',
  },
  rutasFavoritas: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Ruta',
  },
  historicoRutas: { //[string, RutaDocumentInterface][]
    type: [[String, Schema.Types.ObjectId]],
    required: true,
    ref: 'Ruta',
  },
});

export const Grupo = model<GrupoDocumentInterface>('Grupo', GrupoSchema);

export type grupoJSON = {
  ID: number,
  nombre: string,
  participantes: UsuarioDocumentInterface[],
  estadisticasEntrenamiento: [number, number, string, number],
  clasificacionUsuarios: [number, string][],
  rutasFavoritas: RutaDocumentInterface[],
  historicoRutas: [string, string][],
}