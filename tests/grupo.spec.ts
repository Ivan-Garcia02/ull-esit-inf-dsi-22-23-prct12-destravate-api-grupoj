import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Grupo } from '../src/models/grupo.js'
import { Usuario } from '../src/models/usuario.js'
import { Ruta } from '../src/models/ruta.js'

const primerGrupo = {
  ID: 1,
  nombre: "Novatos",
  participantes: ["usuarioSegundo", "usuarioInicial"],
  estadisticasEntrenamiento: [12, 13, 12, 14],
  clasificacionUsuarios: ["usuarioInicial", "usuarioSegundo"],
  rutasFavoritas: [1],
  historicoRutas: [],
}

beforeEach(async () => {
  await Usuario.deleteMany();
  await Ruta.deleteMany();
  await Grupo.deleteMany();
  await new Grupo(primerGrupo).save();
});

describe('POST /groups', () => {

  it('Should successfully create a new group', async () => {
    await request(app).post('/groups').send({
      ID: 2,
      nombre: "Begginers",
      participantes: ["usuarioSegundo", "usuarioInicial"],
      estadisticasEntrenamiento: [12, 13, 14, 15],
      clasificacionUsuarios: ["usuarioInicial", "usuarioSegundo"],
      rutasFavoritas: [1],
      historicoRutas: [["hola", 1]],
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/groups').send({
      ID: 3,
      nombre: "Novatos",
      participantes: ["usuarioSegundo"],
      estadisticasEntrenamiento: [16, 17, 18, 19],
      clasificacionUsuarios: ["usuarioInicial"],
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