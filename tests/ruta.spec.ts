import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Ruta } from '../src/models/ruta.js'

const primeraRuta = {
  ID: 1,
  nombre: "Laurisilva De Felipe",
  geolocalizacionInicio: [12,50],
  geolocalizacionFinal: [20,2],
  longitud: 2002,
  desnivel: 200,
  usuariosRealizaron: ["IvanYVienen", "Andresol"],
  tipoActividad: 'bicicleta',
  calificacion: 6
}

beforeEach(async () => {
  await Ruta.deleteMany();
  await new Ruta(primeraRuta).save();
});
  
describe('POST /tracks', () => {
  it('Should successfully create a new tracks', async () => {
    await request(app).post('/tracks').send({
      ID: 2,
      nombre: "Laurisilva De PEPE",
      geolocalizacionInicio: [12,50],
      geolocalizacionFinal: [20,2],
      longitud: 2002,
      desnivel: 200,
      usuariosRealizaron: ["IvanYVienen", "Andresol"],
      tipoActividad: 'bicicleta',
      calificacion: 6
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/tracks').send({
      ID: 3,
      nombre: "Laurisilva De PEPE",
      geolocalizacionInicio: [12,50],
      geolocalizacionFinal: [20,2],
      longitud: -2002,
      desnivel: 200,
      usuariosRealizaron: ["IvanYVienen", "Andresol"],
      tipoActividad: 'bici',
      calificacion: 6
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/tracks').send(primeraRuta).expect(400);
  });
});


describe('GET /tracks', () => {
  it('Should get a tracks by name', async () => {
    await request(app).get('/tracks?nombre=Laurisilva De Felipe').expect(201);
  });
  
  it('Should not find a tracks by name', async () => {
    await request(app).get('/tracks?nombre=Laurisilva').expect(404);
  });

  it('Should get a tracks by ID', async () => {
    await request(app).get('/tracks/1').expect(201);
  });
  
  it('Should not find a tracks by ID', async () => {
    await request(app).get('/tracks/12').expect(404);
  });
});

describe('PATCH /tracks', () => {

  it('Should patch a tracks by name', async () => {
    await request(app).patch('/tracks?nombre=Laurisilva De Felipe').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a tracks by name', async () => {
    await request(app).patch('/tracks?nombre=Laurisilva').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });

  it('Should patch a tracks by ID', async () => {
    await request(app).patch('/tracks/1').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a tracks by ID', async () => {
    await request(app).patch('/tracks/12').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });
});

describe('DELETE /tracks', () => {
  it('Should delete a tracks by name', async () => {
    await request(app).delete('/tracks?nombre=Laurisilva De Felipe').expect(201);
  });
  
  it('Should not find a tracks by name', async () => {
    await request(app).get('/tracks?nombre=Laurisilva').expect(404);
  });

  it('Should delete a tracks by ID', async () => {
    await request(app).get('/tracks/1').expect(201);
  });
  
  it('Should not find a tracks by ID', async () => {
    await request(app).get('/tracks/12').expect(404);
  });
});