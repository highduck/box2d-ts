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
    b2Body,
    b2BodyDef,
    b2BodyType,
    b2CircleShape,
    b2EdgeShape,
    b2Fixture,
    b2PolygonShape,
    b2Vec2
} from "@highduck/box2d";
import {DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test} from "@highduck/box2d-testbed";

export class ShapeEditing extends Test {
  public m_body: b2Body;
  public m_fixture1: b2Fixture;
  public m_fixture2: b2Fixture | null = null;
  public m_sensor = false;

  constructor() {
    super();

    {
      const bd = new b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      const shape = new b2EdgeShape();
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
      ground.CreateFixture(shape, 0.0);
    }

    const bd = new b2BodyDef();
    bd.type = b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 10.0);
    this.m_body = this.m_world.CreateBody(bd);

    const shape = new b2PolygonShape();
    shape.SetAsBox(4.0, 4.0, new b2Vec2(0.0, 0.0), 0.0);
    this.m_fixture1 = this.m_body.CreateFixture(shape, 10.0);
  }

  public Keyboard(key: string) {
    switch (key) {
      case "c":
        if (this.m_fixture2 === null) {
          const shape = new b2CircleShape();
          shape.m_radius = 3.0;
          shape.m_p.Set(0.5, -4.0);
          this.m_fixture2 = this.m_body.CreateFixture(shape, 10.0);
          this.m_body.SetAwake(true);
        }
        break;

      case "d":
        if (this.m_fixture2 !== null) {
          this.m_body.DestroyFixture(this.m_fixture2);
          this.m_fixture2 = null;
          this.m_body.SetAwake(true);
        }
        break;

      case "s":
        if (this.m_fixture2 !== null) {
          this.m_sensor = !this.m_sensor;
          this.m_fixture2.SetSensor(this.m_sensor);
        }
        break;
    }
  }

  public Step(settings: Settings): void {
    super.Step(settings);
    g_debugDraw.DrawString(5, this.m_textLine, "Press: (c) create a shape, (d) destroy a shape.");
    this.m_textLine += DRAW_STRING_NEW_LINE;
    g_debugDraw.DrawString(5, this.m_textLine, `sensor = ${(this.m_sensor) ? (1) : (0)}`);
    this.m_textLine += DRAW_STRING_NEW_LINE;
  }

  public static Create(): Test {
    return new ShapeEditing();
  }
}
