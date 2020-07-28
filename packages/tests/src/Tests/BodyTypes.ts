/*
* Copyright (c) 2006-2012 Erin Catto http://www.org
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

import {
    b2_pi,
    b2Body, b2BodyDef, b2BodyType, b2EdgeShape,
    b2FixtureDef,
    b2PolygonShape,
    b2PrismaticJointDef,
    b2RevoluteJointDef,
    b2Vec2
} from "@highduck/box2d";
import {DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test} from "@highduck/box2d-testbed";

export class BodyTypes extends Test {
  public m_attachment: b2Body;
  public m_platform: b2Body;
  public m_speed = 0;

  constructor() {
    super();

    /*b2BodyDef*/
    const bd = new b2BodyDef();
    const ground = this.m_world.CreateBody(bd);

    /*b2EdgeShape*/
    const shape = new b2EdgeShape();
    shape.Set(new b2Vec2(-20.0, 0.0), new b2Vec2(20.0, 0.0));

    /*b2FixtureDef*/
    const fd = new b2FixtureDef();
    fd.shape = shape;

    ground.CreateFixture(fd);

    // Define attachment
    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 3.0);
      this.m_attachment = this.m_world.CreateBody(bd);

      /*b2PolygonShape*/
      const shape = new b2PolygonShape();
      shape.SetAsBox(0.5, 2.0);
      this.m_attachment.CreateFixture(shape, 2.0);
    }

    // Define platform
    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(-4.0, 5.0);
      this.m_platform = this.m_world.CreateBody(bd);

      /*b2PolygonShape*/
      const shape = new b2PolygonShape();
      shape.SetAsBox(0.5, 4.0, new b2Vec2(4.0, 0.0), 0.5 * b2_pi);

      /*b2FixtureDef*/
      const fd = new b2FixtureDef();
      fd.shape = shape;
      fd.friction = 0.6;
      fd.density = 2.0;
      this.m_platform.CreateFixture(fd);

      /*b2RevoluteJointDef*/
      const rjd = new b2RevoluteJointDef();
      rjd.Initialize(this.m_attachment, this.m_platform, new b2Vec2(0.0, 5.0));
      rjd.maxMotorTorque = 50.0;
      rjd.enableMotor = true;
      this.m_world.CreateJoint(rjd);

      /*b2PrismaticJointDef*/
      const pjd = new b2PrismaticJointDef();
      pjd.Initialize(ground, this.m_platform, new b2Vec2(0.0, 5.0), new b2Vec2(1.0, 0.0));

      pjd.maxMotorForce = 1000.0;
      pjd.enableMotor = true;
      pjd.lowerTranslation = -10.0;
      pjd.upperTranslation = 10.0;
      pjd.enableLimit = true;

      this.m_world.CreateJoint(pjd);

      this.m_speed = 3.0;
    }

    // Create a payload
    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 8.0);
      /*b2Body*/
      const body = this.m_world.CreateBody(bd);

      /*b2PolygonShape*/
      const shape = new b2PolygonShape();
      shape.SetAsBox(0.75, 0.75);

      /*b2FixtureDef*/
      const fd = new b2FixtureDef();
      fd.shape = shape;
      fd.friction = 0.6;
      fd.density = 2.0;

      body.CreateFixture(fd);
    }
  }

  public Keyboard(key: string) {
    switch (key) {
      case "d":
        this.m_platform.SetType(b2BodyType.b2_dynamicBody);
        break;

      case "s":
        this.m_platform.SetType(b2BodyType.b2_staticBody);
        break;

      case "k":
        this.m_platform.SetType(b2BodyType.b2_kinematicBody);
        this.m_platform.SetLinearVelocity(new b2Vec2(-this.m_speed, 0.0));
        this.m_platform.SetAngularVelocity(0.0);
        break;
    }
  }

  public Step(settings: Settings): void {
    // Drive the kinematic body.
    if (this.m_platform.GetType() === b2BodyType.b2_kinematicBody) {
      /*b2Vec2*/
      const p = this.m_platform.GetTransform().p;
      /*b2Vec2*/
      const v = this.m_platform.GetLinearVelocity();

      if ((p.x < -10.0 && v.x < 0.0) ||
        (p.x > 10.0 && v.x > 0.0)) {
        this.m_platform.SetLinearVelocity(new b2Vec2(-v.x, v.y));
      }
    }

    super.Step(settings);
    g_debugDraw.DrawString(5, this.m_textLine, "Keys: (d) dynamic, (s) static, (k) kinematic");
    this.m_textLine += DRAW_STRING_NEW_LINE;
  }

  public static Create(): Test {
    return new BodyTypes();
  }
}
