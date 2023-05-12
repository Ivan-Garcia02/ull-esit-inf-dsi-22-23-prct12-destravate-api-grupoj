import express from 'express';
import { Grupo, GrupoDocumentInterface } from '../models/grupo.js';
import { Usuario, UsuarioDocumentInterface, usuarioJSON } from '../models/usuario.js';
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
    for (let i = 0; i < usuario.amigos.length; i++) { // Actualizamos los amigos
      const user = await Usuario.findOne({ID: amigos[i]});

      if (user && !user.amigos.find(amig => amig.ID === req.body.ID)) { // No esta el amigo ya en el participante
        user.amigos.push(usuario._id);

        await Usuario.findOneAndUpdate(user._id, {amigos: user.amigos}, {
          new: true,
          runValidators: true
        })
      } 
    }

    // grupo amigos
    for (let i = 0; i < usuario.grupoAmigos.length; i++) { // Actualizamos los grupos
      const group = await Grupo.findOne({ID: grupoAmigos[i]});

      if (group && !group.participantes.find(usu => usu.ID === req.body.ID)) { // No esta el amigo ya en el participante
        group.participantes.push(usuario._id);

        await Grupo.findOneAndUpdate(group._id, {participantes: group.participantes}, {
          new: true,
          runValidators: true
        })
      } 
    }

    // retos
    for (let i = 0; i < usuario.retosActivos.length; i++) { // Actualizamos los grupos
      const reto = await Reto.findOne({ID: retosActivos[i]});

      if (reto && !reto.usuariosRealizaron.find(usu => usu.ID === req.body.ID)) { // No esta el amigo ya en los participantes
        await reto.usuariosRealizaron.push(usuario._id);

        await Reto.findOneAndUpdate(reto._id, {usuariosRealizaron: reto.usuariosRealizaron}, {
          new: true,
          runValidators: true
        })
      }
    }

    // historicoRutas
    for (let i = 0; i < historicoRutas.length; i++) {
      const track = await Ruta.findOne({ID: historicoRutas[i][1]});
      if (!track) {
        return res.status(404).send({
          error: "Ruta no encontrada"
        });
      }

      let rutaAux : UsuarioDocumentInterface[] = track.usuariosRealizaron;
      if (!rutaAux.includes(usuario._id)) {
        rutaAux.push(usuario._id);
        track.usuariosRealizaron = rutaAux;
        await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
          new: true,
          runValidators: true
        });
      }
    }

    await usuario.populate({
      path: 'amigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'grupoAmigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'rutasFavoritas',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'retosActivos',
      select: ['ID', 'nombre']
    });

    return res.status(201).send(usuario);
  } catch (error) { 
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
      let historicoRutas: [string, string][] = [];

      await user.populate({
        path: 'amigos',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'grupoAmigos',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'rutasFavoritas',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'retosActivos',
        select: ['ID', 'nombre']
      });

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

      let usuarioJson: usuarioJSON = {ID: user.ID, nombre: user.nombre, tipoActividad: user.tipoActividad, amigos: user.amigos, grupoAmigos: user.grupoAmigos, estadisticasEntrenamiento: user.estadisticasEntrenamiento, rutasFavoritas: user.rutasFavoritas, retosActivos: user.retosActivos, historicoRutas: historicoRutas};
      return res.status(201).send(usuarioJson);
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
      let historicoRutas: [string, string][] = [];

      await user.populate({
        path: 'amigos',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'grupoAmigos',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'rutasFavoritas',
        select: ['ID', 'nombre']
      });
      await user.populate({
        path: 'retosActivos',
        select: ['ID', 'nombre']
      });

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

      let usuarioJson: usuarioJSON = {ID: user.ID, nombre: user.nombre, tipoActividad: user.tipoActividad, amigos: user.amigos, grupoAmigos: user.grupoAmigos, estadisticasEntrenamiento: user.estadisticasEntrenamiento, rutasFavoritas: user.rutasFavoritas, retosActivos: user.retosActivos, historicoRutas: historicoRutas};
      return res.status(201).send(usuarioJson);
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
        error: 'Opciones no permitidas',
      });
    }

    let amigos: string[] = req.body.amigos;
    let grupoAmigos: number[] = req.body.grupoAmigos;
    let rutasFavoritas: string[] = req.body.rutasFavoritas;
    let retosActivos: string[] = req.body.retosActivos;
    let historicoRutas: string[] = req.body.historicoRutas;

    if (req.body.amigos) { // Si se modifican los amigos se borran y se vuelven a añadir
      let colegas : UsuarioDocumentInterface[] = [];

      for (let i = 0; i < usuario.amigos.length; i++) {
        const user = await Usuario.findById(usuario.amigos[i].toString());
        if (!user) {
          return res.status(404).send({
            error: "Usuario no encontrado"
          });
        }

        const indexUser = user.amigos.findIndex((usu) => usu._id.toString() === usuario._id.toString());
        if (indexUser != -1) { 
          user.amigos.splice(indexUser, 1);

          await Usuario.findOneAndUpdate(user._id, {amigos: user.amigos}, {
            new: true,
            runValidators: true
          })
        }
      }

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

    if (req.body.grupoAmigos) { // Si se modifican los grupos se borran y se vuelven a añadir
      let grupoAmis : GrupoDocumentInterface[] = [];

      for (let i = 0; i < usuario.grupoAmigos.length; i++) {
        const grupo = await Grupo.findById(usuario.grupoAmigos[i].toString());
        if (!grupo) {
          return res.status(404).send({
            error: "Grupo no encontrado"
          });
        }

        const indexGrupo = grupo.participantes.findIndex((usu) => usu._id.toString() === usuario._id.toString());
        if (indexGrupo != -1) { 
          grupo.participantes.splice(indexGrupo, 1);

          await Grupo.findOneAndUpdate(grupo._id, {participantes: grupo.participantes}, {
            new: true,
            runValidators: true
          })
        }
      }

      for (let i = 0; i < grupoAmigos.length; i++) {
        const group = await Grupo.findOne({ID: grupoAmigos[i]});
        
        if (!group) {
          return res.status(404).send({
            error: "Group for grupoAmigos not found"
          });
        }
        let participantesGrupo : UsuarioDocumentInterface[] = group.participantes;

        if (!participantesGrupo.includes(usuario._id)) {
          participantesGrupo.push(usuario._id);
          group.participantes = participantesGrupo;

          const grupoAux = await Grupo.findOneAndUpdate(group._id, {participantes: group.participantes}, {
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
        rutasFav.push(track);
      } 
      req.body.rutasFavoritas = rutasFav;
    }

    if (req.body.retosActivos) { // Si se modifican los retos se borran y se vuelven a añadir
      let retosAct : RetoDocumentInterface[] = [];

      for (let i = 0; i < usuario.retosActivos.length; i++) {
        const reto = await Reto.findById(usuario.retosActivos[i].toString());
        if (!reto) {
          return res.status(404).send({
            error: "Reto no encontrado"
          });
        }

        const indexReto = reto.usuariosRealizaron.findIndex((usu) => usu._id.toString() === usuario._id.toString());
        if (indexReto != -1) { 
          reto.usuariosRealizaron.splice(indexReto, 1);

          await Reto.findOneAndUpdate(reto._id, {usuariosRealizaron: reto.usuariosRealizaron}, {
            new: true,
            runValidators: true
          })
        }
      }

      for (let i = 0; i < retosActivos.length; i++) {
        const challenge = await Reto.findOne({ID: retosActivos[i]});
        if (!challenge) {
          return res.status(404).send({
            error: "Challenge for retosActivos not found"
          });
        }
        
        let usuariosReto : UsuarioDocumentInterface[] = challenge.usuariosRealizaron;

        if (!usuariosReto.includes(usuario._id)) {
          usuariosReto.push(usuario._id);
          challenge.usuariosRealizaron = usuariosReto;

          const grupoAux = await Reto.findOneAndUpdate(challenge._id, {usuariosRealizaron: challenge.usuariosRealizaron}, {
            new: true,
            runValidators: true
          });
        } 
        retosAct.push(challenge);
      } 
      req.body.retosActivos = retosAct;
    }

    if (req.body.historicoRutas) { // Si se modifica la historico de ruta se borran y se meten
      let historicoRut : [string, RutaDocumentInterface][] = [];

      for (let i = 0; i < usuario.historicoRutas.length; i++) {
        const track = await Ruta.findById(usuario.historicoRutas[i][1].toString());
        if (!track) {
          return res.status(404).send({
            error: "Ruta no encontrada"
          });
        }

        const indexUsuario = track.usuariosRealizaron.findIndex((usu) => usu._id.toString() === usuario._id.toString());
        if (indexUsuario != -1) { 
          track.usuariosRealizaron.splice(indexUsuario, 1);

          await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
            new: true,
            runValidators: true
          })
        }
      }
      
      for (let i = 0; i < historicoRutas.length; i++) {
        const track = await Ruta.findOne({ID: historicoRutas[i][1]});
        if (!track) {
          return res.status(404).send({
            error: "Ruta no encontrada"
          });
        }
  
        let rutaAux : UsuarioDocumentInterface[] = track.usuariosRealizaron;
        if (!rutaAux.includes(usuario._id)) {
          rutaAux.push(usuario._id);
          track.usuariosRealizaron = rutaAux;     
          await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
            new: true,
            runValidators: true
          });
        }
        historicoRut.push([historicoRutas[i][0], track._id]);
      }

      req.body.historicoRutas = historicoRut;
    }


    const usuarioFinal = await Usuario.findOneAndUpdate (usuario._id, req.body, {
      new: true,
      runValidators: true
    })

    if (usuarioFinal) {
      await usuarioFinal.populate({
        path: 'amigos',
        select: ['ID', 'nombre']
      });
      await usuarioFinal.populate({
        path: 'grupoAmigos',
        select: ['ID', 'nombre']
      });
      await usuarioFinal.populate({
        path: 'rutasFavoritas',
        select: ['ID', 'nombre']
      });
      await usuarioFinal.populate({
        path: 'retosActivos',
        select: ['ID', 'nombre']
      });
      
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
      
      const indexUser = track.usuariosRealizaron.findIndex((usu) => usu.ID === usuario.ID);
      if (indexUser != -1) {
        track.usuariosRealizaron.splice(indexUser, 1);

        await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
          new: true,
          runValidators: true
        })
      }
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
      
      const indexUser = track.usuariosRealizaron.findIndex((usu) => usu.ID === usuario.ID);
      if (indexUser != -1) {
        track.usuariosRealizaron.splice(indexUser, 1);

        await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
          new: true,
          runValidators: true
        })
      }
    }

    await Usuario.findByIdAndDelete(usuario._id);
    
    await usuario.populate({
      path: 'amigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'grupoAmigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'rutasFavoritas',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'retosActivos',
      select: ['ID', 'nombre']
    });
    return res.status(201).send(usuario);
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar un usuario,
 * a través de su nombre
 */
usuarioRouter.delete('/users/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      ID: req.params.id
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
      
      const indexUser = track.usuariosRealizaron.findIndex((usu) => usu.ID === usuario.ID);
      if (indexUser != -1) {
        track.usuariosRealizaron.splice(indexUser, 1);

        await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
          new: true,
          runValidators: true
        })
      }
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
      
      const indexUser = track.usuariosRealizaron.findIndex((usu) => usu.ID === usuario.ID);
      if (indexUser != -1) {
        track.usuariosRealizaron.splice(indexUser, 1);

        await Ruta.findOneAndUpdate(track._id, {usuariosRealizaron: track.usuariosRealizaron}, {
          new: true,
          runValidators: true
        })
      }
    }

    await Usuario.findByIdAndDelete(usuario._id);
    
    await usuario.populate({
      path: 'amigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'grupoAmigos',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'rutasFavoritas',
      select: ['ID', 'nombre']
    });
    await usuario.populate({
      path: 'retosActivos',
      select: ['ID', 'nombre']
    });
    return res.status(201).send(usuario);
  } catch (error) {
    return res.status(500).send(error);
  }
});