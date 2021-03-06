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

import { b2_epsilon, b2_pi, b2Assert, b2Maybe } from '../../common/b2Settings';
import { b2IsValid, b2Mat22, b2Rot, b2Transform, b2Vec2, XY } from '../../common/b2Math';
import { b2IJointDef, b2Joint, b2JointDef, b2JointType } from './b2Joint';
import { b2SolverData } from '../b2TimeStep';

export interface b2IMouseJointDef extends b2IJointDef {
  target?: XY;

  maxForce?: number;

  frequencyHz?: number;

  dampingRatio?: number;
}

/// Mouse joint definition. This requires a world target point,
/// tuning parameters, and the time step.
export class b2MouseJointDef extends b2JointDef implements b2IMouseJointDef {
  readonly target: b2Vec2 = new b2Vec2();

  maxForce = 0;

  frequencyHz = 5;

  dampingRatio = 0.7;

  constructor() {
    super(b2JointType.e_mouseJoint);
  }
}

export class b2MouseJoint extends b2Joint {
  readonly m_localAnchorB: b2Vec2 = new b2Vec2();
  readonly m_targetA: b2Vec2 = new b2Vec2();
  m_frequencyHz = 0;
  m_dampingRatio = 0;
  m_beta = 0;

  // Solver shared
  readonly m_impulse: b2Vec2 = new b2Vec2();
  m_maxForce = 0;
  m_gamma = 0;

  // Solver temp
  m_indexA = 0;
  m_indexB = 0;
  readonly m_rB: b2Vec2 = new b2Vec2();
  readonly m_localCenterB: b2Vec2 = new b2Vec2();
  m_invMassB = 0;
  m_invIB = 0;
  readonly m_mass: b2Mat22 = new b2Mat22();
  readonly m_C: b2Vec2 = new b2Vec2();
  readonly m_qB: b2Rot = new b2Rot();
  readonly m_lalcB: b2Vec2 = new b2Vec2();
  readonly m_K: b2Mat22 = new b2Mat22();

  constructor(def: b2IMouseJointDef) {
    super(def);

    this.m_targetA.Copy(b2Maybe(def.target, b2Vec2.ZERO));
    !!B2_DEBUG && b2Assert(this.m_targetA.IsValid());
    b2Transform.MulTXV(this.m_bodyB.GetTransform(), this.m_targetA, this.m_localAnchorB);

    this.m_maxForce = b2Maybe(def.maxForce, 0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_maxForce) && this.m_maxForce >= 0);
    this.m_impulse.SetZero();

    this.m_frequencyHz = b2Maybe(def.frequencyHz, 0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_frequencyHz) && this.m_frequencyHz >= 0);
    this.m_dampingRatio = b2Maybe(def.dampingRatio, 0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_dampingRatio) && this.m_dampingRatio >= 0);

    this.m_beta = 0;
    this.m_gamma = 0;
  }

  SetTarget(target: b2Vec2): void {
    if (!this.m_bodyB.IsAwake()) {
      this.m_bodyB.SetAwake(true);
    }
    this.m_targetA.Copy(target);
  }

  GetTarget() {
    return this.m_targetA;
  }

  SetMaxForce(maxForce: number): void {
    this.m_maxForce = maxForce;
  }

  GetMaxForce() {
    return this.m_maxForce;
  }

  SetFrequency(hz: number): void {
    this.m_frequencyHz = hz;
  }

  GetFrequency() {
    return this.m_frequencyHz;
  }

  SetDampingRatio(ratio: number) {
    this.m_dampingRatio = ratio;
  }

  GetDampingRatio() {
    return this.m_dampingRatio;
  }

  InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIB = this.m_bodyB.m_invI;

    const cB = data.positions[this.m_indexB].c;
    const aB = data.positions[this.m_indexB].a;
    const vB = data.velocities[this.m_indexB].v;
    let wB = data.velocities[this.m_indexB].w;

    const qB = this.m_qB.SetAngle(aB);

    const mass = this.m_bodyB.GetMass();

    // Frequency
    const omega = 2 * b2_pi * this.m_frequencyHz;

    // Damping coefficient
    const d = 2 * mass * this.m_dampingRatio * omega;

    // Spring stiffness
    const k = mass * (omega * omega);

    // magic formulas
    // gamma has units of inverse mass.
    // beta has units of inverse time.
    const h = data.step.dt;
    !!B2_DEBUG && b2Assert(d + h * k > b2_epsilon);
    this.m_gamma = h * (d + h * k);
    if (this.m_gamma !== 0) {
      this.m_gamma = 1 / this.m_gamma;
    }
    this.m_beta = h * k * this.m_gamma;

    // Compute the effective mass matrix.
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
    //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
    //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
    const K = this.m_K;
    K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
    K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
    K.ey.x = K.ex.y;
    K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;

    K.GetInverse(this.m_mass);

    // m_C = cB + m_rB - m_targetA;
    this.m_C.x = cB.x + this.m_rB.x - this.m_targetA.x;
    this.m_C.y = cB.y + this.m_rB.y - this.m_targetA.y;
    // m_C *= m_beta;
    this.m_C.SelfMul(this.m_beta);

    // Cheat with some damping
    wB *= 0.98;

    if (data.step.warmStarting) {
      this.m_impulse.SelfMul(data.step.dtRatio);
      // vB += m_invMassB * m_impulse;
      vB.x += this.m_invMassB * this.m_impulse.x;
      vB.y += this.m_invMassB * this.m_impulse.y;
      wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, this.m_impulse);
    } else {
      this.m_impulse.SetZero();
    }

    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_Cdot = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse = new b2Vec2();
  private static SolveVelocityConstraints_s_oldImpulse = new b2Vec2();

  SolveVelocityConstraints(data: b2SolverData): void {
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // Cdot = v + cross(w, r)
    // b2Vec2 Cdot = vB + b2Cross(wB, m_rB);
    const Cdot: b2Vec2 = b2Vec2.AddVCrossSV(
      vB,
      wB,
      this.m_rB,
      b2MouseJoint.SolveVelocityConstraints_s_Cdot,
    );
    //  b2Vec2 impulse = b2Mul(m_mass, -(Cdot + m_C + m_gamma * m_impulse));
    const impulse: b2Vec2 = b2Mat22.MulMV(
      this.m_mass,
      b2Vec2
        .AddVV(
          Cdot,
          b2Vec2.AddVV(
            this.m_C,
            b2Vec2.MulSV(this.m_gamma, this.m_impulse, b2Vec2.s_t0),
            b2Vec2.s_t0,
          ),
          b2Vec2.s_t0,
        )
        .SelfNeg(),
      b2MouseJoint.SolveVelocityConstraints_s_impulse,
    );

    // b2Vec2 oldImpulse = m_impulse;
    const oldImpulse = b2MouseJoint.SolveVelocityConstraints_s_oldImpulse.Copy(this.m_impulse);
    // m_impulse += impulse;
    this.m_impulse.SelfAdd(impulse);
    const maxImpulse: number = data.step.dt * this.m_maxForce;
    if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
      this.m_impulse.SelfMul(maxImpulse / this.m_impulse.Length());
    }
    // impulse = m_impulse - oldImpulse;
    b2Vec2.SubVV(this.m_impulse, oldImpulse, impulse);

    // vB += m_invMassB * impulse;
    vB.SelfMulAdd(this.m_invMassB, impulse);
    wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, impulse);

    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  SolvePositionConstraints(data: b2SolverData): boolean {
    return true;
  }

  GetAnchorA<T extends XY>(out: T): T {
    out.x = this.m_targetA.x;
    out.y = this.m_targetA.y;
    return out;
  }

  GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    return b2Vec2.MulSV(inv_dt, this.m_impulse, out);
  }

  GetReactionTorque(inv_dt: number): number {
    return 0;
  }

  ShiftOrigin(newOrigin: b2Vec2) {
    this.m_targetA.SelfSub(newOrigin);
  }
}
