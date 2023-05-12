import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Grupo } from '../src/models/grupo.js'
import { Usuario } from '../src/models/usuario.js'
import { Ruta } from '../src/models/ruta.js'

const pRuta = {
  ID: 1,
  nombre: "Laurisilve",
  geolocalizacionInicio: [12,50],
  geolocalizacionFinal: [20,2],
  longitud: 2002,
  desnivel: 200,
  usuariosRealizaron: [],
  tipoActividad: 'bicicleta',
  calificacion: 6
}

const primerGrupo = {
  ID: 1,
  nombre: "Novatos",
  participantes: [],
  estadisticasEntrenamiento: [],
  clasificacionUsuarios: [],
  rutasFavoritas: [],
  historicoRutas: [],
}

const primerUsuario = {
  ID: "usuarioInicial",
  nombre: "Usuario Tests",
  tipoActividad: 'bicicleta',
  amigos: [],
  grupoAmigos: [],
  estadisticasEntrenamiento: [12, 13, 12, 14],
  rutasFavoritas: [],
  retosActivos: [],
  historicoRutas: [],
}

const segundoUsuario = {
  ID: "usuarioSegundo",
  nombre: "Usuario Tests 2",
  tipoActividad: 'bicicleta',
  amigos: [],
  grupoAmigos: [],
  estadisticasEntrenamiento: [15, 13, 12, 14],
  rutasFavoritas: [],
  retosActivos: [],
  historicoRutas: [],
}


beforeEach(async () => {
  await Usuario.deleteMany();
  await Ruta.deleteMany();
  await Grupo.deleteMany();
  await new Ruta(pRuta).save();
  await new Usuario(primerUsuario).save();
  await new Usuario(segundoUsuario).save();
  await new Grupo(primerGrupo).save();
});

describe('Previaaaa temporal', () => {

  it('PREVIA TEMPORAL ', async () => {
    await request(app).get('/users/usuarioInicial').expect(201);
  });

  it('222 PREVIA TEMPORAL', async () => {
    await request(app).get('/users/usuarioSegundo').expect(201);
  });

}); 

describe('POST /groups', () => {

  it('Should successfully create a new group', async () => {
    await request(app).post('/groups').send({
      ID: 2,
      nombre: "Begginers",
      participantes: ["usuarioSegundo", "usuarioInicial"],
      estadisticasEntrenamiento: [],
      clasificacionUsuarios: [],
      rutasFavoritas: [1],
      historicoRutas: [],
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/groups').send({
      ID: 3,
      nombre: "Novatos",
      participantes: ["usuarioSegundo"],
      estadisticasEntrenamiento: [],
      clasificacionUsuarios: [],
      rutasFavoritas: [],
      historicoRutas: [],
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/groups').send(primerGrupo).expect(400);
  });
});


describe('GET /groups', () => {
  it('Should get a groups by name', async () => {
    await request(app).get('/groups?nombre=Novatos').expect(201);
  });
  
  it('Should not find a groups by name', async () => {
    await request(app).get('/groups?nombre=Laurisilva').expect(404);
  });

  it('Should get a groups by ID', async () => {
    await request(app).get('/groups/1').expect(201);
  });
  
  it('Should not find a groups by ID', async () => {
    await request(app).get('/groups/12').expect(404);
  });
});

describe('PATCH /groups', () => {

  it('Should patch a groups by name', async () => {
    await request(app).patch('/groups?nombre=Novatos').send({
      rutasFavoritas: [1],
      participantes: ["usuarioInicial"],
    }).expect(201);
  });

  it('Should not find a groups by name', async () => {
    await request(app).patch('/groups?nombre=Laurisilva').send({
      nombre: "Oe",
      participantes: ["gab"],
    }).expect(404);
  });

  it('Should patch a groups by ID', async () => {
    await request(app).patch('/groups/1').send({
      nombre: "Onlyone",
      participantes: ["usuarioInicial", "usuarioSegundo"],
    }).expect(201);
  });

  it('Should not find a groups by ID', async () => {
    await request(app).patch('/groups/12').send({
      rutasFavoritas: [1]
    }).expect(404);
  });
});


describe('DELETE /groups', () => {
  it('Should delete a groups by name', async () => {
    await request(app).delete('/groups?nombre=Novatos').expect(201);
  });
  
  it('Should not find a groups by name', async () => {
    await request(app).get('/groups?nombre=Laurisilva').expect(404);
  });

  it('Should delete a groups by ID', async () => {
    await request(app).get('/groups/1').expect(201);
  });
  
  it('Should not find a groups by ID', async () => {
    await request(app).get('/groups/12').expect(404);
  });
}); 