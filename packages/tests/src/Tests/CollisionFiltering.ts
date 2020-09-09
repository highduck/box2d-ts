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
  b2BodyDef,
  b2BodyType,
  b2CircleShape,
  b2EdgeShape,
  b2FixtureDef,
  b2PolygonShape,
  b2PrismaticJointDef,
  b2Vec2,
} from '@highduck/box2d';
import { Settings, Test } from '@highduck/box2d-testbed';

export class CollisionFiltering extends Test {
  public static readonly k_smallGroup = 1;
  public static readonly k_largeGroup = -1;
  public static readonly k_defaultCategory = 0x0001;
  public static readonly k_triangleCategory = 0x0002;
  public static readonly k_boxCategory = 0x0004;
  public static readonly k_circleCategory = 0x0008;
  public static readonly k_triangleMask = 0xffff;
  public static readonly k_boxMask = 0xffff ^ CollisionFiltering.k_triangleCategory;
  public static readonly k_circleMask = 0xffff;

  constructor() {
    super();

    // Ground body
    {
      const shape = new b2EdgeShape();
      shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));

      const sd = new b2FixtureDef();
      sd.shape = shape;
      sd.friction = 0.3;

      const bd = new b2BodyDef();
      const ground = this.m_world.CreateBody(bd);
      ground.CreateFixture(sd);
    }

    // Small triangle
    const vertices = [];
    vertices[0] = new b2Vec2(-1.0, 0.0);
    vertices[1] = new b2Vec2(1.0, 0.0);
    vertices[2] = new b2Vec2(0.0, 2.0);
    const polygon = new b2PolygonShape();
    polygon.Set(vertices, 3);

    const triangleShapeDef = new b2FixtureDef();
    triangleShapeDef.shape = polygon;
    triangleShapeDef.density = 1.0;

    triangleShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
    triangleShapeDef.filter.categoryBits = CollisionFiltering.k_triangleCategory;
    triangleShapeDef.filter.maskBits = CollisionFiltering.k_triangleMask;

    const triangleBodyDef = new b2BodyDef();
    triangleBodyDef.type = b2BodyType.b2_dynamicBody;
    triangleBodyDef.position.Set(-5.0, 2.0);

    const body1 = this.m_world.CreateBody(triangleBodyDef);
    body1.CreateFixture(triangleShapeDef);

    // Large triangle (recycle definitions)
    vertices[0].SelfMul(2.0);
    vertices[1].SelfMul(2.0);
    vertices[2].SelfMul(2.0);
    polygon.Set(vertices, 3);
    triangleShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
    triangleBodyDef.position.Set(-5.0, 6.0);
    triangleBodyDef.fixedRotation = true; // look at me!

    const body2 = this.m_world.CreateBody(triangleBodyDef);
    body2.CreateFixture(triangleShapeDef);

    {
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      bd.position.Set(-5.0, 10.0);
      const body = this.m_world.CreateBody(bd);

      const p = new b2PolygonShape();
      p.SetAsBox(0.5, 1.0);
      body.CreateFixture(p, 1.0);

      const jd = new b2PrismaticJointDef();
      jd.bodyA = body2;
      jd.bodyB = body;
      jd.enableLimit = true;
      jd.localAnchorA.Set(0.0, 4.0);
      jd.localAnchorB.SetZero();
      jd.localAxisA.Set(0.0, 1.0);
      jd.lowerTranslation = -1.0;
      jd.upperTranslation = 1.0;

      this.m_world.CreateJoint(jd);
    }

    // Small box
    polygon.SetAsBox(1.0, 0.5);
    const boxShapeDef = new b2FixtureDef();
    boxShapeDef.shape = polygon;
    boxShapeDef.density = 1.0;
    boxShapeDef.restitution = 0.1;

    boxShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
    boxShapeDef.filter.categoryBits = CollisionFiltering.k_boxCategory;
    boxShapeDef.filter.maskBits = CollisionFiltering.k_boxMask;

    const boxBodyDef = new b2BodyDef();
    boxBodyDef.type = b2BodyType.b2_dynamicBody;
    boxBodyDef.position.Set(0.0, 2.0);

    const body3 = this.m_world.CreateBody(boxBodyDef);
    body3.CreateFixture(boxShapeDef);

    // Large box (recycle definitions)
    polygon.SetAsBox(2.0, 1.0);
    boxShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
    boxBodyDef.position.Set(0.0, 6.0);

    const body4 = this.m_world.CreateBody(boxBodyDef);
    body4.CreateFixture(boxShapeDef);

    // Small circle
    const circle = new b2CircleShape();
    circle.m_radius = 1.0;

    const circleShapeDef = new b2FixtureDef();
    circleShapeDef.shape = circle;
    circleShapeDef.density = 1.0;

    circleShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
    circleShapeDef.filter.categoryBits = CollisionFiltering.k_circleCategory;
    circleShapeDef.filter.maskBits = CollisionFiltering.k_circleMask;

    const circleBodyDef = new b2BodyDef();
    circleBodyDef.type = b2BodyType.b2_dynamicBody;
    circleBodyDef.position.Set(5.0, 2.0);

    const body5 = this.m_world.CreateBody(circleBodyDef);
    body5.CreateFixture(circleShapeDef);

    // Large circle
    circle.m_radius *= 2.0;
    circleShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
    circleBodyDef.position.Set(5.0, 6.0);

    const body6 = this.m_world.CreateBody(circleBodyDef);
    body6.CreateFixture(circleShapeDef);
  }

  public Step(settings: Settings): void {
    super.Step(settings);
  }

  public static Create(): Test {
    return new CollisionFiltering();
  }
}
