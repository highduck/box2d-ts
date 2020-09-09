/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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

import { b2Assert, b2Maybe } from '../../common/b2Settings';
import { b2Vec2, XY } from '../../common/b2Math';
import { b2Body } from '../b2Body';
import { b2SolverData } from '../b2TimeStep';

export const enum b2JointType {
  e_unknownJoint = 0,
  e_revoluteJoint = 1,
  e_prismaticJoint = 2,
  e_distanceJoint = 3,
  e_pulleyJoint = 4,
  e_mouseJoint = 5,
  e_gearJoint = 6,
  e_wheelJoint = 7,
  e_weldJoint = 8,
  e_frictionJoint = 9,
  e_ropeJoint = 10,
  e_motorJoint = 11,
  e_areaJoint = 12,
}

export const enum b2LimitState {
  e_inactiveLimit = 0,
  e_atLowerLimit = 1,
  e_atUpperLimit = 2,
  e_equalLimits = 3,
}

export class b2Jacobian {
  readonly linear = new b2Vec2();
  angularA = 0;
  angularB = 0;

  SetZero(): b2Jacobian {
    this.linear.SetZero();
    this.angularA = 0;
    this.angularB = 0;
    return this;
  }

  Set(x: XY, a1: number, a2: number): b2Jacobian {
    this.linear.Copy(x);
    this.angularA = a1;
    this.angularB = a2;
    return this;
  }
}

/// A joint edge is used to connect bodies and joints together
/// in a joint graph where each body is a node and each joint
/// is an edge. A joint edge belongs to a doubly linked list
/// maintained in each attached body. Each joint has two joint
/// nodes, one for each attached body.
export class b2JointEdge {
  private _other: b2Body | null = null; ///< provides quick access to the other body attached.
  get other(): b2Body {
    !!B2_DEBUG && b2Assert(this._other !== null);
    return this._other!;
  }

  set other(value: b2Body) {
    !!B2_DEBUG && b2Assert(this._other === null);
    this._other = value;
  }

  readonly joint: b2Joint; ///< the joint
  prev: b2JointEdge | null = null; ///< the previous joint edge in the body's joint list
  next: b2JointEdge | null = null; ///< the next joint edge in the body's joint list
  constructor(joint: b2Joint) {
    this.joint = joint;
  }

  Reset(): void {
    this._other = null;
    this.prev = null;
    this.next = null;
  }
}

/// Joint definitions are used to construct joints.
export interface b2IJointDef {
  /// The joint type is set automatically for concrete joint types.
  type: b2JointType;

  /// Use this to attach application specific data to your joints.
  userData?: any;

  /// The first attached body.
  bodyA: b2Body;

  /// The second attached body.
  bodyB: b2Body;

  /// Set this flag to true if the attached bodies should collide.
  collideConnected?: boolean;
}

/// Joint definitions are used to construct joints.
export abstract class b2JointDef implements b2IJointDef {
  /// The joint type is set automatically for concrete joint types.
  readonly type: b2JointType = b2JointType.e_unknownJoint;

  /// Use this to attach application specific data to your joints.
  userData: any = null;

  /// The first attached body.
  bodyA!: b2Body;

  /// The second attached body.
  bodyB!: b2Body;

  /// Set this flag to true if the attached bodies should collide.
  collideConnected = false;

  constructor(type: b2JointType) {
    this.type = type;
  }
}

/// The base joint class. Joints are used to constraint two bodies together in
/// various fashions. Some joints also feature limits and motors.
export abstract class b2Joint {
  readonly m_type: b2JointType = b2JointType.e_unknownJoint;
  m_prev: b2Joint | null = null;
  m_next: b2Joint | null = null;
  readonly m_edgeA: b2JointEdge = new b2JointEdge(this);
  readonly m_edgeB: b2JointEdge = new b2JointEdge(this);
  m_bodyA: b2Body;
  m_bodyB: b2Body;

  m_islandFlag = false;
  m_collideConnected = false;

  m_userData: any = null;

  _logIndex = 0;

  constructor(def: b2IJointDef) {
    !!B2_DEBUG && b2Assert(def.bodyA !== def.bodyB);

    this.m_type = def.type;
    this.m_edgeA.other = def.bodyB;
    this.m_edgeB.other = def.bodyA;
    this.m_bodyA = def.bodyA;
    this.m_bodyB = def.bodyB;

    this.m_collideConnected = b2Maybe(def.collideConnected, false);

    this.m_userData = b2Maybe(def.userData, null);
  }

  /// Get the type of the concrete joint.
  GetType(): b2JointType {
    return this.m_type;
  }

  /// Get the first body attached to this joint.
  GetBodyA(): b2Body {
    return this.m_bodyA;
  }

  /// Get the second body attached to this joint.
  GetBodyB(): b2Body {
    return this.m_bodyB;
  }

  /// Get the anchor point on bodyA in world coordinates.
  abstract GetAnchorA<T extends XY>(out: T): T;

  /// Get the anchor point on bodyB in world coordinates.
  abstract GetAnchorB<T extends XY>(out: T): T;

  /// Get the reaction force on bodyB at the joint anchor in Newtons.
  abstract GetReactionForce<T extends XY>(inv_dt: number, out: T): T;

  /// Get the reaction torque on bodyB in N*m.
  abstract GetReactionTorque(inv_dt: number): number;

  /// Get the next joint the world joint list.
  GetNext(): b2Joint | null {
    return this.m_next;
  }

  /// Get the user data pointer.
  GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data pointer.
  SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Short-cut function to determine if either body is inactive.
  IsActive(): boolean {
    return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
  }

  /// Get collide connected.
  /// Note: modifying the collide connect flag won't work correctly because
  /// the flag is only checked when fixture AABBs begin to overlap.
  GetCollideConnected(): boolean {
    return this.m_collideConnected;
  }

  /// Shift the origin for any points stored in world coordinates.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ShiftOrigin(newOrigin: XY): void {}

  abstract InitVelocityConstraints(data: b2SolverData): void;

  abstract SolveVelocityConstraints(data: b2SolverData): void;

  // This returns true if the position errors are within tolerance.
  abstract SolvePositionConstraints(data: b2SolverData): boolean;
}
