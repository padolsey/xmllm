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
        console.log('thing99', thing99);
        yield thing99;
      },

      reduce((acc, item) => {
        console.log('>>', {acc, item})
        return { ...acc, ...item };
      }, {}),

      filter(r => r.activities && r.exercises && r.baby_names),

      function*(thing77) {
        console.log('thing77', thing77);
        yield thing77;
      },

      // function*(results) {
      //   const [namesResult, activitiesExercisesResult] = results.flat();
      //   console.log('Names result:', JSON.stringify(namesResult, null, 2));
      //   console.log('Activities and exercises result:', JSON.stringify(activitiesExercisesResult, null, 2));
        
      //   const combinedResult = {
      //     baby_names: namesResult.baby_names,
      //     activities: activitiesExercisesResult.activities,
      //     exercises: activitiesExercisesResult.exercises
      //   };
        
      //   console.log('Combined result:', JSON.stringify(combinedResult, null, 2));
      //   yield combinedResult;
      // }
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