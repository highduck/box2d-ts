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

import {Test} from "@highduck/box2d-testbed";
import {b2BodyDef, b2BodyType, b2CircleShape, b2EdgeShape, b2Vec2} from "@highduck/box2d";

export class HeavyOnLight extends Test {
  constructor() {
    super();

    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      /*b2Body*/
      const ground = this.m_world.CreateBody(bd);

      /*b2EdgeShape*/
      const shape = new b2EdgeShape();
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
      ground.CreateFixture(shape, 0.0);
    }

    /*b2BodyDef*/
    const bd = new b2BodyDef();
    bd.type = b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 0.5);
    /*b2Body*/
    let body = this.m_world.CreateBody(bd);

    /*b2CircleShape*/
    const shape = new b2CircleShape();
    shape.m_radius = 0.5;
    body.CreateFixture(shape, 10.0);

    bd.position.Set(0.0, 6.0);
    body = this.m_world.CreateBody(bd);
    shape.m_radius = 5.0;
    body.CreateFixture(shape, 10.0);
  }

  public static Create() {
    return new HeavyOnLight();
  }
}
