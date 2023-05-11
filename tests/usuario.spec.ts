import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Usuario } from '../src/models/usuario.js'

const primerUsuario = {
  ID: "pepejean",
  nombre: "Pepe Jelous Santos",
  tipoActividad: 'bicicleta',
  amigos: [],
  geolocalizacionFinal: [20,2],
  longitud: 2002,
  desnivel: 200,
  usuariosRealizaron: [],
  calificacion: 6
}

beforeEach(async () => {
  await Usuario.deleteMany();
  await new Usuario(primerUsuario).save();
});
  
describe('POST /user', () => {
  it('Should successfully create a new user', async () => {
    await request(app).post('/user').send({
      ID: 2,
      nombre: "Laurisilva De PEPE",
      geolocalizacionInicio: [12,50],
      geolocalizacionFinal: [20,2],
      longitud: 2002,
      desnivel: 200,
      usuariosRealizaron: [],
      tipoActividad: 'bicicleta',
      calificacion: 6
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/user').send({
      ID: 3,
      nombre: "Laurisilva De PEPE",
      geolocalizacionInicio: [12,50],
      geolocalizacionFinal: [20,2],
      longitud: -2002,
      desnivel: 200,
      usuariosRealizaron: [],
      tipoActividad: 'bici',
      calificacion: 6
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/user').send(primerUsuario).expect(400);
  });
});


/*describe('GET /user', () => {
  it('Should get a user by name', async () => {
    await request(app).get('/user?nombre=Laurisilva De Felipe').expect(201);
  });
  
  it('Should not find a user by name', async () => {
    await request(app).get('/user?nombre=Laurisilva').expect(404);
  });

  it('Should get a user by ID', async () => {
    await request(app).get('/user/1').expect(201);
  });
  
  it('Should not find a user by ID', async () => {
    await request(app).get('/user/12').expect(404);
  });
});

describe('PATCH /user', () => {

  it('Should patch a user by name', async () => {
    await request(app).patch('/user?nombre=Laurisilva De Felipe').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a user by name', async () => {
    await request(app).patch('/user?nombre=Laurisilva').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });

  it('Should patch a user by ID', async () => {
    await request(app).patch('/user/1').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a user by ID', async () => {
    await request(app).patch('/user/12').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });
});

describe('DELETE /user', () => {
  it('Should delete a user by name', async () => {
    await request(app).delete('/user?nombre=Laurisilva De Felipe').expect(201);
  });
  
  it('Should not find a user by name', async () => {
    await request(app).get('/user?nombre=Laurisilva').expect(404);
  });

  it('Should delete a user by ID', async () => {
    await request(app).get('/user/1').expect(201);
  });
  
  it('Should not find a user by ID', async () => {
    await request(app).get('/user/12').expect(404);
  });
});*/