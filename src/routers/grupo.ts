import express from 'express';
import { Grupo, grupoJSON } from '../models/grupo.js';
import { Usuario } from '../models/usuario.js';
import { Ruta } from '../models/ruta.js';

export const grupoRouter = express.Router();

/**
 * Crear un grupo
 */
grupoRouter.post('/groups', async (req, res) => {
  let participantesRef: typeof Usuario[] = [];
  let participantes: string[] = req.body.participantes;
  let rutasRef: typeof Ruta[] = [];
  let rutas: string[] = req.body.rutasFavoritas;
  let historicoRutasRef: [string, typeof Ruta][] = [];
  let historicoRutas: string[] = req.body.historicoRutas;
  
  try {
    for (let i = 0; i < participantes.length; i++) {
      const user = await Usuario.findOne({ID: participantes[i]});
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      participantesRef.push(user._id);
    }
    for (let i = 0; i < rutas.length; i++) {
      const track = await Ruta.findOne({ID: rutas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Track not found" 
        });
      }

      rutasRef.push(track._id);
    }
    for (let i = 0; i < historicoRutas.length; i++) {
      const track = await Ruta.findOne({ID: historicoRutas[i][1]});
      if (!track) {
        return res.status(404).send({
          error: "Track for historicoRuta not found" 
        });
      }

      historicoRutasRef.push([historicoRutas[i][0], track._id]);
    }
    let clasificacionUsuariosRef: typeof Usuario[] = participantesRef;

    req.body.participantes = participantesRef;
    req.body.clasificacionUsuarios = clasificacionUsuariosRef;
    req.body.rutasFavoritas = rutasRef;
    req.body.historicoRutas = historicoRutasRef;
    const grupo = new Grupo(req.body);

    await grupo.save();
    return res.status(201).send(grupo);
  } catch (error) { 
    return res.status(400).send(error);
  }
});



/**
 * Obtener un grupo a través del nombre del mismo
 */
grupoRouter.get('/groups', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner nombre del grupo',
    });
  }
  const filter = req.query.nombre?{nombre: req.query.nombre}:{};

  try {
    const grupo = await Grupo.findOne(filter); 
    if (grupo && grupo.participantes !== null) {
      let participantes: string[] =  [];
      let clasificacionUsuarios: string[] =  [];
      let rutas: string[] = [];
      let historicoRutas: [string, string][] = [];

      for (let i = 0; i < grupo.participantes.length; i++) {
        const user = await Usuario.findById(grupo.participantes[i]);
        if (!user) {
          return res.status(404).send({
            error: "User not found"
          });
        }

        participantes.push(user.ID);
      }
      for (let i = 0; i < grupo.clasificacionUsuarios.length; i++) {
        const user = await Usuario.findById(grupo.clasificacionUsuarios[i]);
        if (!user) {
          return res.status(404).send({
            error: "User not found"
          });
        }

        clasificacionUsuarios.push(user.ID);
      }
      for (let i = 0; i < grupo.rutasFavoritas.length; i++) {
        const track = await Ruta.findById(grupo.rutasFavoritas[i]);
        if (!track) {
          return res.status(404).send({
            error: "Track not found" 
          });
        }

        rutas.push(track.nombre);
      }
      for (let i = 0; i < grupo.historicoRutas.length; i++) {
        const track = await Ruta.findById(grupo.historicoRutas[i][1]);
        if (!track) {
          return res.status(404).send({
            error: "Track for historicoRuta not found" 
          });
        }
  
        historicoRutas.push([grupo.historicoRutas[i][0], track.nombre]);
      }

      let grupoJson: grupoJSON = {ID: grupo.ID, nombre: grupo.nombre, participantes: participantes, estadisticasEntrenamiento: grupo.estadisticasEntrenamiento, clasificacionUsuarios: clasificacionUsuarios, rutasFavoritas: rutas, historicoRutas: historicoRutas};
      return res.status(201).send(grupoJson);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Obtener un grupo a través del id,
 * introducido en la URL
 */
grupoRouter.get('/groups/:id', async (req, res) => { // :id
  const filter = req.params.id?{ID: req.params.id}:{};

  try {
    const grupo = await Grupo.findOne(filter); 
    if (grupo && grupo.participantes !== null) {
      let participantes: string[] =  [];
      let clasificacionUsuarios: string[] =  [];
      let rutas: string[] = [];
      let historicoRutas: [string, string][] = [];

      for (let i = 0; i < grupo.participantes.length; i++) {
        const user = await Usuario.findById(grupo.participantes[i]);
        if (!user) {
          return res.status(404).send({
            error: "User not found"
          });
        }

        participantes.push(user.ID);
      }
      for (let i = 0; i < grupo.clasificacionUsuarios.length; i++) {
        const user = await Usuario.findById(grupo.clasificacionUsuarios[i]);
        if (!user) {
          return res.status(404).send({
            error: "User not found"
          });
        }

        clasificacionUsuarios.push(user.ID);
      }
      for (let i = 0; i < grupo.rutasFavoritas.length; i++) {
        const track = await Ruta.findById(grupo.rutasFavoritas[i]);
        if (!track) {
          return res.status(404).send({
            error: "Track not found" 
          });
        }

        rutas.push(track.nombre);
      }
      for (let i = 0; i < grupo.historicoRutas.length; i++) {
        const track = await Ruta.findById(grupo.historicoRutas[i][1]);
        if (!track) {
          return res.status(404).send({
            error: "Track for historicoRuta not found" 
          });
        }
  
        historicoRutas.push([grupo.historicoRutas[i][0], track.nombre]);
      }

      let grupoJson: grupoJSON = {ID: grupo.ID, nombre: grupo.nombre, participantes: participantes, estadisticasEntrenamiento: grupo.estadisticasEntrenamiento, clasificacionUsuarios: clasificacionUsuarios, rutasFavoritas: rutas, historicoRutas: historicoRutas};
      return res.status(201).send(grupoJson);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Actualizar un grupo,
 * modificando cuales quiera de sus valores,
 * a través de su nombre
 */
grupoRouter.patch('/groups', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del grupo',
    });
  }
    
  try {
    const grupo = await Grupo.findOne({
      nombre: req.query.nombre
    });
    if (!grupo) {
      return res.status(404).send({
        error: "Grupo no encontrado"
      });
    }

    const allowedUpdates = ['nombre', 'participantes', 'estadisticasEntrenamiento', 'rutasFavoritas', 'historicoRutas'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Grupo no permitido',
      });
    }

    let participantesRef: typeof Usuario[] = [];
    let participantes: string[] = req.body.participantes;
    let rutasRef: typeof Ruta[] = [];
    let rutas: string[] = req.body.rutasFavoritas;
    let historicoRutasRef: [string, typeof Ruta][] = [];
    let historicoRutas: string[] = req.body.historicoRutas;
    if (req.body.participantes) {
      for (let i = 0; i < participantes.length; i++) {
        const user = await Usuario.findOne({ID: participantes[i]});
        if (!user) {
          return res.status(404).send({
            error: "User not found"
          });
        }
  
        participantesRef.push(user._id);
      }
      req.body.participantes = participantesRef;
    }

    if (req.body.rutasFavoritas) {
      for (let i = 0; i < rutas.length; i++) {
        const track = await Ruta.findOne({ID: rutas[i]});
        if (!track) {
          return res.status(404).send({
            error: "Track not found" 
          });
        }

        rutasRef.push(track._id);
      }
      req.body.rutasFavoritas = rutasRef;
    }

    if (req.body.historicoRutas) {
      for (let i = 0; i < historicoRutas.length; i++) {
        const track = await Ruta.findOne({ID: historicoRutas[i][1]});
        if (!track) {
          return res.status(404).send({
            error: "Track for historicoRuta not found" 
          });
        }
  
        historicoRutasRef.push([historicoRutas[i][0], track._id]);
      }
      req.body.historicoRutas = historicoRutasRef;
    }
    let clasificacionUsuariosRef: typeof Usuario[] = participantesRef;
    req.body.clasificacionUsuarios = clasificacionUsuariosRef;

    const group = await Grupo.findOneAndUpdate(grupo._id, req.body, {
      new: true,
      runValidators: true
    })

    if (group) {
      return res.status(201).send(group);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar un grupo,
 * a través de su nombre
 */
grupoRouter.delete('/groups', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del grupo',
    });
  }
  
  try {
    const grupo = await Grupo.findOne({
      nombre: req.query.nombre
    });
    if (!grupo) {
      return res.status(404).send({
        error: "Grupo no encontrado"
      });
    }

    await Grupo.findByIdAndDelete(grupo._id);
    return res.status(201).send(grupo);
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar un grupo,
 * a través de su ID, introducido en la URL
 */
grupoRouter.delete('/groups/:id', async (req, res) => {
  try {
    const grupo = await Grupo.findOne({
      ID: req.params.id
    });
    if (!grupo) {
      return res.status(404).send({
        error: "Grupo no encontrado"
      });
    }

    await Grupo.findByIdAndDelete(grupo._id);
    return res.status(201).send(grupo);
  } catch (error) {
    return res.status(500).send(error);
  }
}); 