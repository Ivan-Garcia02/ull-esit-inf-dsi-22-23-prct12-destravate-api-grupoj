import 'mocha'
import request from 'supertest';
import { app } from '../src/app.js';
import { Usuario } from '../src/models/usuario.js'

const primeraRuta = {
  ID: 1,
  nombre: "Laurisilva De Felipe",
  geolocalizacionInicio: [12,50],
  geolocalizacionFinal: [20,2],
  longitud: 2002,
  desnivel: 200,
  usuariosRealizaron: [],
  tipoActividad: 'bicicleta',
  calificacion: 6
}

const primerReto = {
  ID: 2,
  nombre: 'Subida',
  rutas: [],
  tipoActividad: 'correr',
  kmTotales: 0,
  usuariosRealizaron: []
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
  await new Usuario(primerUsuario).save();
  await new Usuario(segundoUsuario).save();
});
  
describe('POST /users', () => {
  it('Should successfully create a new user', async () => {
    await request(app).post('/users').send({
      ID: "laurisilva",
      nombre: "Laurisilva de Pepe",
      tipoActividad: 'correr',
      amigos: ["usuarioSegundo", "usuarioInicial"],
      grupoAmigos: [],
      estadisticasEntrenamiento: [12, 13, 12, 14],
      rutasFavoritas: [],
      retosActivos: [],
      historicoRutas: [],
    }).expect(201);
  });

  it('Should get an error for bad schema', async () => {
    await request(app).post('/users').send({
      ID: "laurisilva12",
      nombre: "Laurisilva de Juan",
      tipoActividad: 'bici',
      amigos: [],
      grupoAmigos: [],
      estadisticasEntrenamiento: [12, 13, 12, 14],
      rutasFavoritas: [],
      retosActivos: [],
      historicoRutas: [],
    }).expect(400);
  });

  it('Should get an error', async () => {
    await request(app).post('/users').send(primerUsuario).expect(400);
  });
});


describe('GET /users', () => {
  it('Should get a user by name', async () => {
    await request(app).get('/users?nombre=Usuario Tests').expect(201);
  });
  
  it('Should not find a user by name', async () => {
    await request(app).get('/users?nombre=Laurisilva').expect(404);
  });

  it('Should get a user by ID', async () => {
    await request(app).get('/users/usuarioInicial').expect(201);
  });
  
  it('Should not find a user by ID', async () => {
    await request(app).get('/users/usuario').expect(404);
  });
});

describe('PATCH /users', () => {

  it('Should patch a user by name', async () => {
    await request(app).patch('/users?nombre=Usuario Tests').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a user by name', async () => {
    await request(app).patch('/users?nombre=Laurisilva').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });

  it('Should patch a user by ID', async () => {
    await request(app).patch('/users/usuarioInicial').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(201);
  });

  it('Should not find a user by ID', async () => {
    await request(app).patch('/users/12').send({
      longitud: 3003,
      desnivel: 300,
    }).expect(404);
  });
});

describe('DELETE /users', () => {
  it('Should delete a user by name', async () => {
    await request(app).delete('/users?nombre=Usuario Tests').expect(201);
  });
  
  it('Should not find a user by name', async () => {
    await request(app).delete('/users?nombre=Usuario').expect(404);
  });

  it('Should delete a user by ID', async () => {
    await request(app).delete('/users/usuarioSegundo').expect(201);
  });
  
  it('Should not find a user by ID', async () => {
    await request(app).delete('/users/usuarioRandom').expect(404);
  });
});