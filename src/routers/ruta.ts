import express from 'express';
import { Ruta } from '../models/ruta.js';

export const rutaRouter = express.Router();

/**
 * Crear una ruta
 */
rutaRouter.post('/tracks', async (req, res) => {
  const ruta = new Ruta(req.body);

  try {
    await ruta.save();
    res.status(201).send(ruta);
  } catch (error) { 
    res.status(400).send(error);
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
    const ruta = await Ruta.find(filter); 
    if (ruta.length !== 0) {
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
    const ruta = await Ruta.find(filter); 
    if (ruta.length !== 0) {
      res.status(201).send(ruta);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
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

    const allowedUpdates = ['nombre', 'geolocalizacionInicio', 'geolocalizacionFinal', 'longitud', 'desnivel', 'usuariosRealizaron','tipoActividad', 'calificacion'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Ruta no permitida',
      });
    }

    const note = await Ruta.findOneAndUpdate(ruta._id, req.body, {
      new: true,
      runValidators: true
    })

    if (note) {
      return res.status(201).send(note);
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

    const allowedUpdates = ['nombre', 'geolocalizacionInicio', 'geolocalizacionFinal', 'longitud', 'desnivel', 'usuariosRealizaron','tipoActividad', 'calificacion'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Ruta no permitida',
      });
    }

    const note = await Ruta.findOneAndUpdate(ruta._id, req.body, {
      new: true,
      runValidators: true
    })

    if (note) {
      return res.status(201).send(note);
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

    const result = await Ruta.deleteMany({owner: ruta._id});
    if (!result.acknowledged) {
      return res.status(500).send();
    }

    await Ruta.findByIdAndDelete(ruta._id);
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

    const result = await Ruta.deleteMany({owner: ruta._id});
    if (!result.acknowledged) {
      return res.status(500).send();
    }

    await Ruta.findByIdAndDelete(ruta._id);
    return res.status(201).send(ruta);
  } catch (error) {
    return res.status(500).send(error);
  }
}); 