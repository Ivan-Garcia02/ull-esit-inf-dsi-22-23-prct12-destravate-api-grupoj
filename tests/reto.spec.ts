import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Reto } from '../src/models/reto.js'
import { Ruta } from '../src/models/ruta.js'
import { Usuario } from '../src/models/usuario.js'

const primerReto = {
  ID: 2,
  nombre: 'Subida',
  rutas: [],
  tipoActividad: 'correr',
  kmTotales: 0,
  usuariosRealizaron: []
}

const pRuta = {
  ID: 1,
  nombre: 'Laurisilve',
  geolocalizacionInicio: [12,50],
  geolocalizacionFinal: [20,2],
  longitud: 2002,
  desnivel: 200,
  usuariosRealizaron: [],
  tipoActividad: 'bicicleta',
  calificacion: 6
}

beforeEach(async () => {
  await Reto.deleteMany();
  await Ruta.deleteMany();
  await new Reto(primerReto).save();
  await new Ruta(pRuta).save();
});

describe('POST /challenges', () => {
  it('Should successfully create a new challenge', async () => {
    await request(app).post('/challenges').send({
      ID: 1,
      nombre: 'Pseudo Tour de Francia',
      rutas: [],
      tipoActividad: 'bicicleta',
      kmTotales: 0,
      usuariosRealizaron: []
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/challenges').send({
      ID: 2,
      nombre: 'Pseudo Tour de Francia',
      rutas: [],
      tipoActividad: 'bicicleta',
      kmTotales: 0,
      usuariosRealizaron: []
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/challenges').send(primerReto).expect(400);
  });
});

describe('GET /challenges', () => {
  it('Should get a challenges by name', async () => {
    await request(app).get('/challenges?nombre=Subida').expect(201);
  });
  
  it('Should not find a challenges by name', async () => {
    await request(app).get('/challenges?nombre=Laurisilva').expect(404);
  });

  it('Should get a challenges by ID', async () => {
    await request(app).get('/challenges/2').expect(201);
  });
  
  it('Should not find a challenges by ID', async () => {
    await request(app).get('/challenges/12').expect(404);
  });
});

describe('PATCH /challenges', () => {

  it('Should patch a challenges by name', async () => {
    await request(app).patch('/challenges?nombre=Subida').send({
      rutas: [1],
    }).expect(201);
  });

  it('Should patch a challenges by name, but not the track', async () => {
    await request(app).patch('/challenges?nombre=Subida').send({
      rutas: [12],
    }).expect(404);
  });

  it('Should patch a challenges by name, but not the user', async () => {
    await request(app).patch('/challenges?nombre=Subida').send({
      usuariosRealizaron: [21]
    }).expect(404);
  });

  it('Should patch a challenges by name, but challenge is not permmited', async () => {
    await request(app).patch('/challenges?nombre=Subida').send({
      ID: 7,
      usuariosRealizaron: [21]
    }).expect(400);
  });

  it('Should not find a challenges by name', async () => {
    await request(app).patch('/challenges?nombre=Pseudo Tour de Francia').send({
      rutas: [12],
      usuariosRealizaron: [21]
    }).expect(404);
  });

  it('Should patch a challenges by ID', async () => {
    await request(app).patch('/challenges/2').send({
      nombre: "3003",
      usuariosRealizaron: ['usuarioInicial']
    }).expect(201);
  });

  it('Should not find a challenges by ID', async () => {
    await request(app).patch('/challenges/12').send({
      nombre: 5
    }).expect(404);
  });
});

describe('DELETE /challenges', () => {
  it('Should delete a challenges by name', async () => {
    await request(app).delete('/challenges?nombre=Subida').expect(201);
  });
  
  it('Should not find a challenges by name', async () => {
    await request(app).get('/challenges?nombre=Laurisilva').expect(404);
  });

  it('Should delete a challenges by ID', async () => {
    await request(app).get('/challenges/2').expect(201);
  });
  
  it('Should not find a challenges by ID', async () => {
    await request(app).get('/challenges/12').expect(404);
  });
});