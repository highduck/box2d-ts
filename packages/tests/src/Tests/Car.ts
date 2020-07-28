/*
* Copyright (c) 2006-2011 Erin Catto http://www.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// This is a fun demo that shows off the wheel joint
import {
    b2_pi,
    b2Body, b2BodyDef, b2BodyType, b2CircleShape, b2EdgeShape,
    b2FixtureDef,
    b2Max,
    b2PolygonShape,
    b2RevoluteJointDef,
    b2Vec2,
    b2WheelJoint, b2WheelJointDef
} from "@highduck/box2d";
import {DRAW_STRING_NEW_LINE, g_camera, g_debugDraw, Settings, Test} from "@highduck/box2d-testbed";

export class Car extends Test {
  public m_car: b2Body;
  public m_wheel1: b2Body;
  public m_wheel2: b2Body;
  public m_hz: number = 0.0;
  public m_zeta: number = 0.0;
  public m_speed: number = 0.0;
  public m_spring1: b2WheelJoint;
  public m_spring2: b2WheelJoint;

  constructor() {
    super();

    this.m_hz = 4.0;
    this.m_zeta = 0.7;
    this.m_speed = 50.0;

    let ground: b2Body;
    {
      const bd: b2BodyDef = new b2BodyDef();
      ground = this.m_world.CreateBody(bd);

      const shape: b2EdgeShape = new b2EdgeShape();

      const fd: b2FixtureDef = new b2FixtureDef();
      fd.shape = shape;
      fd.density = 0.0;
      fd.friction = 0.6;

      shape.Set(new b2Vec2(-20.0, 0.0), new b2Vec2(20.0, 0.0));
      ground.CreateFixture(fd);

      const hs: number[] = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

      let x: number = 20.0, y1: number = 0.0;
      const dx: number = 5.0;

      for (let i: number = 0; i < 10; ++i) {
        const y2: number = hs[i];
        shape.Set(new b2Vec2(x, y1), new b2Vec2(x + dx, y2));
        ground.CreateFixture(fd);
        y1 = y2;
        x += dx;
      }

      for (let i: number = 0; i < 10; ++i) {
        const y2: number = hs[i];
        shape.Set(new b2Vec2(x, y1), new b2Vec2(x + dx, y2));
        ground.CreateFixture(fd);
        y1 = y2;
        x += dx;
      }

      shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
      ground.CreateFixture(fd);

      x += 80.0;
      shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
      ground.CreateFixture(fd);

      x += 40.0;
      shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 10.0, 5.0));
      ground.CreateFixture(fd);

      x += 20.0;
      shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
      ground.CreateFixture(fd);

      x += 40.0;
      shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x, 20.0));
      ground.CreateFixture(fd);
    }

    // Teeter
    {
      const bd: b2BodyDef = new b2BodyDef();
      bd.position.Set(140.0, 1.0);
      bd.type = b2BodyType.b2_dynamicBody;
      const body: b2Body = this.m_world.CreateBody(bd);

      const box: b2PolygonShape = new b2PolygonShape();
      box.SetAsBox(10.0, 0.25);
      body.CreateFixture(box, 1.0);

      const jd: b2RevoluteJointDef = new b2RevoluteJointDef();
      jd.Initialize(ground, body, body.GetPosition());
      jd.lowerAngle = -8.0 * b2_pi / 180.0;
      jd.upperAngle = 8.0 * b2_pi / 180.0;
      jd.enableLimit = true;
      this.m_world.CreateJoint(jd);

      body.ApplyAngularImpulse(100.0);
    }

    // Bridge
    {
      const N: number = 20;
      const shape: b2PolygonShape = new b2PolygonShape();
      shape.SetAsBox(1.0, 0.125);

      const fd: b2FixtureDef = new b2FixtureDef();
      fd.shape = shape;
      fd.density = 1.0;
      fd.friction = 0.6;

      const jd: b2RevoluteJointDef = new b2RevoluteJointDef();

      let prevBody: b2Body = ground;
      for (let i: number = 0; i < N; ++i) {
        const bd: b2BodyDef = new b2BodyDef();
        bd.type = b2BodyType.b2_dynamicBody;
        bd.position.Set(161.0 + 2.0 * i, -0.125);
        const body: b2Body = this.m_world.CreateBody(bd);
        body.CreateFixture(fd);

        const anchor: b2Vec2 = new b2Vec2(160.0 + 2.0 * i, -0.125);
        jd.Initialize(prevBody, body, anchor);
        this.m_world.CreateJoint(jd);

        prevBody = body;
      }

      const anchor: b2Vec2 = new b2Vec2(160.0 + 2.0 * N, -0.125);
      jd.Initialize(prevBody, ground, anchor);
      this.m_world.CreateJoint(jd);
    }

    // Boxes
    {
      const box: b2PolygonShape = new b2PolygonShape();
      box.SetAsBox(0.5, 0.5);

      let body: b2Body;
      const bd: b2BodyDef = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;

      bd.position.Set(230.0, 0.5);
      body = this.m_world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 1.5);
      body = this.m_world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 2.5);
      body = this.m_world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 3.5);
      body = this.m_world.CreateBody(bd);
      body.CreateFixture(box, 0.5);

      bd.position.Set(230.0, 4.5);
      body = this.m_world.CreateBody(bd);
      body.CreateFixture(box, 0.5);
    }

    // Car
    {
      const chassis: b2PolygonShape = new b2PolygonShape();
      const vertices: b2Vec2[] = b2Vec2.MakeArray(8);
      vertices[0].Set(-1.5, -0.5);
      vertices[1].Set(1.5, -0.5);
      vertices[2].Set(1.5, 0.0);
      vertices[3].Set(0.0, 0.9);
      vertices[4].Set(-1.15, 0.9);
      vertices[5].Set(-1.5, 0.2);
      chassis.Set(vertices, 6);

      const circle: b2CircleShape = new b2CircleShape();
      circle.m_radius = 0.4;

      const bd: b2BodyDef = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 1.0);
      this.m_car = this.m_world.CreateBody(bd);
      this.m_car.CreateFixture(chassis, 1.0);

      const fd: b2FixtureDef = new b2FixtureDef();
      fd.shape = circle;
      fd.density = 1.0;
      fd.friction = 0.9;

      bd.position.Set(-1.0, 0.35);
      this.m_wheel1 = this.m_world.CreateBody(bd);
      this.m_wheel1.CreateFixture(fd);

      bd.position.Set(1.0, 0.4);
      this.m_wheel2 = this.m_world.CreateBody(bd);
      this.m_wheel2.CreateFixture(fd);

      const jd: b2WheelJointDef = new b2WheelJointDef();
      const axis: b2Vec2 = new b2Vec2(0.0, 1.0);

      jd.Initialize(this.m_car, this.m_wheel1, this.m_wheel1.GetPosition(), axis);
      jd.motorSpeed = 0.0;
      jd.maxMotorTorque = 20.0;
      jd.enableMotor = true;
      jd.frequencyHz = this.m_hz;
      jd.dampingRatio = this.m_zeta;
      this.m_spring1 = this.m_world.CreateJoint(jd);

      jd.Initialize(this.m_car, this.m_wheel2, this.m_wheel2.GetPosition(), axis);
      jd.motorSpeed = 0.0;
      jd.maxMotorTorque = 10.0;
      jd.enableMotor = false;
      jd.frequencyHz = this.m_hz;
      jd.dampingRatio = this.m_zeta;
      this.m_spring2 = this.m_world.CreateJoint(jd);
    }
  }

  public Keyboard(key: string): void {
    switch (key) {
    case "a":
      this.m_spring1.SetMotorSpeed(this.m_speed);
      break;

    case "s":
      this.m_spring1.SetMotorSpeed(0.0);
      break;

    case "d":
      this.m_spring1.SetMotorSpeed(-this.m_speed);
      break;

    case "q":
      this.m_hz = b2Max(0.0, this.m_hz - 1.0);
      this.m_spring1.SetSpringFrequencyHz(this.m_hz);
      this.m_spring2.SetSpringFrequencyHz(this.m_hz);
      break;

    case "e":
      this.m_hz += 1.0;
      this.m_spring1.SetSpringFrequencyHz(this.m_hz);
      this.m_spring2.SetSpringFrequencyHz(this.m_hz);
      break;
    }
  }

  public Step(settings: Settings): void {
    g_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, hz down = q, hz up = e");
    this.m_textLine += DRAW_STRING_NEW_LINE;
    g_debugDraw.DrawString(5, this.m_textLine, "frequency = " + this.m_hz.toFixed(2) + " hz, damping ratio = " + this.m_zeta.toFixed(2));
    this.m_textLine += DRAW_STRING_NEW_LINE;

    g_camera.m_center.x = this.m_car.GetPosition().x;
    super.Step(settings);
  }

  public static Create(): Test {
    return new Car();
  }
}
