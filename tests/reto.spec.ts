import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Reto } from '../src/models/reto.js'

const primerReto = {
  ID: 2,
  nombre: 'Subida del socorro',
  rutas: [],
  tipoActividad: 'correr',
  kmTotales: 234,
  usuariosRealizaron: []
}

beforeEach(async () => {
  await Reto.deleteMany();
  await new Reto(primerReto).save();
});

describe('POST /challenges', () => {
  it('Should successfully create a new challenge', async () => {
    await request(app).post('/challenges').send({
      ID: 1,
      nombre: 'Pseudo Tour de Francia',
      rutas: [],
      tipoActividad: 'bicicleta',
      kmTotales: 100,
      usuariosRealizaron: []
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/challenges').send({
      ID: 3,
      nombre: 'Pseudo Tour de Francia',
      rutas: [],
      tipoActividad: 'bicicleta',
      kmTotales: 100,
      usuariosRealizaron: []
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/challenges').send(primerReto).expect(400);
  });
});