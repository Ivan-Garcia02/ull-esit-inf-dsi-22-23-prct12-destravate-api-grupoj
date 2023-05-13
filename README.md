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
2. [Práctica](#práctica)
3. [Conclusiones](#conclusiones)
4. [Referencias](#referencias)

## Resumen
<!-- qué se hace y para que se hace -->
Esta práctica consiste en implementar un API REST haciendo uso del servidor express y de node.js. Además, será necesario hacer uso de las operaciones CRUD de creación, lectura, modificación y borrado. 

## Práctica
<!-- Explicar desarrollo de la prácica -->

1. [Grupo](#grupo)
2. [Reto](#reto)
3. [Ruta](#ruta)
4. [Usuario](#usuario)

### App
Se posee un fichero `app.ts` ubicado en el directorio `/src` de la raíz del proyecto en el que proporcionaremos las distintas posibilidades que un usuario que se comunique mediante express con el sistema puede llevar a cabo, ofreciendo una comunicación indirecta con el servidor de Mongo DB. Para ello se sigue la siguiente sintaxis: 

```
export const app = express();
app.use(express.json());
app.use(rutaRouter);
app.use(grupoRouter);
app.use(usuarioRouter);
app.use(retoRouter);
app.use(defaultRouter);
```

Exportando nuestra `app` que posee las distintas opciones que conectan con cada uno de nuestros ficheros ubicados en `/routers` que iremos explicando con mayor detalle en este informe.

### Index
Se posee un fichero `index.ts` ubicado en el directorio `/src` de la raíz del proyecto que permitirá la comunicación con los recursos que ofrece el programa y el usuario que realice peticiones en `express`. El fichero contiene de manera muy sencilla un puesto de escucha, a la espera de peticiones que se puedan llevar a cabo:

```
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
```

### Grupo

#### Contexto 

Se encuentra en la ruta `/groups` del API, se deberá poder crear, leer, actualizar o borrar un grupo a través de los métodos HTTP necesarios.
Un grupo de usuarios engloba la información de los usuarios que se unen para realizar rutas juntos:

- ID único del grupo.
- Nombre del grupo.
- Participantes: IDs de los miembros del grupo.
- Estadísticas de entrenamiento grupal: Cantidad de km y desnivel total acumulados de manera grupal en la semana, mes y año
- Clasificación de los usuarios: Ranking de los usuarios que más entrenamientos han realizado históricamente dentro del grupo.
- Rutas favoritas del grupo: Rutas que los usuarios del grupo han realizado con mayor frecuencia en sus salidas conjuntas.
- Histórico de rutas realizadas por el grupo: Información similar que almacenan los usuarios pero en este caso referente a los grupos.

#### Models 

En `/src/models/reto.ts` se encuentra la definición del modelo de los Grupos, es decir:
- Una interfaz denominada `GrupoDocumentInterface` que extiende `Document` (un recurso importado del módulo de `mongoose`) donde se establecen los atributos de un grupo.

- Un `schema` de la interfaz `GrupoDocumentInterface`: `Schema<GrupoDocumentInterface>`. Dentro de dicho `schema` se establece que:
  - `ID`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `nombre`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `participantes`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `estadisticasEntrenamiento`: Es obligatorio asignarle un valor. Es una tupla formada por cuatro `number`.
  - `clasificacionUsuarios`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `rutasFavoritas`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `historicoRutas`: Es obligatorio asignarle un valor. Es una tupla de `string` y una referencia a `Ruta`.

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
  - Se verifica que el grupo en cuestión existe, en caso contrario se retorna un status `400`.
  - Se muestra el grupo siguiendo el formato establecido en el `type` denominado `grupoJson` que ya comentamos en models.
  - Si todo termina correctamente se retorna un status `201` con el grupo buscado.

- PATCH: Se puede actualizar datos de un grupo, en concreto, se permite modificar el nombre, los participantes, las estadisticas de entrenamiento, las rutas favoritas y el histórico de rutas, mediante búsqueda de un grupo por el nombre del mismo o por la ID.
  - `participantes`: Se eliminan los antiguos usuarios que formaban parte del grupo, accediendo al atributo `grupoAmigos` de los distintos usuarios. Acto seguido, modificamos en cada uno de los nuevos miembros del grupo en cuestión el atributo `grupoAmigos` para que se incluya el grupo.
  - `rutasFavoritas`: Se verifica que las rutas introducidas existen y se añaden a la lista del grupo.
  - `historicoRutas`: Se verifica que cada una de las rutas introducidas existen y se actualiza el histórico de rutas.

  Empleando `populate` actualizamos los atributos `participantes`, `rutasFavoritas` y `clasificacionUsuarios`.

- DELETE: Se permite borrar un grupo, introduciendo el nombre del mismo o el ID (por URL a la hora de realizar la petición):
  - En primer lugar, se comprueba que el grupo existe.
  - Se verifican que los `participantes` existen y accediendo al atributo `grupoAmigos` de cada uno de los usuarios en cuestión se elimina de la lista al grupo que estamos eliminando.

  Empleando `populate` actualizamos los atributos `participantes`, `rutasFavoritas` y `clasificacionUsuarios`.

### Reto

#### Contexto 
En la ruta `/challenges` del API, se deberá poder crear, leer, actualizar o borrar una reto a través de los métodos HTTP necesarios.

Los retos serán otra entidad dentro del sistema. Esta entidad deberá contener toda la información asociada a objetivos de entrenamientos:

- ID único del reto.

- Nombre del reto.

-Rutas que forman parte del reto.

- Tipo de actividad del reto: bicicleta o correr.

- Km totales a realizar (como la suma de los kms de las rutas que lo engloban).

- Usuarios que están realizando el reto.

#### Models 

En `/src/models/reto.ts` se encuentra la definición del modelo de los Retos, es decir:
- Una interfaz denominada `RetoDocumentInterface` que extiende `Document` (un recurso importado del módulo de `mongoose`) donde se establecen los atributos de un grupo.

- Un `schema` de la interfaz `RetoDocumentInterface`: `Schema<RetoDocumentInterface>`. Dentro de dicho `schema` se establece que:
  - `ID`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `nombre`: Debe poseer un valor único, es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `rutas`: Es obligatorio asignarle un valor. Es una referencia a `Ruta`.
  - `tipoActividad`: Es obligatorio asignarle un valor, los espacios serán suprimidos y su valor es eun enumerado, que podrá tener el valor `bicicleta` o `correr`.
  - `kmTotales`: No es obligatorio asignarle un valor, este es calculado según las rutas que compongan el reto.
  - `usuariosRealizaron`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.

El modelo es exportado, con el `schema` definido, en una instancia denominada `Reto`.

```
export const Reto = model<RetoDocumentInterface>('Reto', RetoSchema);
```

#### Routers

Para trabajar de manera más óptima y eficiente definimos en `/src/routers/reto.ts` las distintas peticiones que son posibles (`export const retoRouter = express.Router()`), es decir:

- POST: Creación de un grupo.
  - `rutas`: Se verifica que las rutas introducidas existen, en caso contrario se retorna un status `404` con un `error: "Track not found"`. Además, calcula los kilometros totales del reto sumando las longitudes de las rutas existentes.
  - `usuariosRealizaron`: Se comprueba que los usuarios introducidos existan, en caso contrario se retorna un status `404` con un `error: "User not found"`.

Empleando `populate` actualizamos los atributos `rutas` y `usuariosRealizaron`.
 
- GET: Se puede obtener los datos de un reto mediante su nombre o mediante su ID, introduciendolo en la URL de la petición que se realiza:
  - Se verifica que el reto en cuestión existe, en caso contrario se retorna un status `400`.
  - Si todo termina correctamente se retorna un status `201` con el reto buscado.

- PATCH: Se puede actualizar datos de un reto, en concreto, se permite modificar el nombre, las rutas, el tipo de actividad y los usuarios que lo realizaron, mediante búsqueda de un reto por el nombre del mismo o por la ID.
  - `rutas`: Se eliminan las antiguas rutas que formaban parte del reto, y se añaden las nuevas rutas.
  - `usuariosRealizaron`: Se eliminan los antiguos usuarios que formaban parte del reto, accediendo al atributo `retosActivos` de los distintos usuarios. Acto seguido, modificamos en cada uno de los nuevos miembros del reto en cuestión el atributo `retosActivos` para que se incluya el reto.

 Empleando `populate` actualizamos los atributos `rutas` y `usuariosRealizaron`.

- DELETE: Se permite borrar un reto, introduciendo el nombre del mismo o el ID (por URL a la hora de realizar la petición):
  - En primer lugar, se comprueba que el reto existe.
  - Se verifican que los `usuariosRealizaron` existen y accediendo al atributo `retosActivos` de cada uno de los usuarios en cuestión se elimina de la lista al reto que estamos eliminando.

  Empleando `populate` actualizamos los atributos `rutas` y `usuariosRealizaron`.

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

#### Contexto 
Se encuentra en la ruta `/users` del API, se deberá poder crear, leer, actualizar o borrar un usuario a través de los métodos HTTP necesarios.
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


#### Models 

En `/src/models/usuario.ts` se encuentra la definición del modelo de los Grupos, es decir:
- Una interfaz denominada `UsuarioDocumentInterface` que extiende `Document` (un recurso importado del módulo de `mongoose`) donde se establecen los atributos de un grupo.

- Un `schema` de la interfaz `UsuarioDocumentInterface`: `Schema<UsuarioDocumentInterface>`. Dentro de dicho `schema` se establece que:
  - `ID`: Debe poseer un valor único, es obligatorio asignarle un valor.
  - `nombre`: Es obligatorio asignarle un valor. Y que los espacios serán suprimidos.
  - `tipoActividad`: Es obligatorio asignarle un valor, los espacios serán suprimidos y su valor es eun enumerado, que podrá tener el valor `bicicleta` o `correr`.
  - `amigos`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `grupoAmigos`: Es obligatorio asignarle un valor. Es una referencia a `Usuario`.
  - `estadisticasEntrenamiento`: Es obligatorio asignarle un valor. Es una tupla formada por cuatro `number`.
  - `rutasFavoritas`: Es obligatorio asignarle un valor. Es una referencia a `Ruta`.
  - `retosActivos`: Es obligatorio asignarle un valor. Es una referencia a `Reto`.
  - `historicoRutas`: Es obligatorio asignarle un valor. Es una tupla de `string` y una referencia a `Ruta`.

El modelo es exportado, con el `schema` definido, en una instancia denominada `Usuario`.

```
export const Usuario = model<UsuarioDocumentInterface>('Usuario', UsuarioSchema);
```

Con el objetivo de mantener visibilizar un formato mucho más entendible se establece un `type` denominado `grupoJSON` en el que tendremos un formato de datos basado principalmente en los nombres e IDs de los distintos elementos:

```
export type usuarioJSON = {
  ID: string,
  nombre: string,
  tipoActividad: string,
  amigos: UsuarioDocumentInterface[],
  grupoAmigos: GrupoDocumentInterface[],
  estadisticasEntrenamiento: [number, number, number, number],
  rutasFavoritas: RutaDocumentInterface[],
  retosActivos: RetoDocumentInterface[],
  historicoRutas: [string, string][],
}
```
#### Routers

Para trabajar de manera más óptima y eficiente definimos en `/src/routers/grupo.ts` las distintas peticiones que son posibles (`export const grupoRouter = express.Router()`), es decir:

- POST: Creación de un usuario.
  - `amigos`: Se verifica que los amigos introducidos existen, en caso contrario se retorna un status `404` con un `error: "User not found"`. Además, se accede al atributo `amigos` de cada uno de los nuevos amigos y se le incluye el usuario en cuestión en el array.
  - `grupoAmigos`: Se verifica que el grupo al que se desea incluir existen. En caso afirmativo, se accede al grupo en cuestión y se le añade el usuario al array de `participantes`.
  - `rutasFavoritas`: Se verifica que la rutas introducidas existen.
  - `retosActivos`: Se verifica que los retos introducidos existen.
  - `historicoRutas`: Se comprueba que las rutas introducidas existan, en caso contrario se retorna un status `404` con un `error: "Track not found"`. Se incluye al usuario en las rutas indicadas en el array de las rutas.

  Empleando `populate` se actualizan los atributos `amigos`, `grupoAmigos`, `rutasFavoritas` y `retosActivos`.

- GET: Se puede obtener los datos de un usuario mediante su nombre o mediante su ID, introduciendola en la URL de la petición que se realiza:
  - Se verifica que el usuario en cuestión existe, en caso contrario se retorna un status `400`.
  - Se muestra el usuario siguiendo el formato establecido en el `type` denominado `usuarioJson` que ya comentamos en models.
  - Si todo termina correctamente se retorna un status `201` con el grupo buscado.

- PATCH: Se puede actualizar datos de un usuario, en concreto, se permite modificar la ID, el nombre, el tipo de actividad, los amigos, el grupo de amigos, las estadísticas de entrenamiento, las rutas favoritas, los retos activos y el histórico de rutas. Todo ello mediante búsqueda de un grupo por el nombre del mismo o por la ID.
  - `amigos`: Se busca cada uno de los amigos actuales del usuario y se les elimina el usuario en cuestión en el atributo array `amigos` para, acto seguido, añadir los datos del usuario en los atributos `amigos` de cada uno de los nuevos amigos del usuario.
  - `grupoAmigos`: Al igual que con `amigos` se busca uno a uno los grupos de amigos actuales en los que se encuentra el usuario y se le borra de los mismos, para luego introducirlo en los nuevos grupos que ha introducido. 
  - `rutasFavoritas`: Simplemente se verifican que las rutas introducidas existen para añadirlas en el usuario, NO se incluye al usuario en las rutas en el atributo de `usuariosRealizaron`. Esto se debe a que se considera que por tener de favorito una ruta no implica que se haya realizado en sí la misma.
  - `retosActivos`: Al igual que en `amigos` y `grupoAmigos` se elimina al usuario de los retos y se le añade a los nuevos que ha introducido. 
  - `historicoRutas`: Se borra al usuario de las distintas rutas en las que estaba y se le añade de las nuevas que ha indicado, en caso de que éstas existan.

  Se emplea `populate` para actualizan los atributos `amigos`, `grupoAmigos`, `rutasFavoritas` y `retosActivos`.

- DELETE: Se permite borrar un usuario, introduciendo el nombre del mismo o el ID (por URL a la hora de realizar la petición):
  - En primer lugar, se comprueba que el usuario existe.
  - Se accede a cada uno de los `amigos`, `grupoAmigos`, `retosActivos` y `rutas` buscando la presencia del usuario en cuestión a eliminar y se borra su presencia de los atributos correspondientes.

  Empleando `populate` se actualizan los atributos `amigos`, `grupoAmigos`, `rutasFavoritas` y `retosActivos`.

## Conclusiones
<!-- propuestas de mejoras, con que me quedé al final -->

## Referencias

[Práctica referenciada](https://ull-esit-inf-dsi-2223.github.io/prct12-destravate-api/).

[MongoDB/MongoDB Atlas](https://www.mongodb.com/atlas/database).

[Mongoose](https://mongoosejs.com/).

[GitHub issues](https://docs.github.com/es/issues/tracking-your-work-with-issues/about-issues).
