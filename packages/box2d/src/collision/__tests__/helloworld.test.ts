import { b2BodyDef, b2BodyType, b2FixtureDef, b2PolygonShape, b2Vec2, b2World } from '../..';

test('hello world', () => {
  // Define the gravity vector.
  const gravity = new b2Vec2(0, -10);

  // Construct a world object, which will hold and simulate the rigid bodies.
  const world = new b2World(gravity);

  // Define the ground body.
  const groundBodyDef = new b2BodyDef();
  groundBodyDef.position.Set(0, -10);

  // Call the body factory which allocates memory for the ground body
  // from a pool and creates the ground box shape (also from a pool).
  // The body is also added to the world.
  const groundBody = world.CreateBody(groundBodyDef);

  // Define the ground box shape.
  const groundBox = new b2PolygonShape();

  // The extents are the half-widths of the box.
  groundBox.SetAsBox(50.0, 10.0);

  // Add the ground fixture to the ground body.
  groundBody.CreateFixture(groundBox, 0.0);

  // Define the dynamic body. We set its position and call the body factory.
  const bodyDef = new b2BodyDef();
  bodyDef.type = b2BodyType.b2_dynamicBody;
  bodyDef.position.Set(0.0, 4.0);
  const body = world.CreateBody(bodyDef);

  // Define another box shape for our dynamic body.
  const dynamicBox = new b2PolygonShape();
  dynamicBox.SetAsBox(1.0, 1.0);

  // Define the dynamic body fixture.
  const fixtureDef = new b2FixtureDef();
  fixtureDef.shape = dynamicBox;

  // Set the box density to be non-zero, so it will be dynamic.
  fixtureDef.density = 1.0;

  // Override the default friction.
  fixtureDef.friction = 0.3;

  // Add the shape to the body.
  body.CreateFixture(fixtureDef);

  // Prepare for simulation. Typically we use a time step of 1/60 of a
  // second (60Hz) and 10 iterations. This provides a high quality simulation
  // in most game scenarios.
  const timeStep = 1.0 / 60.0;
  const velocityIterations = 6;
  const positionIterations = 2;

  let position = body.GetPosition();
  let angle = body.GetAngle();

  // This is our little game loop.
  for (let i = 0; i < 60; ++i) {
    // Instruct the world to perform a single step of simulation.
    // It is generally best to keep the time step and iterations fixed.
    world.Step(timeStep, velocityIterations, positionIterations);

    // Now print the position and angle of the body.
    position = body.GetPosition();
    angle = body.GetAngle();

    // printf("%4.2f %4.2f %4.2f\n", position.x, position.y, angle);
  }

  // When the world destructor is called, all bodies and joints are freed. This can
  // create orphaned pointers, so be careful about your world management.

  expect(position.x).toBeCloseTo(0.0);
  // TODO:
  expect(position.y).toBeCloseTo(1.0, 1);
  expect(angle).toBeCloseTo(0.0);
});
