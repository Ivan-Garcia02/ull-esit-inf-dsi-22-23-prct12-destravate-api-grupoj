import express from 'express';
import { Grupo, GrupoDocumentInterface } from '../models/grupo.js';
import { Usuario, usuarioJSON, UsuarioDocumentInterface } from '../models/usuario.js';
import { Ruta, RutaDocumentInterface } from '../models/ruta.js';
import { Reto, RetoDocumentInterface } from '../models/reto.js';

export const usuarioRouter = express.Router();

/**
 * Crear un usuario
 */
usuarioRouter.post('/users', async (req, res) => {

  let amigosRef: typeof Usuario[] = [];
  let amigos: string[] = req.body.amigos;

  let grupoAmigosRef: typeof Grupo[] = [];
  let grupoAmigos: string[] = req.body.grupoAmigos;

  let rutasFavoritasRef: typeof Ruta[] = [];
  let rutasFavoritas: string[] = req.body.rutasFavoritas;

  let retosActivosRef: typeof Reto[] = [];
  let retosActivos: string[] = req.body.retosActivos;

  let historicoRutasRef: [string, typeof Ruta][] = [];
  let historicoRutas: string[] = req.body.historicoRutas;
  
  try {
    // amigos
    for (let i = 0; i < amigos.length; i++) {
      const user = await Usuario.findOne({ID: amigos[i]});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      amigosRef.push(user._id);
    }

    // grupoAmigos
    for (let i = 0; i < grupoAmigos.length; i++) {
      const group = await Grupo.findOne({ID: grupoAmigos[i]});
      if (!group) {
        return res.status(404).send({
          error: "User not found" ,
          adicional_information: {ID: grupoAmigos[i]},
        });
      }
      grupoAmigosRef.push(group._id);

    }

    // rutasFavoritas
    for (let i = 0; i < rutasFavoritas.length; i++) {
      const track = await Ruta.findOne({ID: rutasFavoritas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Track for rutasFavoritas not found" 
        });
      }

      rutasFavoritasRef.push(track._id);
    }

    // retosActivos
    for (let i = 0; i < retosActivos.length; i++) {
      const challenge = await Reto.findOne({ID: retosActivos[i]});
      if (!challenge) {
        return res.status(404).send({
          error: "Challenge for retosActivos not found" 
        });
      }
      retosActivosRef.push(challenge._id);
    }

    // historicoRutas
    for (let i = 0; i < historicoRutas.length; i++) {
      const track = await Ruta.findOne({ID: historicoRutas[i][1]});
      if (!track) {
        return res.status(404).send({
          error: "Track for historicoRuta not found" 
        });
      }

      historicoRutasRef.push([historicoRutas[i][0], track._id]);
    }

    req.body.amigos = amigosRef;
    req.body.grupoAmigos = grupoAmigosRef;
    req.body.rutasFavoritas = rutasFavoritasRef;
    req.body.retosActivos = retosActivosRef;
    req.body.historicoRutas = historicoRutasRef;

    const usuario = new Usuario(req.body);
    await usuario.save();

    // Incluimos al usuario en sus amigos, gruposAmigos, rutas, retos,...

    // amigos
    for (let i = 0; i < amigos.length; i++) {
      const user = await Usuario.findOne({ID: amigos[i]});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      let amigosAux : UsuarioDocumentInterface[] = user.amigos;
      amigosAux.push(usuario._id);
      user.amigos = amigosAux;
      const userAux = await Usuario.findOneAndUpdate(user._id, {amigos: user.amigos}, {
        new: true,
        runValidators: true
      });
    }

    // grupoAmigos
    for (let i = 0; i < grupoAmigos.length; i++) {
      const group = await Grupo.findOne({ID: grupoAmigos[i]});
      if (!group) {
        return res.status(404).send({
          error: "Group not found"
        });
      }

      let grupoAux : UsuarioDocumentInterface[] = group.participantes;
      grupoAux.push(usuario._id);
      group.participantes = grupoAux;
      const groupAux = await Grupo.findOneAndUpdate(group._id, {participantes: group.participantes}, {
        new: true,
        runValidators: true
      });
    }


    // rutasFavoritas
    for (let i = 0; i < rutasFavoritas.length; i++) {
      const track = await Ruta.findOne({ID: rutasFavoritas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Track not found"
        });
      }

      let rutaAux : UsuarioDocumentInterface[] = track.usuariosRealizaron;
      rutaAux.push(usuario._id);
      track.usuariosRealizaron = rutaAux;
      const groupAux = await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
        new: true,
        runValidators: true
      });
    }

    // retosActivos
    for (let i = 0; i < retosActivos.length; i++) {
      const challenge = await Reto.findOne({ID: retosActivos[i]});
      if (!challenge) {
        return res.status(404).send({
          error: "Challenge not found"
        });
      }

      let retoAux : UsuarioDocumentInterface[] = challenge.usuariosRealizaron;
      retoAux.push(usuario._id);
      challenge.usuariosRealizaron = retoAux;
      const groupAux = await Reto.findOneAndUpdate(challenge._id, {usuariosRealizaron: challenge.usuariosRealizaron}, {
        new: true,
        runValidators: true
      });
    }

    // historicoRutas
    for (let i = 0; i < historicoRutas.length; i++) {
      const track = await Ruta.findOne({ID: historicoRutas[i][1]});
      if (!track) {
        return res.status(404).send({
          error: "Challenge not found"
        });
      }

      let rutaAux : UsuarioDocumentInterface[] = track.usuariosRealizaron;
      rutaAux.push(usuario._id);
      track.usuariosRealizaron = rutaAux;
      const groupAux = await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
        new: true,
        runValidators: true
      });
    }

    return res.status(201).send(usuario);
  } catch (error) { 
    console.log(error)
    return res.status(400).send(error);
  }
});


/**
 * Obtener un usuario a través del nombre del mismo
 */
usuarioRouter.get('/users', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner nombre del usuario',
    });
  }
  const filter = req.query.nombre?{nombre: req.query.nombre}:{};

  try {
    const user = await Usuario.findOne(filter); 
    if (user) {
      let amigos: string[] = [];
      let grupoAmigos: string [] = [];
      let rutasFavoritas: string[] = [];
      let retosActivos: string[] = [];
      let historicoRutas: [string, string][] = [];

      // amigos
      for (let i = 0; i < user.amigos.length; i++) {
        const userAux = await Usuario.findById(user.amigos[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for amigos not found"
          });
        }

        amigos.push(userAux.ID);
      }

      // grupoAmigos
      for (let i = 0; i < user.grupoAmigos.length; i++) {
        const group = await Grupo.findById(user.grupoAmigos[i]);
        if (!group) {
          return res.status(404).send({
            error: "Grupo for grupoAmigos not found" ,
            adicional_information: {ID: grupoAmigos[i]},
          });
        }
        grupoAmigos.push(group.nombre);
      } 

      // rutasFavoritas
      for (let i = 0; i < user.rutasFavoritas.length; i++) {
        const userAux = await Ruta.findById(user.rutasFavoritas[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for rutasFavoritas not found"
          });
        }
        rutasFavoritas.push(userAux.nombre);
      }

      // retosActivos
      for (let i = 0; i < user.retosActivos.length; i++) {
        const userAux = await Reto.findById(user.retosActivos[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for retosActivos not found"
          });
        }
        retosActivos.push(userAux.nombre);
      }

      // historicoRutas
      for (let i = 0; i < user.historicoRutas.length; i++) {
        const track = await Ruta.findById(user.historicoRutas[i][1]);
        if (!track) {
          return res.status(404).send({
            error: "User for historicoRuta not found" 
          });
        }
        historicoRutas.push([user.historicoRutas[i][0], track.nombre]);
      }

      let usuarioJSON: usuarioJSON = {ID: user.ID, nombre: user.nombre, tipoActividad: user.tipoActividad, amigos: amigos, grupoAmigos: grupoAmigos, estadisticasEntrenamiento: user.estadisticasEntrenamiento, rutasFavoritas: rutasFavoritas, retosActivos: retosActivos, historicoRutas: historicoRutas};
      return res.status(201).send(usuarioJSON);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Obtener un usuario a través del ID del mismo
 */
usuarioRouter.get('/users/:id', async (req, res) => {
  const filter = req.params.id?{ID: req.params.id}:{};

  try {
    const user = await Usuario.findOne(filter); 
    if (user) {
      let amigos: string[] = [];
      let grupoAmigos: string [] = [];
      let rutasFavoritas: string[] = [];
      let retosActivos: string[] = [];
      let historicoRutas: [string, string][] = [];

      // amigos
      for (let i = 0; i < user.amigos.length; i++) {
        const userAux = await Usuario.findById(user.amigos[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for amigos not found"
          });
        }

        amigos.push(userAux.ID);
      }

      // grupoAmigos
      for (let i = 0; i < user.grupoAmigos.length; i++) {
        const group = await Grupo.findById(user.grupoAmigos[i]);
        if (!group) {
          return res.status(404).send({
            error: "Grupo for grupoAmigos not found" ,
            adicional_information: {ID: grupoAmigos[i]},
          });
        }
        grupoAmigos.push(group.nombre);
      } 

      // rutasFavoritas
      for (let i = 0; i < user.rutasFavoritas.length; i++) {
        const userAux = await Ruta.findById(user.rutasFavoritas[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for rutasFavoritas not found"
          });
        }
        rutasFavoritas.push(userAux.nombre);
      }

      // retosActivos
      for (let i = 0; i < user.retosActivos.length; i++) {
        const userAux = await Reto.findById(user.retosActivos[i]);
        if (!userAux) {
          return res.status(404).send({
            error: "User for retosActivos not found"
          });
        }
        retosActivos.push(userAux.nombre);
      }

      // historicoRutas
      for (let i = 0; i < user.historicoRutas.length; i++) {
        const track = await Ruta.findById(user.historicoRutas[i][1]);
        if (!track) {
          return res.status(404).send({
            error: "User for historicoRuta not found" 
          });
        }
        historicoRutas.push([user.historicoRutas[i][0], track.nombre]);
      }

      let usuarioJSON: usuarioJSON = {ID: user.ID, nombre: user.nombre, tipoActividad: user.tipoActividad, amigos: amigos, grupoAmigos: grupoAmigos, estadisticasEntrenamiento: user.estadisticasEntrenamiento, rutasFavoritas: rutasFavoritas, retosActivos: retosActivos, historicoRutas: historicoRutas};
      return res.status(201).send(usuarioJSON);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Actualizar un usuario,
 * modificando cuales quiera de sus valores,
 * a través de su nombre
 */
usuarioRouter.patch('/users', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del usuario',
    });
  }
    
  try {
    const usuario = await Usuario.findOne({
      nombre: req.query.nombre
    });
    if (!usuario) {
      return res.status(404).send({
        error: "Usuario no encontrado"
      });
    }

    const allowedUpdates = ['ID', 'nombre', 'tipoActividad', 'amigos', 'grupoAmigos', 'estadisticasEntrenamiento', 'rutasFavoritas', 'retosActivos', 'historicoRutas'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Usuario no permitido',
      });
    }

    let amigos: string[] = req.body.amigos;
    let grupoAmigos: number[] = req.body.grupoAmigos;
    let rutasFavoritas: string[] = req.body.rutasFavoritas;
    let retosActivos: string[] = req.body.retosActivos;
    let historicoRutas: string[] = req.body.historicoRutas;

    if (req.body.amigos) {
      let colegas : UsuarioDocumentInterface[] = [];

      for (let i = 0; i < amigos.length; i++) {
        const user = await Usuario.findOne({ID: amigos[i]});
        if (!user) {
          return res.status(404).send({
            error: "User for amigos not found"
          });
        }
        
        let amigosAux : UsuarioDocumentInterface[] = user.amigos;

        if (amigosAux.find(amig => amig.ID !== usuario.ID) === undefined) {
          amigosAux.push(usuario._id);
          user.amigos = amigosAux;

          const userAux = await Usuario.findOneAndUpdate(user._id, {amigos: user.amigos}, {
            new: true,
            runValidators: true
          });
        } 
        colegas.push(user);
      } 
      req.body.amigos = colegas;
    }

    if (req.body.grupoAmigos) {
      let grupoAmis : GrupoDocumentInterface[] = [];

      for (let i = 0; i < grupoAmigos.length; i++) {
        const group = await Grupo.findOne({ID: grupoAmigos[i]});
        
        if (!group) {
          return res.status(404).send({
            error: "Group for grupoAmigos not found"
          });
        }
        let participantesGrupo : UsuarioDocumentInterface[] = group.participantes;

        if (participantesGrupo.find(usu => usu.ID !== usuario.ID) === undefined) {
          participantesGrupo.push(usuario._id);
          group.participantes = participantesGrupo;

          const grupoAux = await Usuario.findOneAndUpdate(group._id, {participantes: group.participantes}, {
            new: true,
            runValidators: true
          });
        } 

        grupoAmis.push(group);
      } 
      req.body.grupoAmigos = grupoAmis;
    }

    if (req.body.rutasFavoritas) {
      let rutasFav : RutaDocumentInterface[] = [];

      for (let i = 0; i < rutasFavoritas.length; i++) {
        const track = await Ruta.findOne({ID: rutasFavoritas[i]});
        if (!track) {
          return res.status(404).send({
            error: "Track for rutasFavoritas not found"
          });
        }
        
        let usuariosRuta : UsuarioDocumentInterface[] = track.usuariosRealizaron;

        if (usuariosRuta.find(rut => rut.ID !== usuario.ID) === undefined) {
          usuariosRuta.push(usuario._id);
          track.usuariosRealizaron = usuariosRuta;

          const rutaAux = await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
            new: true,
            runValidators: true
          });
        }
        rutasFav.push(track);
      } 
      req.body.rutasFavoritas = rutasFav;
    }

    if (req.body.retosActivos) {
      let retosAct : RetoDocumentInterface[] = [];

      for (let i = 0; i < retosActivos.length; i++) {
        const challenge = await Reto.findOne({ID: retosActivos[i]});
        if (!challenge) {
          return res.status(404).send({
            error: "Challenge for retosActivos not found"
          });
        }
        
        let usuariosReto : UsuarioDocumentInterface[] = challenge.usuariosRealizaron;

        if (usuariosReto.find(ret => ret.ID !== usuario.ID) === undefined) {
          usuariosReto.push(usuario._id);
          challenge.usuariosRealizaron = usuariosReto;

          const grupoAux = await Reto.findOneAndUpdate(challenge._id, {usuariosRealizaron: challenge.usuariosRealizaron}, {
            new: true,
            runValidators: true
          });
        } 
        retosAct.push(challenge);
      } 
      req.body.rutasFavoritas = retosAct;
    }

    if (req.body.historicoRutas) {
      let historicoRut : [string, RutaDocumentInterface][] = [];
      console.log(`PUNTO INICIAL`);
      for (let i = 0; i < historicoRutas.length; i++) {
        console.log(`PUNTO 1: `, historicoRutas[i][1]);
        const track = await Ruta.findOne({ID: historicoRutas[i][1]});
        if (!track) {
          return res.status(404).send({
            error: "Track for historicoRuta not found"
          });
        }
        /*console.log(`PUNTO 2`);
        let usuariosRuta : UsuarioDocumentInterface[] = track.usuariosRealizaron;
        console.log(`PUNTO 3: `, track.usuariosRealizaron);

        if (usuariosRuta.find(rut => rut.ID !== usuario.ID) === undefined) {
          console.log(`PUNTO 4`);
          usuariosRuta.push(usuario._id);
          track.usuariosRealizaron = usuariosRuta;

          const rutaAux = await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
            new: true,
            runValidators: true
          });
        }
        console.log(`PUNTO 5`);
        console.log(`PUNTO 5.1: `, [historicoRutas[i][0], track._id]);
        historicoRut.push([historicoRutas[i][0], track._id]);*/
      } 
      console.log(`PUNTO 6`);
      req.body.rutasFavoritas = historicoRut;
      console.log(`PUNTO 7`);
    }


    const usuarioFinal = await Usuario.findOneAndUpdate (usuario._id, req.body, {
      new: true,
      runValidators: true
    })

    if (usuarioFinal) {
      return res.status(201).send(usuarioFinal);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar un usuario,
 * a través de su nombre
 */
usuarioRouter.delete('/users', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del usuario',
    });
  }
  
  try {
    const usuario = await Usuario.findOne({
      nombre: req.query.nombre
    });
    if (!usuario) {
      return res.status(404).send({
        error: "User no found"
      });
    }

    // amigos
    for (let i = 0; i < usuario.amigos.length; i++) {
      const user = await Usuario.findById(usuario.amigos[i]);
      if (!user) {
        return res.status(404).send({
          error: "User for amigos no found" 
        });
      }
      
      const indexUser = user.amigos.findIndex(amig => {amig.ID === usuario.ID});
      user.amigos.splice(indexUser, 1);

      await Usuario.findOneAndUpdate(user._id, {amigos: user.amigos}, {
        new: true,
        runValidators: true
      })
    }

    // grupoAmigos
    for (let i = 0; i < usuario.grupoAmigos.length; i++) {
      const group = await Grupo.findById(usuario.grupoAmigos[i]);
      if (!group) {
        return res.status(404).send({
          error: "Group for grupoAmigos no found" 
        });
      }
      
      const indexUser = group.participantes.findIndex(usu => {usu.ID === usuario.ID});
      group.participantes.splice(indexUser, 1);

      await Grupo.findOneAndUpdate(group._id, {participantes: group.participantes}, {
        new: true,
        runValidators: true
      })
    }

    // rutasFavoritas
    for (let i = 0; i < usuario.rutasFavoritas.length; i++) {
      const track = await Ruta.findById(usuario.rutasFavoritas[i]);
      if (!track) {
        return res.status(404).send({
          error: "Tracks for rutasFavoritas no found" 
        });
      }
      
      const indexUser = track.usuariosRealizaron.findIndex(usu => {usu.ID === usuario.ID});
      track.usuariosRealizaron.splice(indexUser, 1);

      await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
        new: true,
        runValidators: true
      })
    }

    // retosActivos
    for (let i = 0; i < usuario.retosActivos.length; i++) {
      const challenge = await Reto.findById(usuario.retosActivos[i]);
      if (!challenge) {
        return res.status(404).send({
          error: "Challenge for retosActivos no found" 
        });
      }
      
      const indexUser = challenge.usuariosRealizaron.findIndex(usu => {usu.ID === usuario.ID});
      challenge.usuariosRealizaron.splice(indexUser, 1);

      await Reto.findOneAndUpdate(challenge._id, {usuariosRealizaron: challenge.usuariosRealizaron}, {
        new: true,
        runValidators: true
      })
    }


    // historicoRutas
    for (let i = 0; i < usuario.historicoRutas.length; i++) {
      const track = await Ruta.findById(usuario.historicoRutas[i][1]);
      if (!track) {
        return res.status(404).send({
          error: "Track for retosActivos no found" 
        });
      }
      
      const indexUser = track.usuariosRealizaron.findIndex(usu => {usu.ID === usuario.ID});
      track.usuariosRealizaron.splice(indexUser, 1);

      await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
        new: true,
        runValidators: true
      })
    }

    await Usuario.findByIdAndDelete(usuario._id);
    return res.status(201).send(usuario);
  } catch (error) {
    return res.status(500).send(error);
  }
});
