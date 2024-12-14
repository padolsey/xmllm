import xmllm from '../src/xmllm';

describe('xmllm - Gathering results from multiple prompts', () => {
  it('should gather baby names, activities, and exercises from separate prompts', async () => {
    const stream = await xmllm(({ filter, prompt, merge, reduce }) => [
      [
        prompt(
          'Give me some fun baby names',
          {
            baby_names: { name: [String] }
          },
          null,
          '<thinking><baby_names><name>Luna</name><name>Zion</name><name>Nova</name></baby_names></thinking>'
        ),
        prompt(
          'Give me some fun baby activities and exercises',
          {
            activities: { activity: [String] },
            exercises: { exercise: [String] }
          },
          null,
          '<thinking><activities><activity>Peekaboo</activity><activity>Singing</activity></activities><exercises><exercise>Tummy time</exercise><exercise>Leg bicycling</exercise></exercises></thinking>'
        )
      ],

      function*(thing99) {
        // if (thing99 == null) return; // avoid implicit stream start value
        yield thing99;
      },

      reduce((acc, item) => {
        return { ...acc, ...item };
      }, {}),

      filter(r => r.activities && r.exercises && r.baby_names),

      function*(thing77) {
        yield thing77;
      }
    ]);

    const results = [];
    for await (const r of stream) {
      results.push(r);
    }

    console.log('Final results:', JSON.stringify(results, null, 2));

    // expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      baby_names: {
        name: ['Luna', 'Zion', 'Nova']
      },
      activities: {
        activity: ['Peekaboo', 'Singing']
      },
      exercises: {
        exercise: ['Tummy time', 'Leg bicycling']
      }
    });
  });
});