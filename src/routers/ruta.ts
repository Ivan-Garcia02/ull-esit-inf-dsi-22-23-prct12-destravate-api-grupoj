import express from 'express';
import { Ruta } from '../models/ruta.js';
import { Usuario } from '../models/usuario.js';
import { Grupo } from '../models/grupo.js';
import { Reto } from '../models/reto.js';

export const rutaRouter = express.Router();

/**
 * Crear una ruta
 */
rutaRouter.post('/tracks', async (req, res) => {
  try {
    const ruta = new Ruta(req.body);

    await ruta.save();
    return res.status(201).send(ruta);
  } catch (error) { 
    return res.status(400).send(error);
  }
});


/**
 * Obtener una ruta a través del nombre de la misma
 */
rutaRouter.get('/tracks', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner nombre de la ruta',
    });
  }
  const filter = req.query.nombre?{nombre: req.query.nombre}:{};

  try {
    const ruta = await Ruta.findOne(filter); 
    if (ruta) {
      await ruta.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
      
      return res.status(201).send(ruta);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Obtener una ruta a través del la id,
 * introducida en la URL
 */
rutaRouter.get('/tracks/:id', async (req, res) => { // :id
  const filter = req.params.id?{ID: req.params.id}:{};

  try {
    const ruta = await Ruta.findOne(filter); 
    
    if (ruta) {
      await ruta.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });

      return res.status(201).send(ruta);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Actualizar una ruta,
 * modificando cuales quiera de sus valores,
 * a través de su nombre
 */
rutaRouter.patch('/tracks', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre de la ruta',
    });
  }
    
  try {
    const ruta = await Ruta.findOne({
      nombre: req.query.nombre
    });
    if (!ruta) {
      return res.status(404).send({
        error: "Ruta no encontrada"
      });
    }

    const allowedUpdates = ['nombre', 'geolocalizacionInicio', 'geolocalizacionFinal', 'longitud', 'desnivel','tipoActividad', 'calificacion'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Opciones no permitidas',
      });
    }

    const track = await Ruta.findOneAndUpdate(ruta._id, req.body, {
      new: true,
      runValidators: true
    })

    if (track) {
      await track.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });

      return res.status(201).send(track);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Actualizar una ruta,
 * modificando cuales quiera de sus valores,
 * a través de su ID, introducida por la URL
 */
rutaRouter.patch('/tracks/:id', async (req, res) => {
  try {
    const ruta = await Ruta.findOne({
      ID: req.params.id
    });
    if (!ruta) {
      return res.status(404).send({
        error: "Ruta no encontrada"
      });
    }

    const allowedUpdates = ['nombre', 'geolocalizacionInicio', 'geolocalizacionFinal', 'longitud', 'desnivel','tipoActividad', 'calificacion'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Opciones no permitidas',
      });
    }

    const track = await Ruta.findOneAndUpdate(ruta._id, req.body, {
      new: true,
      runValidators: true
    })

    if (track) {
      await track.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });

      return res.status(201).send(track);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar una ruta,
 * a través de su nombre
 */
rutaRouter.delete('/tracks', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner ruta',
    });
  }
  
  try {
    const ruta = await Ruta.findOne({
      nombre: req.query.nombre
    });
    if (!ruta) {
      return res.status(404).send({
        error: "Ruta no encontrada"
      });
    }

    for (let i = 0; i < ruta.usuariosRealizaron.length; i++) { // Borramos la ruta de los usuarios
      const user = await Usuario.findById(ruta.usuariosRealizaron[i]);
      if (user) {
        // Buscamos y eliminamos de rutas Favoritas de usuarios
        const indexTrack = user.rutasFavoritas.findIndex((track) => track._id.toString() === ruta._id.toString());
        if (indexTrack != -1) {
          user.rutasFavoritas.splice(indexTrack, 1);
        }

        // Buscamos y eliminamos rutas de historico rutas
        for (let i = 0; i < user.historicoRutas.length; i++) {
          if (user.historicoRutas[i][1] === ruta._id.toString()) {
            user.historicoRutas.splice(i, 1);
            i--;
          }
        }

        await Usuario.findOneAndUpdate(user._id, {rutasFavoritas: user.rutasFavoritas, historicoRutas: user.historicoRutas}, {
          new: true,
          runValidators: true
        })
      }
    }

    const groups = await Grupo.find({rutasFavoritas: ruta._id.toString()})
    if (groups.length != 0) {
      for (let i = 0; i < groups.length; i++) { // Borramos la ruta de los grupos
        const group = await Grupo.findById(groups[i]._id);
        if (group) {
          // Buscamos y eliminamos de rutas Favoritas de grupos
          const indexTrack = group.rutasFavoritas.findIndex((track) => track._id.toString() === ruta._id.toString());
          if (indexTrack != -1) {
            group.rutasFavoritas.splice(indexTrack, 1);
          }
  
          // Buscamos y eliminamos rutas de historico rutas
          for (let i = 0; i < group.historicoRutas.length; i++) {
            if (group.historicoRutas[i][1] === ruta._id.toString()) {
              group.historicoRutas.splice(i, 1);
              i--;
            }
          }
  
          await Grupo.findOneAndUpdate(group._id, {rutasFavoritas: group.rutasFavoritas, historicoRutas: group.historicoRutas}, {
            new: true,
            runValidators: true
          })
        }
      }
    }

    const challenges = await Reto.find({rutas: ruta._id.toString()})
    if (challenges.length != 0) {
      for (let i = 0; i < challenges.length; i++) { // Borramos la ruta de los retos
        const reto = await Reto.findById(challenges[i]._id);
        if (reto) {
          // Buscamos y eliminamos de rutas de los retos
          const indexTrack = reto.rutas.findIndex((track) => track._id.toString() === ruta._id.toString());
          if (indexTrack != -1) {
            reto.rutas.splice(indexTrack, 1);
          }
  
          await Reto.findOneAndUpdate(reto._id, {rutas: reto.rutas}, {
            new: true,
            runValidators: true
          })
        }
      }
    }

    await Ruta.findByIdAndDelete(ruta._id);
    await ruta.populate({
      path: 'usuariosRealizaron',
      select: ['ID', 'nombre']
    });
    return res.status(201).send(ruta);
  } catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar una ruta,
 * a través de su ID, introducida en la URL
 */
rutaRouter.delete('/tracks/:id', async (req, res) => {
  try {
    const ruta = await Ruta.findOne({
      ID: req.params.id
    });
    if (!ruta) {
      return res.status(404).send({
        error: "Ruta no encontrada"
      });
    }

    for (let i = 0; i < ruta.usuariosRealizaron.length; i++) { // Borramos la ruta de los usuarios
      const user = await Usuario.findById(ruta.usuariosRealizaron[i]);
      if (user) {
        // Buscamos y eliminamos de rutas Favoritas de usuarios
        const indexTrack = user.rutasFavoritas.findIndex((track) => track._id.toString() === ruta._id.toString());
        if (indexTrack != -1) {
          user.rutasFavoritas.splice(indexTrack, 1);
        }

        // Buscamos y eliminamos rutas de historico rutas
        for (let i = 0; i < user.historicoRutas.length; i++) {
          if (user.historicoRutas[i][1] === ruta._id.toString()) {
            user.historicoRutas.splice(i, 1);
            i--;
          }
        }

        await Usuario.findOneAndUpdate(user._id, {rutasFavoritas: user.rutasFavoritas, historicoRutas: user.historicoRutas}, {
          new: true,
          runValidators: true
        })
      }
    }

    const groups = await Grupo.find({rutasFavoritas: ruta._id.toString()})
    if (groups.length != 0) {
      for (let i = 0; i < groups.length; i++) { // Borramos la ruta de los grupos
        const group = await Grupo.findById(groups[i]._id);
        if (group) {
          // Buscamos y eliminamos de rutas Favoritas de grupos
          const indexTrack = group.rutasFavoritas.findIndex((track) => track._id.toString() === ruta._id.toString());
          if (indexTrack != -1) {
            group.rutasFavoritas.splice(indexTrack, 1);
          }
  
          // Buscamos y eliminamos rutas de historico rutas
          for (let i = 0; i < group.historicoRutas.length; i++) {
            if (group.historicoRutas[i][1] === ruta._id.toString()) {
              group.historicoRutas.splice(i, 1);
              i--;
            }
          }
  
          await Grupo.findOneAndUpdate(group._id, {rutasFavoritas: group.rutasFavoritas, historicoRutas: group.historicoRutas}, {
            new: true,
            runValidators: true
          })
        }
      }
    }

    const challenges = await Reto.find({rutas: ruta._id.toString()})
    if (challenges.length != 0) {
      for (let i = 0; i < challenges.length; i++) { // Borramos la ruta de los retos
        const reto = await Reto.findById(challenges[i]._id);
        if (reto) {
          // Buscamos y eliminamos de rutas de los retos
          const indexTrack = reto.rutas.findIndex((track) => track._id.toString() === ruta._id.toString());
          if (indexTrack != -1) {
            reto.rutas.splice(indexTrack, 1);
          }
  
          await Reto.findOneAndUpdate(reto._id, {rutas: reto.rutas}, {
            new: true,
            runValidators: true
          })
        }
      }
    }

    await Ruta.findByIdAndDelete(ruta._id);
    await ruta.populate({
      path: 'usuariosRealizaron',
      select: ['ID', 'nombre']
    });
    return res.status(201).send(ruta);
  } catch (error) {
    return res.status(500).send(error);
  }
}); 