/*
 * Copyright (c) 2006-2009 Erin Catto http://www.org
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

import { Settings, Test } from '@highduck/box2d-testbed';
import { b2Body, b2BodyDef, b2BodyType, b2CircleShape, b2EdgeShape, b2Vec2 } from '@highduck/box2d';

export class SphereStack extends Test {
  public static readonly e_count: number = 10;

  public m_bodies: b2Body[] = [];

  constructor() {
    super();

    {
      const bd: b2BodyDef = new b2BodyDef();
      const ground: b2Body = this.m_world.CreateBody(bd);

      const shape: b2EdgeShape = new b2EdgeShape();
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
      ground.CreateFixture(shape, 0.0);
    }

    {
      const shape: b2CircleShape = new b2CircleShape();
      shape.m_radius = 1.0;

      for (let i = 0; i < SphereStack.e_count; ++i) {
        const bd: b2BodyDef = new b2BodyDef();
        bd.type = b2BodyType.b2_dynamicBody;
        bd.position.Set(0.0, 4.0 + 3.0 * i);

        this.m_bodies[i] = this.m_world.CreateBody(bd);

        this.m_bodies[i].CreateFixture(shape, 1.0);

        this.m_bodies[i].SetLinearVelocity(new b2Vec2(0.0, -50.0));
      }
    }
  }

  public Step(settings: Settings): void {
    super.Step(settings);

    // for (let i: number = 0; i < SphereStack.e_count; ++i)
    // {
    //   printf("%g ", this.m_bodies[i].GetWorldCenter().y);
    // }

    // for (let i: number = 0; i < SphereStack.e_count; ++i)
    // {
    //   printf("%g ", this.m_bodies[i].GetLinearVelocity().y);
    // }

    // printf("\n");
  }

  public static Create(): Test {
    return new SphereStack();
  }
}
