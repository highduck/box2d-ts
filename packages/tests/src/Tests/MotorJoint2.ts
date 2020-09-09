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

// Adapted from MotorJoint.h

import {
  b2Body,
  b2BodyDef,
  b2BodyType,
  b2CircleShape,
  b2EdgeShape,
  b2FixtureDef,
  b2MotorJoint,
  b2MotorJointDef,
  b2Vec2,
} from '@highduck/box2d';
import { Settings, Test } from '@highduck/box2d-testbed';

export class MotorJoint2 extends Test {
  constructor() {
    super();

    let ground: b2Body;
    {
      const bd = new b2BodyDef();
      ground = this.m_world.CreateBody(bd);

      const shape = new b2EdgeShape();
      shape.Set(new b2Vec2(-20.0, 0.0), new b2Vec2(20.0, 0.0));

      const fd = new b2FixtureDef();
      fd.shape = shape;

      ground.CreateFixture(fd);
    }

    // b2Body * body1 = NULL;
    let body1: b2Body;
    {
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 4.0);
      body1 = this.m_world.CreateBody(bd);

      const shape = new b2CircleShape();
      shape.m_radius = 1.0;

      const fd = new b2FixtureDef();
      fd.shape = shape;
      fd.friction = 0.6;
      fd.density = 2.0;
      body1.CreateFixture(fd);
    }

    // b2Body * body2 = NULL;
    let body2: b2Body;
    {
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(4.0, 8.0);
      body2 = this.m_world.CreateBody(bd);

      const shape = new b2CircleShape();
      shape.m_radius = 1.0;

      const fd = new b2FixtureDef();
      fd.shape = shape;
      fd.friction = 0.6;
      fd.density = 2.0;
      body2.CreateFixture(fd);
    }

    {
      const mjd = new b2MotorJointDef();
      mjd.Initialize(body1, body2);
      mjd.maxForce = 1000.0;
      mjd.maxTorque = 1000.0;
      this.m_joint = this.m_world.CreateJoint(mjd) as b2MotorJoint;
    }
  }

  // b2MotorJoint* m_joint;
  public m_joint: b2MotorJoint;

  public Step(settings: Settings): void {
    super.Step(settings);
  }

  public static Create(): Test {
    return new MotorJoint2();
  }
}
