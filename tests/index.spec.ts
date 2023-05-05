import 'mocha'
import { expect } from 'chai'
import { holaMundo } from "../src/index.js";

describe('Tests', () => {
  it('Prueba', () => {
    expect(holaMundo('Hola Mundo')).to.be.eql('Hola Mundo');
  });
});