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

import { b2_linearSlop, b2Assert } from '../../common/b2Settings';
import { b2Sqrt, b2Sweep } from '../../common/b2Math';
import {
  b2ContactID,
  b2Manifold,
  b2ManifoldPoint,
  b2TestOverlapShape,
  b2WorldManifold,
} from '../../collision/b2Collision';
import { b2TimeOfImpact, b2TOIInput, b2TOIOutput } from '../../collision/b2TimeOfImpact';
import { b2Body } from '../b2Body';
import { b2Fixture } from '../b2Fixture';
import { b2Shape, b2ShapeType } from '../../collision/shapes/b2Shape';
import { b2ContactListener } from '../b2WorldCallbacks';
import { b2CollideCircles, b2CollidePolygonAndCircle } from '../../collision/b2CollideCircle';
import { b2CircleShape } from '../../collision/shapes/b2CircleShape';
import { b2PolygonShape } from '../../collision/shapes/b2PolygonShape';
import { b2CollidePolygons } from '../../collision/b2CollidePolygon';
import { b2CollideEdgeAndCircle, b2CollideEdgeAndPolygon } from '../../collision/b2CollideEdge';
import { b2EdgeShape } from '../../collision/shapes/b2EdgeShape';
import { b2ChainShape } from '../../collision/shapes/b2ChainShape';

/// Friction mixing law. The idea is to allow either fixture to drive the friction to zero.
/// For example, anything slides on ice.
function b2MixFriction(friction1: number, friction2: number): number {
  return b2Sqrt(friction1 * friction2);
}

/// Restitution mixing law. The idea is allow for anything to bounce off an inelastic surface.
/// For example, a superball bounces on anything.
function b2MixRestitution(restitution1: number, restitution2: number): number {
  return restitution1 > restitution2 ? restitution1 : restitution2;
}

export class b2ContactEdge {
  readonly contact: b2Contact;
  private _other: b2Body | null = null; ///< provides quick access to the other body attached.
  prev: b2ContactEdge | null = null; ///< the previous contact edge in the body's contact list
  next: b2ContactEdge | null = null; ///< the next contact edge in the body's contact list

  constructor(contact: b2Contact) {
    this.contact = contact;
  }

  Reset(): void {
    this._other = null;
    this.prev = null;
    this.next = null;
  }

  get other(): b2Body {
    B2_ASSERT && b2Assert(this._other !== null);
    return this._other!;
  }

  set other(value: b2Body) {
    B2_ASSERT && b2Assert(this._other === null);
    this._other = value;
  }
}

const ComputeTOI_s_input = new b2TOIInput();
const ComputeTOI_s_output = new b2TOIOutput();
const Evaluate_s_edge = new b2EdgeShape();

const Evaluate = (contact: b2Contact) => {
  const xfA = contact.m_fixtureA.m_body.m_xf;
  const xfB = contact.m_fixtureB.m_body.m_xf;
  const typeA = contact.m_fixtureA._shapeType;
  const typeB = contact.m_fixtureB._shapeType;
  const shapeA = contact.m_fixtureA.m_shape;
  const shapeB = contact.m_fixtureB.m_shape;
  const manifold = contact.m_manifold;
  const indexA = contact.m_indexA;
  const pt = (typeA << 2) | typeB;
  if (pt === ((b2ShapeType.e_circleShape << 2) | b2ShapeType.e_circleShape)) {
    b2CollideCircles(manifold, shapeA as b2CircleShape, xfA, shapeB as b2CircleShape, xfB);
  } else if (pt === ((b2ShapeType.e_polygonShape << 2) | b2ShapeType.e_circleShape)) {
    b2CollidePolygonAndCircle(
      manifold,
      shapeA as b2PolygonShape,
      xfA,
      shapeB as b2CircleShape,
      xfB,
    );
  } else if (pt === ((b2ShapeType.e_polygonShape << 2) | b2ShapeType.e_polygonShape)) {
    b2CollidePolygons(manifold, shapeA as b2PolygonShape, xfA, shapeB as b2PolygonShape, xfB);
  } else if (pt === ((b2ShapeType.e_edgeShape << 2) | b2ShapeType.e_circleShape)) {
    b2CollideEdgeAndCircle(manifold, shapeA as b2EdgeShape, xfA, shapeB as b2CircleShape, xfB);
  } else if (pt === ((b2ShapeType.e_edgeShape << 2) | b2ShapeType.e_polygonShape)) {
    b2CollideEdgeAndPolygon(manifold, shapeA as b2EdgeShape, xfA, shapeB as b2PolygonShape, xfB);
  } else if (pt === ((b2ShapeType.e_chainShape << 2) | b2ShapeType.e_circleShape)) {
    (shapeA as b2ChainShape).GetChildEdge(Evaluate_s_edge, indexA);
    b2CollideEdgeAndCircle(manifold, Evaluate_s_edge, xfA, shapeB as b2CircleShape, xfB);
  } else if (pt === ((b2ShapeType.e_chainShape << 2) | b2ShapeType.e_polygonShape)) {
    (shapeA as b2ChainShape).GetChildEdge(Evaluate_s_edge, indexA);
    b2CollideEdgeAndPolygon(manifold, Evaluate_s_edge, xfA, shapeB as b2PolygonShape, xfB);
  }
};

export class b2Contact<A extends b2Shape = b2Shape, B extends b2Shape = b2Shape> {
  m_prev: b2Contact | null = null;
  m_next: b2Contact | null = null;

  readonly m_nodeA: b2ContactEdge = new b2ContactEdge(this);
  readonly m_nodeB: b2ContactEdge = new b2ContactEdge(this);

  m_fixtureA: b2Fixture = (null as unknown) as b2Fixture;
  m_fixtureB: b2Fixture = (null as unknown) as b2Fixture;

  m_indexA = 0;
  m_indexB = 0;

  m_manifold = new b2Manifold(); // TODO: readonly

  m_toiCount = 0;
  m_toi = NaN;
  m_friction = NaN;
  m_restitution = NaN;
  m_tangentSpeed = NaN;

  m_oldManifold = new b2Manifold(); // TODO: readonly

  m_islandFlag = false; /// Used when crawling contact graph when forming islands.
  m_touchingFlag = false; /// Set when the shapes are touching.
  m_enabledFlag = false; /// This contact can be disabled (by user)
  m_filterFlag = false; /// This contact needs filtering because a fixture filter was changed.
  m_bulletHitFlag = false; /// This bullet contact had a TOI event
  m_toiFlag = false; /// This contact has a valid TOI in m_toi

  constructor() {
    this.m_toi = 0.0;
    this.m_friction = 0.0;
    this.m_restitution = 0.0;
    this.m_tangentSpeed = 0.0;
  }

  GetManifold() {
    return this.m_manifold;
  }

  GetWorldManifold(worldManifold: b2WorldManifold): void {
    worldManifold.Initialize(
      this.m_manifold,
      this.m_fixtureA.m_body.m_xf,
      this.m_fixtureA._shapeRadius,
      this.m_fixtureB.m_body.m_xf,
      this.m_fixtureB._shapeRadius,
    );
  }

  IsTouching(): boolean {
    return this.m_touchingFlag;
  }

  SetEnabled(flag: boolean): void {
    this.m_enabledFlag = flag;
  }

  IsEnabled(): boolean {
    return this.m_enabledFlag;
  }

  GetNext(): b2Contact | null {
    return this.m_next;
  }

  GetFixtureA(): b2Fixture {
    return this.m_fixtureA;
  }

  GetChildIndexA(): number {
    return this.m_indexA;
  }

  GetShapeA(): A {
    return this.m_fixtureA.GetShape() as A;
  }

  GetFixtureB(): b2Fixture {
    return this.m_fixtureB;
  }

  GetChildIndexB(): number {
    return this.m_indexB;
  }

  GetShapeB(): B {
    return this.m_fixtureB.GetShape() as B;
  }

  FlagForFiltering(): void {
    this.m_filterFlag = true;
  }

  SetFriction(friction: number): void {
    this.m_friction = friction;
  }

  GetFriction(): number {
    return this.m_friction;
  }

  ResetFriction(): void {
    this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
  }

  SetRestitution(restitution: number): void {
    this.m_restitution = restitution;
  }

  GetRestitution(): number {
    return this.m_restitution;
  }

  ResetRestitution(): void {
    this.m_restitution = b2MixRestitution(
      this.m_fixtureA.m_restitution,
      this.m_fixtureB.m_restitution,
    );
  }

  SetTangentSpeed(speed: number): void {
    this.m_tangentSpeed = speed;
  }

  GetTangentSpeed(): number {
    return this.m_tangentSpeed;
  }

  Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void {
    this.m_islandFlag = false;
    this.m_touchingFlag = false;
    this.m_enabledFlag = true;
    this.m_filterFlag = false;
    this.m_bulletHitFlag = false;
    this.m_toiFlag = false;

    this.m_fixtureA = fixtureA;
    this.m_fixtureB = fixtureB;

    this.m_indexA = indexA;
    this.m_indexB = indexB;

    this.m_manifold.pointCount = 0;

    this.m_prev = null;
    this.m_next = null;

    this.m_nodeA.Reset();
    this.m_nodeB.Reset();

    this.m_toiCount = 0;

    this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
    this.m_restitution = b2MixRestitution(
      this.m_fixtureA.m_restitution,
      this.m_fixtureB.m_restitution,
    );
  }

  Update(listener: b2ContactListener): void {
    const tManifold: b2Manifold = this.m_oldManifold;
    this.m_oldManifold = this.m_manifold;
    this.m_manifold = tManifold;

    // Re-enable this contact.
    this.m_enabledFlag = true;

    let touching = false;
    const wasTouching: boolean = this.m_touchingFlag;

    const sensorA = this.m_fixtureA.IsSensor();
    const sensorB = this.m_fixtureB.IsSensor();
    const sensor = sensorA || sensorB;

    const bodyA = this.m_fixtureA.GetBody();
    const bodyB = this.m_fixtureB.GetBody();
    const xfA = bodyA.GetTransform();
    const xfB = bodyB.GetTransform();
    const shapeA: A = this.GetShapeA();
    const shapeB: B = this.GetShapeB();

    // Is this contact a sensor?
    if (sensor) {
      touching = b2TestOverlapShape(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);

      // Sensors don't generate manifolds.
      this.m_manifold.pointCount = 0;
    } else {
      Evaluate(this);
      touching = this.m_manifold.pointCount > 0;

      // Match old contact ids to new contact ids and copy the
      // stored impulses to warm start the solver.
      for (let i = 0; i < this.m_manifold.pointCount; ++i) {
        const mp2: b2ManifoldPoint = this.m_manifold.points[i];
        mp2.normalImpulse = 0;
        mp2.tangentImpulse = 0;
        const id2: b2ContactID = mp2.id;

        for (let j = 0; j < this.m_oldManifold.pointCount; ++j) {
          const mp1: b2ManifoldPoint = this.m_oldManifold.points[j];

          if (mp1.id.key === id2.key) {
            mp2.normalImpulse = mp1.normalImpulse;
            mp2.tangentImpulse = mp1.tangentImpulse;
            break;
          }
        }
      }

      if (touching !== wasTouching) {
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);
      }
    }

    this.m_touchingFlag = touching;

    if (!wasTouching && touching) {
      listener.BeginContact(this);
    }

    if (wasTouching && !touching) {
      listener.EndContact(this);
    }

    if (!sensor && touching) {
      listener.PreSolve(this, this.m_oldManifold);
    }
  }

  ComputeTOI(sweepA: b2Sweep, sweepB: b2Sweep): number {
    const input = ComputeTOI_s_input;
    input.proxyA.SetShape(this.GetShapeA(), this.m_indexA);
    input.proxyB.SetShape(this.GetShapeB(), this.m_indexB);
    input.sweepA.Copy(sweepA);
    input.sweepB.Copy(sweepB);
    input.tMax = b2_linearSlop;

    const output = ComputeTOI_s_output;

    b2TimeOfImpact(output, input);

    return output.t;
  }
}
