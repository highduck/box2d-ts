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

import {b2AreaJointDef, b2BodyDef, b2BodyType, b2CircleShape, b2EdgeShape, b2FixtureDef, b2Vec2} from "@highduck/box2d";
import {Settings, Test} from "@highduck/box2d-testbed";

export class BlobTest extends Test {
  constructor() {
    super();

    const ground = this.m_world.CreateBody(new b2BodyDef());

    {
      const shape = new b2EdgeShape();
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
      ground.CreateFixture(shape, 0.0);
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(-40.0, 25.0));
      ground.CreateFixture(shape, 0.0);
      shape.Set(new b2Vec2(40.0, 0.0), new b2Vec2(40.0, 25.0));
      ground.CreateFixture(shape, 0.0);
    }

    {
      const ajd = new b2AreaJointDef();

      const cx = 0.0;
      const cy = 10.0;
      const rx = 5.0;
      const ry = 5.0;
      const nBodies = 20;
      const bodyRadius = 0.5;
      for (let i = 0; i < nBodies; ++i) {
        const angle = (i * 2.0 * Math.PI) / nBodies;
        const bd = new b2BodyDef();
        //bd.isBullet = true;
        bd.fixedRotation = true;

        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        bd.position.Set(x, y);
        bd.type = b2BodyType.b2_dynamicBody;
        const body = this.m_world.CreateBody(bd);

        const fd = new b2FixtureDef();
        fd.shape = new b2CircleShape(bodyRadius);
        fd.density = 1.0;
        body.CreateFixture(fd);

        ajd.AddBody(body);
      }

      ajd.frequencyHz = 10.0;
      ajd.dampingRatio = 1.0;
      this.m_world.CreateJoint(ajd);
    }
  }

  public Step(settings: Settings): void {
    super.Step(settings);
  }

  public static Create(): Test {
    return new BlobTest();
  }
}
