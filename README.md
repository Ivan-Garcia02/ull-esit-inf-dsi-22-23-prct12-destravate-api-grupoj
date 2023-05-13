# Práctica 12 - Destravate: API Node/Express

<p align="center">
  <a href="https://coveralls.io/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj?branch=main">
    <img alt="Coverage Status" src="https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj/badge.svg?branch=main">
  </a>
  <a href="https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj/actions/workflows/node.js.yml">
    <img alt="Tests" src="https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj/actions/workflows/node.js.yml/badge.svg">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=ULL-ESIT-INF-DSI-2223_ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj">
    <img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=ULL-ESIT-INF-DSI-2223_ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoj&metric=alert_status">
  </a>
</p>

## Índice
1. [Resumen](#resumen)
2. [Coveralls](#coveralls)
3. [Práctica](#práctica)
4. [Conclusiones](#conclusiones)
5. [Referencias](#referencias)

## Resumen
<!-- qué se hace y para que se hace -->
Esta práctica consiste en implementar un API REST haciendo uso del servidor express y de node.js. Además, será necesario hacer uso de las operaciones CRUD de creación, lectura, modificación y borrado. 

## Coveralls

## Práctica
<!-- Explicar desarrollo de la prácica -->

1. [Grupo](#grupo)
2. [Reto](#reto)
3. [Ruta](#ruta)
4. [Usuario](#usuario)

### Grupo

#### Contexto 

Se encuentra en la ruta `/groups` del API, se deberá poder crear, leer, actualizar o borrar una grupo a través de los métodos HTTP necesarios.
Un grupo de usuarios engloba la información de los usuarios que se unen para realizar rutas juntos:

- ID único del grupo.
- Nombre del grupo.
- Participantes: IDs de los miembros del grupo.
- Estadísticas de entrenamiento grupal: Cantidad de km y desnivel total acumulados de manera grupal en la semana, mes y año
- Clasificación de los usuarios: Ranking de los usuarios que más entrenamientos han realizado históricamente dentro del grupo.
- Rutas favoritas del grupo: Rutas que los usuarios del grupo han realizado con mayor frecuencia en sus salidas conjuntas.
- Histórico de rutas realizadas por el grupo: Información similar que almacenan los usuarios pero en este caso referente a los grupos.

#### Models 

En `/src/models/grupo.ts` se encuentra la definición del modelo de los Grupos, es decir:
- Una interfaz denominada `GrupoDocumentInterface` que extiende `Document` (un recurso importado del módulo de `mongoose`) donde se establecen los atributos de un grupo.

- Un `schema` de la interfaz `GrupoDocumentInterface`: `Schema<GrupoDocumentInterface>`. Dentro de dicho `schema` se establece que:
  - `ID`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `nombre`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `participantes`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `estadisticasEntrenamiento`: Es obligatorio asignarle un valor. Es una tupla formada por cuatro `number`.
  - `clasificacionUsuarios`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `rutasFavoritas`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `historicoRutas`: Es obligatorio asignarle un valor. Es una referencia a `Ruta`.

El modelo es exportado, con el `schema` definido, en una instancia denominada `Grupo`.

```
export const Grupo = model<GrupoDocumentInterface>('Grupo', GrupoSchema);
```

Con el objetivo de mantener visibilizar un formato mucho más entendible se establece un `type` denominado `grupoJSON` en el que tendremos un formato de datos basado principalmente en los nombres e IDs de los distintos elementos:

```
export type grupoJSON = {
  ID: number,
  nombre: string,
  participantes: UsuarioDocumentInterface[],
  estadisticasEntrenamiento: [number, number, number, number],
  clasificacionUsuarios: [number, string][],
  rutasFavoritas: RutaDocumentInterface[],
  historicoRutas: [string, string][],
}
```
#### Routers

Para trabajar de manera más óptima y eficiente definimos en `/src/routers/grupo.ts` las distintas peticiones que son posibles (`export const grupoRouter = express.Router()`), es decir:

- POST: Creación de un grupo.
  - `participantes`: Se verifica que los participantes introducidos existen, en caso contrario se retorna un status `404` con un `error: "User not found"`. Además, se accede al atributo `grupoAmigos` de cada uno de los integrantes del grupo y se le incluye el grupo en cuestión en el array.
  - `estadisticasEntrenamiento`: Al ser un grupo de nueva creación se presupone que no hay km y desnivel total acumulados de manera grupal en la semana, mes y año.
  - `clasificacionUsuarios`: Se calculan los kilometros totales de los usuarios que formarán parte del grupo para después ordenar.
  - `rutasFavoritas`: Se comprueba que las rutas introducidas existan, en caso contrario se retorna un status `404` con un `error: "Track not found"`.
  - `historicoRutas`: Se comprueba que las rutas introducidas existan, en caso contrario se retorna un status `404` con un `error: "Track not found"`.

  Se ordena el ranking de los usuarios según los participantes.

- GET: Se puede obtener los datos de un grupo mediante su nombre o mediante su ID, introduciendola en la URL de la petición que se realiza:








### Reto
Los retos serán otra entidad dentro del sistema. Esta entidad deberá contener toda la información asociada a objetivos de entrenamientos:

- ID único del reto.

- Nombre del reto.

-Rutas que forman parte del reto.

- Tipo de actividad del reto: bicicleta o correr.

- Km totales a realizar (como la suma de los kms de las rutas que lo engloban).

- Usuarios que están realizando el reto.


### Ruta
Para cada ruta incluida dentro del sistema, se debe almacenar la información siguiente:

- ID único de la ruta.

- Nombre de la ruta.

- Geolocalización del inicio (coordenadas).

- Geolocalización del final de la ruta (coordenadas).

- Longitud de la ruta en kilómetros.

- Desnivel medio de la ruta.

- Usuarios que han realizado la ruta (IDs).

- Tipo de actividad: Indicador si la ruta se puede realizar en bicicleta o corriendo.

- Calificación media de la ruta.


### Usuario
Dentro del sistema, necesitamos la siguiente información de los usuarios:

- ID único del usuario (puede ser un username creado por el usuario en el registro o un valor generado automáticamente por el sistema).

- Nombre del usuario.

- Actividades que realiza: Correr o bicicleta.

- Amigos en la aplicación: Colleción de IDs de usuarios con los que interacciona.

- Grupos de amigos: Diferentes colecciones de IDs de usuarios con los que suele realizar rutas.

- Estadísticas de entrenamiento: Cantidad de km y desnivel total acumulados en la semana, mes y año.

- Rutas favoritas: IDs de las rutas que el usuario ha realizado con mayor frecuencia.

- Retos activos: IDs de los retos que el usuario está realizando actualmente.

- Histórico de rutas: Los usuarios deben almacenar el historial de rutas realizadas desde que se registraron en el sistema. 


## Conclusiones
<!-- propuestas de mejoras, con que me quedé al final -->

## Referencias

[Práctica referenciada](https://ull-esit-inf-dsi-2223.github.io/prct12-destravate-api/).

[MongoDB/MongoDB Atlas](https://www.mongodb.com/atlas/database).

[Mongoose](https://mongoosejs.com/).

[GitHub issues](https://docs.github.com/es/issues/tracking-your-work-with-issues/about-issues).