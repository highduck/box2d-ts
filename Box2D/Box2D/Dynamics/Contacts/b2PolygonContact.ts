/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
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

import * as b2Settings from "../../Common/b2Settings";
import { b2Vec2, b2Transform } from "../../Common/b2Math";
import { b2CollidePolygons } from "../../Collision/b2CollidePolygon";
import { b2Manifold } from "../../Collision/b2Collision";
import { b2ShapeType } from "../../Collision/Shapes/b2Shape";
import { b2PolygonShape } from "../../Collision/Shapes/b2PolygonShape";
import { b2Contact } from "./b2Contact";
import { b2Fixture, b2FixtureDef } from "../b2Fixture";

export class b2PolygonContact extends b2Contact {
  constructor() {
    super(); // base class constructor
  }

  public static Create(allocator: any): b2Contact {
    return new b2PolygonContact();
  }

  public static Destroy(contact: b2Contact, allocator: any): void {
  }

  public Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void {
    super.Reset(fixtureA, indexA, fixtureB, indexB);
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    const shapeA = this.m_fixtureA.GetShape();
    const shapeB = this.m_fixtureB.GetShape();
    if (b2Settings.ENABLE_ASSERTS) { b2Settings.b2Assert(shapeA instanceof b2PolygonShape); }
    if (b2Settings.ENABLE_ASSERTS) { b2Settings.b2Assert(shapeB instanceof b2PolygonShape); }
    b2CollidePolygons(
      manifold,
      <b2PolygonShape> shapeA, xfA,
      <b2PolygonShape> shapeB, xfB);
  }
}
