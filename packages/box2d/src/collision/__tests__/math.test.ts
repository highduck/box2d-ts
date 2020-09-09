import { b2Sweep, b2Transform } from '../..';

describe('math test', () => {
  it('sweep', () => {
    // From issue #447
    const sweep = new b2Sweep();
    sweep.localCenter.SetZero();
    sweep.c0.Set(3.0, 4.0);
    sweep.c.Set(3.0, 4.0);
    sweep.a0 = 0.0;
    sweep.a = 0.0;
    sweep.alpha0 = 0.0;

    const transform = new b2Transform();
    sweep.GetTransform(transform, 0.6);

    expect(transform.p.x).toStrictEqual(sweep.c0.x);
    expect(transform.p.y).toStrictEqual(sweep.c0.y);
  });
});
