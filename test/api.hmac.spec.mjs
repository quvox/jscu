import jscu from '../src/index.mjs';

import chai from 'chai';
// const should = chai.should();
const expect = chai.expect;


const hashes = ['SHA-256', 'SHA-384', 'SHA-512'];
describe('HMAC test', () => {
  let msg;
  before( async () => {
    msg = new Uint8Array(32);
    for(let i = 0; i < 32; i++) msg[i] = 0xFF & i;
  });

  it('HMAC successfully generates unique MAC for unique key', async function () {
    this.timeout(20000);
    await Promise.all(hashes.map( async (hash) => {
      const keya = await jscu.crypto.random.getRandomBytes(32);
      const keyb = await jscu.crypto.random.getRandomBytes(32);
      const da = await jscu.crypto.hmac.getMac(keya, msg, hash);
      const db = await jscu.crypto.hmac.getMac(keyb, msg, hash);
      expect(da).to.be.a('Uint8Array');
      expect(db).to.be.a('Uint8Array');
      expect(da.toString() === db.toString(), `failed at ${hash}`).to.be.false;
    }));
  });

  it('If msg is overwritten, it can be detected via MAC', async function () {
    this.timeout(20000);
    await Promise.all(hashes.map( async (hash) => {
      const key = await jscu.crypto.random.getRandomBytes(32);
      const d = await jscu.crypto.hmac.getMac(key, msg, hash);

      const dx = await jscu.crypto.hmac.getMac(key, msg, hash);

      expect(d.toString() === dx.toString(), `failed at ${hash}`).to.be.true;

      const newmsg = Object.assign({}, {x: msg}).x;
      newmsg[1] = 0x33;
      const dy = await jscu.crypto.hmac.getMac(key, newmsg, hash);


      expect(d.toString() === dy.toString(), `failed at ${hash}`).to.be.false;
    }));
  });
});

