import {b2_epsilon, b2Abs, b2MassData, b2PolygonShape, b2Vec2} from "../..";

describe("collision test", ()=> {
  it("polygon mass data", ()=> {
    const center = new b2Vec2(100.0, -50.0);
    const hx = 0.5;
    const hy = 1.5;
    const angle1 = 0.25;

    // Data from issue #422. Not used because the data exceeds accuracy limits.
    //const b2Vec2 center(-15000.0f, -15000.0f);
    //const float hx = 0.72f, hy = 0.72f;
    //const float angle1 = 0.0f;

    const polygon1 = new b2PolygonShape();
    polygon1.SetAsBox(hx, hy, center, angle1);

    const absTol = 2.0 * b2_epsilon;
    const relTol = 2.0 * b2_epsilon;

    expect(b2Abs(polygon1.m_centroid.x - center.x) < absTol + relTol * b2Abs(center.x))
      .toStrictEqual(true);
    expect(b2Abs(polygon1.m_centroid.y - center.y) < absTol + relTol * b2Abs(center.y));

    const vertices:b2Vec2[] = [
      new b2Vec2(center.x - hx, center.y - hy),
      new b2Vec2(center.x + hx, center.y - hy),
      new b2Vec2(center.x - hx, center.y + hy),
      new b2Vec2(center.x + hx, center.y + hy),
    ];

    const polygon2 = new b2PolygonShape();
    polygon2.Set(vertices, 4);

    expect(b2Abs(polygon2.m_centroid.x - center.x) < absTol + relTol * b2Abs(center.x));
    expect(b2Abs(polygon2.m_centroid.y - center.y) < absTol + relTol * b2Abs(center.y));

    const mass = 4.0 * hx * hy;
    const inertia = (mass / 3.0) * (hx * hx + hy * hy) + mass * center.Dot(center);

    const massData1 = new b2MassData();
    polygon1.ComputeMass(massData1, 1.0);

    expect(b2Abs(massData1.center.x - center.x) < absTol + relTol * b2Abs(center.x));
    expect(b2Abs(massData1.center.y - center.y) < absTol + relTol * b2Abs(center.y));
    expect(b2Abs(massData1.mass - mass) < 20.0 * (absTol + relTol * mass));
    expect(b2Abs(massData1.I - inertia) < 40.0 * (absTol + relTol * inertia));

    const massData2 = new b2MassData();
    polygon2.ComputeMass(massData2, 1.0);

    expect(b2Abs(massData2.center.x - center.x) < absTol + relTol * b2Abs(center.x));
    expect(b2Abs(massData2.center.y - center.y) < absTol + relTol * b2Abs(center.y));
    expect(b2Abs(massData2.mass - mass) < 20.0 * (absTol + relTol * mass));
    expect(b2Abs(massData2.I - inertia) < 40.0 * (absTol + relTol * inertia));
  });
});
