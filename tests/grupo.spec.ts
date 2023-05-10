import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Grupo } from '../src/models/grupo.js'

const primerGrupo = {
  ID: 1,
  nombre: "Novatos",
  participantes: [],
  estadisticasEntrenamiento: [],
  clasificacionUsuarios: [],
  rutasFavoritas: [],
  historicoRutas: [],
}

beforeEach(async () => {
  await Grupo.deleteMany();
  await new Grupo(primerGrupo).save();
});
  
describe('POST /groups', () => {
  it('Should successfully create a new group', async () => {
    await request(app).post('/groups').send({
      ID: 2,
      nombre: "Novatos",
      participantes: [],
      estadisticasEntrenamiento: [],
      clasificacionUsuarios: [],
      rutasFavoritas: [],
      historicoRutas: [],
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/groups').send({
      ID: 3,
      nombre: "Novatos",
      participantes: [],
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


// describe('GET /tracks', () => {
//   it('Should get a tracks by name', async () => {
//     await request(app).get('/tracks?nombre=Laurisilva De Felipe').expect(201);
//   });
  
//   it('Should not find a tracks by name', async () => {
//     await request(app).get('/tracks?nombre=Laurisilva').expect(404);
//   });

//   it('Should get a tracks by ID', async () => {
//     await request(app).get('/tracks/1').expect(201);
//   });
  
//   it('Should not find a tracks by ID', async () => {
//     await request(app).get('/tracks/12').expect(404);
//   });
// });

// describe('PATCH /tracks', () => {

//   it('Should patch a tracks by name', async () => {
//     await request(app).patch('/tracks?nombre=Laurisilva De Felipe').send({
//       longitud: 3003,
//       desnivel: 300,
//     }).expect(201);
//   });

//   it('Should not find a tracks by name', async () => {
//     await request(app).patch('/tracks?nombre=Laurisilva').send({
//       longitud: 3003,
//       desnivel: 300,
//     }).expect(404);
//   });

//   it('Should patch a tracks by ID', async () => {
//     await request(app).patch('/tracks/1').send({
//       longitud: 3003,
//       desnivel: 300,
//     }).expect(201);
//   });

//   it('Should not find a tracks by ID', async () => {
//     await request(app).patch('/tracks/12').send({
//       longitud: 3003,
//       desnivel: 300,
//     }).expect(404);
//   });
// });

// describe('DELETE /tracks', () => {
//   it('Should delete a tracks by name', async () => {
//     await request(app).delete('/tracks?nombre=Laurisilva De Felipe').expect(201);
//   });
  
//   it('Should not find a tracks by name', async () => {
//     await request(app).get('/tracks?nombre=Laurisilva').expect(404);
//   });

//   it('Should delete a tracks by ID', async () => {
//     await request(app).get('/tracks/1').expect(201);
//   });
  
//   it('Should not find a tracks by ID', async () => {
//     await request(app).get('/tracks/12').expect(404);
//   });
// });