import xmllm from '../src/xmllm.mjs';

describe('xmllm - Accrue functionality', () => {
  it('should accrue all results and allow processing on the entire collection', async () => {
    const stream = xmllm(({ accrue }) => [
      function*() {
        yield 'apple';
        yield 'banana';
        yield 'mango';
      },
      accrue(),
      function*(everything) {
        yield everything.join(' ');
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual(['apple banana mango']);
  });

  it('should handle an array yielded as a single item', async () => {
    const stream = xmllm(({ accrue }) => [
      function*() {
        yield ['apple', 'banana', 'mango'];
      },
      accrue(),
      function*(everything) {
        yield everything.flat().join(' ');
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual(['apple banana mango']);
  });

  it('should allow further processing after accrue', async () => {
    const stream = xmllm(({ map, accrue }) => [
      [1,2,3,4,5],
      map(x => x * 2),
      accrue(),
      function*(everything) {
        yield everything.reduce((sum, num) => sum + num, 0);
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual([30]); // Sum of [2, 4, 6, 8, 10]
  });

  // Async delay test:
  it('should handle async delay', async () => {
    const stream = xmllm(({ accrue }) => [
      async function*() {
        yield 'apple';
        yield 'banana';
        await new Promise(resolve => setTimeout(resolve, 100));
        yield 'mango';
      },
      accrue(),
      function*(everything) {
        yield everything.join(' ');
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual(['apple banana mango']);
  });

  it('should handle empty input', async () => {
    const stream = xmllm(({ accrue }) => [
      function*() {
        // yield nothing
      },
      accrue(),
      function*(everything) {
        yield everything.length;
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual([0]);
  });

  it('should work with multiple accrue steps', async () => {
    const stream = xmllm(({ accrue, map }) => [
      function*() {
        yield 1;
        yield 2;
        yield 3;
      },
      accrue(),
      map(arr => arr.map(x => x * 2)),
      accrue(),
      function*(everything) {
        yield everything.flat().join(', ');
      }
    ]);

    const results = await stream.all();
    expect(results).toEqual(['2, 4, 6']);
  });
});
