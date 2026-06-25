import APIStream, { _resetStreamState, _getConcurrency } from '../src/Stream.mjs';

const makeFakeStream = () => new ReadableStream({
  start(c) { c.enqueue(new TextEncoder().encode('<r/>')); c.close(); }
});
const fakePM = { streamRequest: async () => makeFakeStream() };
const basePayload = () => ({ messages: [{ role: 'user', content: 'x' }], model: ['m'] });

const readAll = async (rs) => {
  const reader = rs.getReader();
  let out = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    out += new TextDecoder().decode(value);
  }
  return out;
};

describe('BUG-12: forcedConcurrency applies on every call', () => {
  beforeEach(() => _resetStreamState());
  afterEach(() => _resetStreamState());

  test('subsequent calls update the live (shared) queue concurrency', async () => {
    await APIStream({ ...basePayload(), forcedConcurrency: 5 }, fakePM);
    expect(_getConcurrency()).toBe(5);
    await APIStream({ ...basePayload(), forcedConcurrency: 1 }, fakePM);
    expect(_getConcurrency()).toBe(1); // was stuck at 5 before the fix
  });

  test('ignores an invalid forcedConcurrency instead of throwing', async () => {
    await APIStream({ ...basePayload(), forcedConcurrency: 'nonsense' }, fakePM);
    expect(_getConcurrency()).toBe(2); // DEFAULT_CONCURRENCY, not a p-queue throw
  });
});

// NOTE: BUG-11 was dead-code removal (the ongoingRequests tee path was never
// reachable), so this is a behavioral GUARD (green both ways), not a red->green
// regression test — it locks in that concurrent identical requests are not
// truncated, which a future (correct) coalescing implementation must preserve.
describe('BUG-11 (guard): concurrent identical requests each receive complete content', () => {
  beforeEach(() => _resetStreamState());
  afterEach(() => _resetStreamState());

  test('two concurrent identical requests both get the full body', async () => {
    const [s1, s2] = await Promise.all([
      APIStream(basePayload(), fakePM),
      APIStream(basePayload(), fakePM),
    ]);
    const [c1, c2] = await Promise.all([readAll(s1), readAll(s2)]);
    expect(c1).toContain('<r/>');
    expect(c2).toContain('<r/>');
  });
});

describe('BUG-23: concurrent identical requests coalesce into one upstream call', () => {
  beforeEach(() => _resetStreamState());
  afterEach(() => _resetStreamState());

  const slowPM = (counter) => ({
    streamRequest: async () => { counter.n++; await new Promise(r => setTimeout(r, 50)); return makeFakeStream(); }
  });

  test('two overlapping identical requests => one upstream call, both get full content', async () => {
    const c = { n: 0 };
    const [s1, s2] = await Promise.all([ APIStream(basePayload(), slowPM(c)), APIStream(basePayload(), slowPM(c)) ]);
    const [a, b] = await Promise.all([readAll(s1), readAll(s2)]);
    expect(c.n).toBe(1);                 // coalesced
    expect(a).toContain('<r/>');
    expect(b).toContain('<r/>');         // joiner gets the complete body, not a truncated tee
  });

  test('different requests are NOT coalesced', async () => {
    const c = { n: 0 };
    const [s1, s2] = await Promise.all([
      APIStream({ ...basePayload(), messages: [{ role: 'user', content: 'A' }] }, slowPM(c)),
      APIStream({ ...basePayload(), messages: [{ role: 'user', content: 'B' }] }, slowPM(c)),
    ]);
    await Promise.all([readAll(s1), readAll(s2)]);
    expect(c.n).toBe(2);                 // distinct hashes → independent calls
  });

  test('a failed in-flight request does not poison or hang joiners (they recover)', async () => {
    let n = 0;
    const flakyPM = { streamRequest: async () => {
      n++;
      await new Promise(r => setTimeout(r, 40));
      if (n === 1) throw new Error('upstream boom'); // leader fails
      return makeFakeStream();                        // joiner's own retry succeeds
    }};
    const [s1, s2] = await Promise.all([ APIStream(basePayload(), flakyPM), APIStream(basePayload(), flakyPM) ]);
    const [a, b] = await Promise.all([readAll(s1), readAll(s2)]);
    expect(n).toBe(2);                  // leader failed → joiner fell through to its own request
    expect((a + b)).toContain('<r/>');  // a joiner recovered with full content (no hang)
  });
});
