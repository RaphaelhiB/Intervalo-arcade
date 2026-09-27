import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpServer } from '../server/index.js';

test('servidor entrega a página e os módulos JavaScript', async () => {
  const server = createHttpServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    const module = await fetch(`${base}/src/client/main.js`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Intervalo Arcade/);
    assert.equal(module.status, 200);
    assert.match(module.headers.get('content-type'), /javascript/);
  } finally {
    server.close();
  }
});

test('servidor rejeita caminhos fora do projeto', async () => {
  const server = createHttpServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/../package.json`);
    assert.equal(response.status, 404);
  } finally {
    server.close();
  }
});
