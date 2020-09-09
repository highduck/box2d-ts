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

import {
  b2_polygonRadius,
  b2Color,
  b2Distance,
  b2DistanceInput,
  b2DistanceOutput,
  b2ShapeCast,
  b2ShapeCastInput,
  b2ShapeCastOutput,
  b2SimplexCache,
  b2Transform,
  b2Vec2,
} from '@highduck/box2d';
import { DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test } from '@highduck/box2d-testbed';

export class ShapeCast extends Test {
  public static e_vertexCount = 8;

  public m_vAs: b2Vec2[] = [];
  public m_countA = 0;
  public m_radiusA = 0;

  public m_vBs: b2Vec2[] = [];
  public m_countB = 0;
  public m_radiusB = 0;

  constructor() {
    super();

    // #if 1
    this.m_vAs[0] = new b2Vec2(-0.5, 1.0);
    this.m_vAs[1] = new b2Vec2(0.5, 1.0);
    this.m_vAs[2] = new b2Vec2(0.0, 0.0);
    this.m_countA = 3;
    this.m_radiusA = b2_polygonRadius;

    this.m_vBs[0] = new b2Vec2(-0.5, -0.5);
    this.m_vBs[1] = new b2Vec2(0.5, -0.5);
    this.m_vBs[2] = new b2Vec2(0.5, 0.5);
    this.m_vBs[3] = new b2Vec2(-0.5, 0.5);
    this.m_countB = 4;
    this.m_radiusB = b2_polygonRadius;
    // #else
    // this.m_vAs[0] = new b2Vec2(0.0, 0.0);
    // this.m_countA = 1;
    // this.m_radiusA = 0.5;

    // this.m_vBs[0] = new b2Vec2(0.0, 0.0);
    // this.m_countB = 1;
    // this.m_radiusB = 0.5;
    // #endif
  }

  public Step(settings: Settings): void {
    super.Step(settings);

    const transformA = new b2Transform();
    transformA.p.Set(0.0, 0.25);
    transformA.q.SetIdentity();

    const transformB = new b2Transform();
    transformB.SetIdentity();

    const input = new b2ShapeCastInput();
    input.proxyA.SetVerticesRadius(this.m_vAs, this.m_countA, this.m_radiusA);
    input.proxyB.SetVerticesRadius(this.m_vBs, this.m_countB, this.m_radiusB);
    input.transformA.Copy(transformA);
    input.transformB.Copy(transformB);
    input.translationB.Set(8.0, 0.0);

    const output = new b2ShapeCastOutput();

    const hit = b2ShapeCast(output, input);

    const transformB2 = new b2Transform();
    transformB2.q.Copy(transformB.q);
    // transformB2.p = transformB.p + output.lambda * input.translationB;
    transformB2.p.Copy(transformB.p).SelfMulAdd(output.lambda, input.translationB);

    const distanceInput = new b2DistanceInput();
    distanceInput.proxyA.SetVerticesRadius(this.m_vAs, this.m_countA, this.m_radiusA);
    distanceInput.proxyB.SetVerticesRadius(this.m_vBs, this.m_countB, this.m_radiusB);
    distanceInput.transformA.Copy(transformA);
    distanceInput.transformB.Copy(transformB2);
    distanceInput.useRadii = false;
    const simplexCache = new b2SimplexCache();
    simplexCache.count = 0;
    const distanceOutput = new b2DistanceOutput();

    b2Distance(distanceOutput, simplexCache, distanceInput);

    g_debugDraw.DrawString(
      5,
      this.m_textLine,
      `hit = ${hit ? 'true' : 'false'}, iters = ${output.iterations}, lambda = ${
        output.lambda
      }, distance = ${distanceOutput.distance.toFixed(5)}`,
    );
    this.m_textLine += DRAW_STRING_NEW_LINE;

    g_debugDraw.PushTransform(transformA);
    // g_debugDraw.DrawCircle(this.m_vAs[0], this.m_radiusA, new b2Color(0.9, 0.9, 0.9));
    g_debugDraw.DrawPolygon(this.m_vAs, this.m_countA, new b2Color(0.9, 0.9, 0.9));
    g_debugDraw.PopTransform(transformA);

    g_debugDraw.PushTransform(transformB);
    // g_debugDraw.DrawCircle(this.m_vBs[0], this.m_radiusB, new b2Color(0.5, 0.9, 0.5));
    g_debugDraw.DrawPolygon(this.m_vBs, this.m_countB, new b2Color(0.5, 0.9, 0.5));
    g_debugDraw.PopTransform(transformB);

    g_debugDraw.PushTransform(transformB2);
    // g_debugDraw.DrawCircle(this.m_vBs[0], this.m_radiusB, new b2Color(0.5, 0.7, 0.9));
    g_debugDraw.DrawPolygon(this.m_vBs, this.m_countB, new b2Color(0.5, 0.7, 0.9));
    g_debugDraw.PopTransform(transformB2);

    if (hit) {
      const p1 = output.point;
      g_debugDraw.DrawPoint(p1, 10.0, new b2Color(0.9, 0.3, 0.3));
      // b2Vec2 p2 = p1 + output.normal;
      const p2 = b2Vec2.AddVV(p1, output.normal, new b2Vec2());
      g_debugDraw.DrawSegment(p1, p2, new b2Color(0.9, 0.3, 0.3));
    }
  }

  public static Create(): Test {
    return new ShapeCast();
  }
}
