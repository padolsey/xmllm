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
