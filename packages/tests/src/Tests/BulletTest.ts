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
  b2_gjkStats,
  b2_toiStats,
  b2Body,
  b2BodyDef,
  b2BodyType,
  b2EdgeShape,
  b2PolygonShape,
  b2RandomRange,
  b2Vec2,
  b2Vec2_zero,
} from '@highduck/box2d';
import { DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test } from '@highduck/box2d-testbed';

export class BulletTest extends Test {
  public m_body: b2Body;
  public m_bullet: b2Body;
  public m_x = 0;

  constructor() {
    super();

    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      bd.position.Set(0.0, 0.0);
      /*b2Body*/
      const body = this.m_world.CreateBody(bd);

      /*b2EdgeShape*/
      const edge = new b2EdgeShape();

      edge.Set(new b2Vec2(-10.0, 0.0), new b2Vec2(10.0, 0.0));
      body.CreateFixture(edge, 0.0);

      /*b2PolygonShape*/
      const shape = new b2PolygonShape();
      shape.SetAsBox(0.2, 1.0, new b2Vec2(0.5, 1.0), 0.0);
      body.CreateFixture(shape, 0.0);
    }

    {
      /*b2BodyDef*/
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 4.0);

      /*b2PolygonShape*/
      const box = new b2PolygonShape();
      box.SetAsBox(2.0, 0.1);

      this.m_body = this.m_world.CreateBody(bd);
      this.m_body.CreateFixture(box, 1.0);

      box.SetAsBox(0.25, 0.25);

      //this.m_x = b2RandomRange(-1.0, 1.0);
      this.m_x = 0.20352793;
      bd.position.Set(this.m_x, 10.0);
      bd.bullet = true;

      this.m_bullet = this.m_world.CreateBody(bd);
      this.m_bullet.CreateFixture(box, 100.0);

      this.m_bullet.SetLinearVelocity(new b2Vec2(0.0, -50.0));
    }
  }

  public Launch() {
    this.m_body.SetTransformVec(new b2Vec2(0.0, 4.0), 0.0);
    this.m_body.SetLinearVelocity(b2Vec2_zero);
    this.m_body.SetAngularVelocity(0.0);

    this.m_x = b2RandomRange(-1.0, 1.0);
    this.m_bullet.SetTransformVec(new b2Vec2(this.m_x, 10.0), 0.0);
    this.m_bullet.SetLinearVelocity(new b2Vec2(0.0, -50.0));
    this.m_bullet.SetAngularVelocity(0.0);

    b2_gjkStats.Reset();
    b2_toiStats.Reset();
  }

  public Step(settings: Settings): void {
    super.Step(settings);

    if (b2_gjkStats.calls > 0) {
      // g_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
      g_debugDraw.DrawString(
        5,
        this.m_textLine,
        `gjk calls = ${b2_gjkStats.calls.toFixed(0)}, ave gjk iters = ${(
          b2_gjkStats.iters / b2_gjkStats.calls
        ).toFixed(1)}, max gjk iters = ${b2_gjkStats.maxIters.toFixed(0)}`,
      );
      this.m_textLine += DRAW_STRING_NEW_LINE;
    }

    if (b2_toiStats.calls > 0) {
      // g_debugDraw.DrawString(5, this.m_textLine, "toi calls = %d, ave toi iters = %3.1f, max toi iters = %d",
      g_debugDraw.DrawString(
        5,
        this.m_textLine,
        `toi calls = ${b2_toiStats.calls}, ave toi iters = ${(
          b2_toiStats.iters / b2_toiStats.calls
        ).toFixed(1)}, max toi iters = ${b2_toiStats.maxRootIters}`,
      );
      this.m_textLine += DRAW_STRING_NEW_LINE;

      // g_debugDraw.DrawString(5, this.m_textLine, "ave toi root iters = %3.1f, max toi root iters = %d",
      g_debugDraw.DrawString(
        5,
        this.m_textLine,
        `ave toi root iters = ${(b2_toiStats.rootIters / b2_toiStats.calls).toFixed(
          1,
        )}, max toi root iters = ${b2_toiStats.maxRootIters}`,
      );
      this.m_textLine += DRAW_STRING_NEW_LINE;
    }

    if (this.m_stepCount % 60 === 0) {
      this.Launch();
    }
  }

  public static Create(): Test {
    return new BulletTest();
  }
}
