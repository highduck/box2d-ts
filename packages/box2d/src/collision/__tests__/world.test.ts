import {b2BodyDef, b2BodyType, b2CircleShape, b2Contact, b2ContactListener, b2Vec2, b2World} from "../..";

let begin_contact = false;

class MyContactListener extends b2ContactListener
{
  BeginContact(contact:b2Contact) {
    begin_contact = true;
  }
}

test("begin contact", ()=>
{
  const world = new b2World(new b2Vec2());
  world.SetContactListener(new MyContactListener());

  const circle = new b2CircleShape();
  circle.m_radius = 5;

  const bodyDef = new b2BodyDef();
  bodyDef.type = b2BodyType.b2_dynamicBody;

  const bodyA = world.CreateBody(bodyDef);
  const bodyB = world.CreateBody(bodyDef);
  bodyA.CreateFixture(circle, 0.0);
  bodyB.CreateFixture(circle, 0.0);

  bodyA.SetTransformXY(0, 0, 0);
  bodyB.SetTransformXY(100, 0, 0);

  const timeStep = 1.0 / 60.0;
  const velocityIterations = 6;
  const positionIterations = 2;

  world.Step(timeStep, velocityIterations, positionIterations);

  expect(world.GetContactList()).toBeNull();
  expect(begin_contact).toBe(false);

  bodyB.SetTransformXY(1, 0, 0);

  world.Step(timeStep, velocityIterations, positionIterations);

  expect(world.GetContactList()).not.toBeNull();
  expect(begin_contact).toBe( true);
});
