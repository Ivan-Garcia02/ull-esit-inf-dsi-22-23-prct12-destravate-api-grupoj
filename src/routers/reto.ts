import express from 'express';
import { Reto } from '../models/reto.js';
import { Usuario } from '../models/usuario.js';
import { Ruta } from '../models/ruta.js';

export const retoRouter = express.Router();

/**
 * Crear una reto
 */
retoRouter.post('/challenges', async (req, res) => {
  let rutasRef: typeof Ruta[] = [];
  let rutas: string[] = req.body.rutas;
  let usuariosRealizaronRef: typeof Usuario[] = [];
  let usuariosRealizaron: string[] = req.body.usuariosRealizaron;

  try {
    let km_totales: number = 0;
    for (let i = 0; i < rutas.length; i++) {
      const track = await Ruta.findOne({ID: rutas[i]});
      if (!track) {
        return res.status(404).send({
          error: "Ruta no encontrada" 
        });
      }
      km_totales += track.longitud;
      rutasRef.push(track._id);
    }


    for (let i = 0; i < usuariosRealizaron.length; i++) {
      const user = await Usuario.findOne({ID: usuariosRealizaron[i]});
      if (!user) {
        return res.status(404).send({
          error: "Usuario no encontrado" 
        });
      }
      usuariosRealizaronRef.push(user._id);
    }
    req.body.rutas = rutasRef;
    req.body.kmTotales = km_totales;
    req.body.usuariosRealizaron = usuariosRealizaronRef;
    const reto = new Reto(req.body);

    await reto.save();
    for (let i = 0; i < reto.usuariosRealizaron.length; i++) { //Actualizamos los usuarios que realizaron los retos
      const usuario = await Usuario.findOne({ID: usuariosRealizaron[i]});
      
      if (usuario && !usuario.retosActivos.find(re => re.ID === req.body.ID)) {
        usuario.retosActivos.push(reto._id);
        
        await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
          new: true,
          runValidators: true
        })
      }
    }
    await reto.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reto.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
    return res.status(201).send(reto);
  } catch (error) { 
    return res.status(400).send(error);
  }
});

/**
 * Obtener un reto a través del nombre del mismo
 */
retoRouter.get('/challenges', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner nombre del reto',
    });
  }
  const filter = req.query.nombre?{nombre: req.query.nombre}:{};
  try {
    const reto = await Reto.findOne(filter); 
    if(reto) {
      await reto.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reto.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
      return res.status(201).send(reto);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Obtener un reto a través del id,
 * introducido en la URL
 */
retoRouter.get('/challenges/:id', async (req, res) => { // :id
  const filter = req.params.id?{ID: req.params.id}:{};

  try {
    const reto = await Reto.findOne(filter); 
    if(reto) {
      await reto.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reto.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
      return res.status(201).send(reto);
    } else {
      return res.status(404).send();
    }
  }catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Actualizar un reto,
 * modificando cuales quiera de sus valores,
 * a través de su nombre
 */
retoRouter.patch('/challenges', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del reto',
    });
  }

  try {
    const reto = await Reto.findOne({
      nombre: req.query.nombre
    });

    if (!reto) {
      return res.status(404).send({
        error: "Reto no encontrado"
      });
    }

    const allowedUpdates = ['nombre', 'rutas', 'tipoActividad', 'usuariosRealizaron']
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Reto no permitido',
      });
    }

    let rutasRef: typeof Ruta[] = [];
    let rutas: string[] = req.body.rutas;
    let usuariosRealizaronRef: typeof Usuario[] = [];
    let usuariosRealizaron: string[] = req.body.usuariosRealizaron;
    let km_totales: number = 0;
    if (req.body.rutas) {
      for (let i = 0; i < rutas.length; i++) {
        const ruta = await Ruta.findOne({ID: rutas[i]});
        if (!ruta) {
          return res.status(404).send({
            error: "Ruta no encontrada"
          });
        }
        km_totales += ruta.longitud;
        rutasRef.push(ruta._id);
      }
      req.body.rutas = rutasRef;
      req.body.kmTotales = km_totales;
    }

    if (req.body.usuariosRealizaron) {
      for (let i = 0; i < reto.usuariosRealizaron.length; i++) {
        const usuario = await Usuario.findById(reto.usuariosRealizaron[i]._id);
        if (!usuario) {
          return res.status(404).send({
            error: "Usuario no encontrado" 
          });
        }
  
        const indexReto = usuario.retosActivos.findIndex(re => {re.ID === reto.ID});
        usuario.retosActivos.splice(indexReto, 1);
        await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
          new: true,
          runValidators: true
        })
      }

      for (let i = 0; i < usuariosRealizaron.length; i++) {
        const usuario = await Usuario.findOne({ID: usuariosRealizaron[i]});
        if (!usuario) {
          return res.status(404).send({
            error: "Usuario no encontrado" 
          });
        }
        usuariosRealizaronRef.push(usuario._id)
        usuario.retosActivos.push(reto._id);
        await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
          new: true,
          runValidators: true
        })
      }
      req.body.usuariosRealizaron = usuariosRealizaronRef;
    }
    const reti = await Reto.findOneAndUpdate(reto._id, req.body, {
      new: true,
      runValidators: true
    })

    if (reti) {
      await reti.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reti.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
      return res.status(201).send(reti);
    }
    return res.status(404).send();

  }catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Actualizar un reto,
 * modificando cuales quiera de sus valores,
 * a través de su ID, introducido en la URL
 */
retoRouter.patch('/challenges/:id', async (req, res) => {
  try {
    const reto = await Reto.findOne({
      ID: req.params.id
    });

    if (!reto) {
      return res.status(404).send({
        error: "Reto no encontrado"
      });
    }

    const allowedUpdates = ['nombre', 'rutas', 'tipoActividad', 'usuariosRealizaron']
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Reto no permitido',
      });
    }

    let rutasRef: typeof Ruta[] = [];
    let rutas: string[] = req.body.rutas;
    let usuariosRealizaronRef: typeof Usuario[] = [];
    let usuariosRealizaron: string[] = req.body.usuariosRealizaron;
    let km_totales: number = 0;
    if (req.body.rutas) {
      for (let i = 0; i < rutas.length; i++) {
        const ruta = await Ruta.findOne({ID: rutas[i]});
        if (!ruta) {
          return res.status(404).send({
            error: "Ruta no encontrada"
          });
        }
        km_totales += ruta.longitud;
        rutasRef.push(ruta._id);
      }
      req.body.rutas = rutasRef;
      req.body.kmTotales = km_totales;
    }

    if (req.body.usuariosRealizaron) {
      for (let i = 0; i < reto.usuariosRealizaron.length; i++) {
        const usuario = await Usuario.findById(reto.usuariosRealizaron[i]._id);
        if (!usuario) {
          return res.status(404).send({
            error: "Usuario no encontrado" 
          });
        }
  
        const indexReto = usuario.retosActivos.findIndex(re => {re.ID === reto.ID});
        usuario.retosActivos.splice(indexReto, 1);
        await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
          new: true,
          runValidators: true
        })
      }

      for (let i = 0; i < usuariosRealizaron.length; i++) {
        const usuario = await Usuario.findOne({ID: usuariosRealizaron[i]});
        if (!usuario) {
          return res.status(404).send({
            error: "Usuario no encontrado" 
          });
        }
        usuariosRealizaronRef.push(usuario._id)
        usuario.retosActivos.push(reto._id);
        await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
          new: true,
          runValidators: true
        })
      }
      req.body.usuariosRealizaron = usuariosRealizaronRef;
    }
    const reti = await Reto.findOneAndUpdate(reto._id, req.body, {
      new: true,
      runValidators: true
    })

    if (reti) {
      await reti.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reti.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
      return res.status(201).send(reti);
    }
    return res.status(404).send();

  }catch (error) {
    return res.status(500).send(error);
  }
});


/**
 * Eliminar un reto,
 * a través de su nombre
 */
retoRouter.delete('/challenges', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Es necesario poner el nombre del reto',
    });
  }

  try {
    const reto = await Reto.findOne({
      nombre: req.query.nombre
    });
    if (!reto) {
      return res.status(404).send({
        error: "Reto no encontrado"
      });
    }

    for (let i = 0; i < reto.usuariosRealizaron.length; i++) {
      const usuario = await Usuario.findById(reto.usuariosRealizaron[i]);
      if (!usuario) {
        return res.status(404).send({
          error: "Usuario no encontrado" 
        });
      }

      const indexReto = usuario.retosActivos.findIndex(re => {re.ID === reto.ID});
      usuario.retosActivos.splice(indexReto, 1);
      await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
        new: true,
        runValidators: true
      })
    }

    await Reto.findByIdAndDelete(reto._id);
    await reto.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reto.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
    return res.status(201).send(reto);
  }catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Eliminar un reto,
 * a través de su ID, introducido en la URL
 */
retoRouter.delete('/challenges/:id', async (req, res) => {

  try {
    const reto = await Reto.findOne({
      ID: req.params.id
    });
    if (!reto) {
      return res.status(404).send({
        error: "Reto no encontrado"
      });
    }

    for (let i = 0; i < reto.usuariosRealizaron.length; i++) {
      const usuario = await Usuario.findById(reto.usuariosRealizaron[i]);
      if (!usuario) {
        return res.status(404).send({
          error: "Usuario no encontrada" 
        });
      }

      const indexReto = usuario.retosActivos.findIndex(re => {re.ID === reto.ID});
      usuario.retosActivos.splice(indexReto, 1);
      await Usuario.findOneAndUpdate(usuario._id, {retosActivos: usuario.retosActivos}, {
        new: true,
        runValidators: true
      })
    }

    await Reto.findByIdAndDelete(reto._id);
    await reto.populate({
        path: 'rutas',
        select: ['ID', 'nombre']
      });
      await reto.populate({
        path: 'usuariosRealizaron',
        select: ['ID', 'nombre']
      });
    return res.status(201).send(reto);
  }catch (error) {
    return res.status(500).send(error);
  }
});