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

import { b2_pi, b2MakeNumberArray, b2Max, b2Min, b2Rope, b2RopeDef, b2Vec2 } from '@highduck/box2d';
import { DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test } from '@highduck/box2d-testbed';

export class Rope extends Test {
  public m_rope = new b2Rope();
  public m_angle = 0.0;

  constructor() {
    super();

    /*const int32*/
    const N = 40;
    /*b2Vec2[]*/
    const vertices = b2Vec2.MakeArray(N);
    /*float32[]*/
    const masses = b2MakeNumberArray(N);

    for (let i = 0; i < N; ++i) {
      vertices[i].Set(0.0, 20.0 - 0.25 * i);
      masses[i] = 1.0;
    }
    masses[0] = 0.0;
    masses[1] = 0.0;

    /*b2RopeDef*/
    const def = new b2RopeDef();
    def.vertices = vertices;
    def.count = N;
    def.gravity.Set(0.0, -10.0);
    def.masses = masses;
    def.damping = 0.1;
    def.k2 = 1.0;
    def.k3 = 0.5;

    this.m_rope.Initialize(def);

    this.m_angle = 0.0;
    this.m_rope.SetAngle(this.m_angle);
  }

  public Keyboard(key: string) {
    switch (key) {
      case 'q':
        this.m_angle = b2Max(-b2_pi, this.m_angle - 0.05 * b2_pi);
        this.m_rope.SetAngle(this.m_angle);
        break;

      case 'e':
        this.m_angle = b2Min(b2_pi, this.m_angle + 0.05 * b2_pi);
        this.m_rope.SetAngle(this.m_angle);
        break;
    }
  }

  public Step(settings: Settings): void {
    let dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;
    if (settings.pause && !settings.singleStep) {
      dt = 0.0;
    }

    this.m_rope.Step(dt, 1);

    super.Step(settings);

    this.m_rope.Draw(g_debugDraw);

    g_debugDraw.DrawString(5, this.m_textLine, 'Press (q,e) to adjust target angle');
    this.m_textLine += DRAW_STRING_NEW_LINE;
    g_debugDraw.DrawString(
      5,
      this.m_textLine,
      `Target angle = ${((this.m_angle * 180.0) / b2_pi).toFixed(2)} degrees`,
    );
    this.m_textLine += DRAW_STRING_NEW_LINE;
  }

  public static Create(): Test {
    return new Rope();
  }
}
