/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

import { b2Assert } from '../common/b2Settings';
import { b2IsValid, b2Rot, b2Sweep, b2Transform, b2Vec2, XY } from '../common/b2Math';
import { b2MassData, b2Shape } from '../collision/shapes/b2Shape';
import { b2ContactEdge } from './contacts/b2Contact';
import { b2JointEdge } from './joints/b2Joint';
import { b2Fixture, b2FixtureDef, b2IFixtureDef } from './b2Fixture';
import { b2World } from './b2World';
import { b2ControllerEdge } from '../controllers/b2Controller';

/// The body type.
/// static: zero mass, zero velocity, may be manually moved
/// kinematic: zero mass, non-zero velocity set by user, moved by solver
/// dynamic: positive mass, non-zero velocity determined by forces, moved by solver
export const enum b2BodyType {
  b2_unknown = -1,
  b2_staticBody = 0,
  b2_kinematicBody = 1,
  b2_dynamicBody = 2,

  // TODO_ERIN
  // b2_bulletBody = 3
}

export interface b2IBodyDef {
  /// The body type: static, kinematic, or dynamic.
  /// Note: if a dynamic body would have zero mass, the mass is set to one.
  type?: b2BodyType;

  /// The world position of the body. Avoid creating bodies at the origin
  /// since this can lead to many overlapping shapes.
  position?: XY;

  /// The world angle of the body in radians.
  angle?: number;

  /// The linear velocity of the body's origin in world co-ordinates.
  linearVelocity?: XY;

  /// The angular velocity of the body.
  angularVelocity?: number;

  /// Linear damping is use to reduce the linear velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  /// Units are 1/time
  linearDamping?: number;

  /// Angular damping is use to reduce the angular velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  /// Units are 1/time
  angularDamping?: number;

  /// Set this flag to false if this body should never fall asleep. Note that
  /// this increases CPU usage.
  allowSleep?: boolean;

  /// Is this body initially awake or sleeping?
  awake?: boolean;

  /// Should this body be prevented from rotating? Useful for characters.
  fixedRotation?: boolean;

  /// Is this a fast moving body that should be prevented from tunneling through
  /// other moving bodies? Note that all bodies are prevented from tunneling through
  /// kinematic and static bodies. This setting is only considered on dynamic bodies.
  /// @warning You should use this flag sparingly since it increases processing time.
  bullet?: boolean;

  /// Does this body start out active?
  active?: boolean;

  /// Use this to store application specific body data.
  userData?: any;

  /// Scale the gravity applied to this body.
  gravityScale?: number;
}

/// A body definition holds all the data needed to construct a rigid body.
/// You can safely re-use body definitions. Shapes are added to a body after construction.
export class b2BodyDef implements b2IBodyDef {
  /// The body type: static, kinematic, or dynamic.
  /// Note: if a dynamic body would have zero mass, the mass is set to one.
  type: b2BodyType = b2BodyType.b2_staticBody;

  /// The world position of the body. Avoid creating bodies at the origin
  /// since this can lead to many overlapping shapes.
  readonly position = new b2Vec2();

  /// The world angle of the body in radians.
  angle = NaN;

  /// The linear velocity of the body's origin in world co-ordinates.
  readonly linearVelocity = new b2Vec2();

  /// The angular velocity of the body.
  angularVelocity = NaN;

  /// Linear damping is use to reduce the linear velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  linearDamping = NaN;

  /// Angular damping is use to reduce the angular velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  angularDamping = NaN;

  /// Set this flag to false if this body should never fall asleep. Note that
  /// this increases CPU usage.
  allowSleep = true;

  /// Is this body initially awake or sleeping?
  awake = true;

  /// Should this body be prevented from rotating? Useful for characters.
  fixedRotation = false;

  /// Is this a fast moving body that should be prevented from tunneling through
  /// other moving bodies? Note that all bodies are prevented from tunneling through
  /// kinematic and static bodies. This setting is only considered on dynamic bodies.
  /// @warning You should use this flag sparingly since it increases processing time.
  bullet = false;

  /// Does this body start out active?
  active = true;

  /// Use this to store application specific body data.
  userData: any = null;

  /// Scale the gravity applied to this body.
  gravityScale = NaN; // 1.0

  constructor() {
    this.angle = 0.0;
    this.angularVelocity = 0.0;
    this.linearDamping = 0.0;
    this.angularDamping = 0.0;
    this.gravityScale = 1.0;
  }
}

/// A rigid body. These are created via b2World::CreateBody.
export class b2Body {
  m_type: b2BodyType;

  m_islandFlag = false;
  m_awakeFlag = false;
  m_autoSleepFlag = false;
  m_bulletFlag = false;
  m_fixedRotationFlag = false;
  m_activeFlag = false;
  m_toiFlag = false;

  m_islandIndex = 0;

  readonly m_xf = new b2Transform(); // the body origin transform
  // #if B2_ENABLE_PARTICLE
  readonly m_xf0 = new b2Transform();
  // #endif
  readonly m_sweep = new b2Sweep(); // the swept motion for CCD

  readonly m_linearVelocity = new b2Vec2();
  m_angularVelocity = NaN;

  readonly m_force = new b2Vec2();
  m_torque = NaN;

  m_world: b2World;
  m_prev: b2Body | null = null;
  m_next: b2Body | null = null;

  m_fixtureList: b2Fixture | null = null;
  m_fixtureCount = 0;

  m_jointList: b2JointEdge | null = null;
  m_contactList: b2ContactEdge | null = null;

  m_mass = NaN;
  m_invMass = NaN;

  // Rotational inertia about the center of mass.
  m_I = NaN;
  m_invI = NaN;

  m_linearDamping = NaN;
  m_angularDamping = NaN;
  m_gravityScale = NaN;

  m_sleepTime = NaN;

  m_userData: any = null;

  // #if B2_ENABLE_CONTROLLER
  m_controllerList: b2ControllerEdge | null = null;
  m_controllerCount = 0;
  // #endif

  constructor(bd: b2IBodyDef, world: b2World) {
    this.m_bulletFlag = bd.bullet ?? false;
    this.m_fixedRotationFlag = bd.fixedRotation ?? false;
    this.m_autoSleepFlag = bd.allowSleep ?? true;
    this.m_awakeFlag = bd.awake ?? true;
    this.m_activeFlag = bd.active ?? true;

    this.m_world = world;

    this.m_xf.p.Copy(bd.position ?? b2Vec2.ZERO);
    !!B2_DEBUG && b2Assert(this.m_xf.p.IsValid());
    this.m_xf.q.SetAngle(bd.angle ?? 0.0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_xf.q.GetAngle()));
    if (B2_ENABLE_PARTICLE) {
      this.m_xf0.Copy(this.m_xf);
    }

    this.m_sweep.localCenter.SetZero();
    this.m_sweep.c0.Copy(this.m_xf.p);
    this.m_sweep.c.Copy(this.m_xf.p);
    this.m_sweep.a0 = this.m_sweep.a = this.m_xf.q.GetAngle();
    this.m_sweep.alpha0 = 0;

    this.m_linearVelocity.Copy(bd.linearVelocity ?? b2Vec2.ZERO);
    !!B2_DEBUG && b2Assert(this.m_linearVelocity.IsValid());
    this.m_angularVelocity = bd.angularVelocity ?? 0;
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_angularVelocity));

    this.m_linearDamping = bd.linearDamping ?? 0.0;
    this.m_angularDamping = bd.angularDamping ?? 0.0;
    this.m_gravityScale = bd.gravityScale ?? 1.0;
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_gravityScale) && this.m_gravityScale >= 0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_angularDamping) && this.m_angularDamping >= 0);
    !!B2_DEBUG && b2Assert(b2IsValid(this.m_linearDamping) && this.m_linearDamping >= 0);

    this.m_force.SetZero();
    this.m_torque = 0.0;

    this.m_sleepTime = 0.0;

    this.m_type = bd.type ?? b2BodyType.b2_staticBody;

    if (bd.type === b2BodyType.b2_dynamicBody) {
      this.m_mass = 1.0;
      this.m_invMass = 1.0;
    } else {
      this.m_mass = 0.0;
      this.m_invMass = 0.0;
    }

    this.m_I = 0.0;
    this.m_invI = 0.0;

    this.m_userData = bd.userData;
  }

  CreateFixture(def: b2IFixtureDef): b2Fixture;
  CreateFixture(shape: b2Shape): b2Fixture;
  CreateFixture(shape: b2Shape, density: number): b2Fixture;
  CreateFixture(a: b2IFixtureDef | b2Shape, b = 0): b2Fixture {
    if (a instanceof b2Shape) {
      return this.CreateFixtureShapeDensity(a, b);
    } else {
      return this.CreateFixtureDef(a);
    }
  }

  /// Creates a fixture and attach it to this body. Use this function if you need
  /// to set some fixture parameters, like friction. Otherwise you can create the
  /// fixture directly from a shape.
  /// If the density is non-zero, this function automatically updates the mass of the body.
  /// Contacts are not created until the next time step.
  /// @param def the fixture definition.
  /// @warning This function is locked during callbacks.
  CreateFixtureDef(def: b2IFixtureDef): b2Fixture {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    const fixture: b2Fixture = new b2Fixture(this, def);

    if (this.m_activeFlag) {
      fixture.CreateProxies();
    }

    fixture.m_next = this.m_fixtureList;
    this.m_fixtureList = fixture;
    ++this.m_fixtureCount;

    // fixture.m_body = this;

    // Adjust mass properties if needed.
    if (fixture.m_density > 0) {
      this.ResetMassData();
    }

    // Let the world know we have a new fixture. This will cause new contacts
    // to be created at the beginning of the next time step.
    this.m_world.m_newFixture = true;

    return fixture;
  }

  /// Creates a fixture from a shape and attach it to this body.
  /// This is a convenience function. Use b2FixtureDef if you need to set parameters
  /// like friction, restitution, user data, or filtering.
  /// If the density is non-zero, this function automatically updates the mass of the body.
  /// @param shape the shape to be cloned.
  /// @param density the shape density (set to zero for static bodies).
  /// @warning This function is locked during callbacks.
  private static CreateFixtureShapeDensity_s_def: b2FixtureDef = new b2FixtureDef();

  CreateFixtureShapeDensity(shape: b2Shape, density = 0): b2Fixture {
    const def: b2FixtureDef = b2Body.CreateFixtureShapeDensity_s_def;
    def.shape = shape;
    def.density = density;
    return this.CreateFixtureDef(def);
  }

  /// Destroy a fixture. This removes the fixture from the broad-phase and
  /// destroys all contacts associated with this fixture. This will
  /// automatically adjust the mass of the body if the body is dynamic and the
  /// fixture has positive density.
  /// All fixtures attached to a body are implicitly destroyed when the body is destroyed.
  /// @param fixture the fixture to be removed.
  /// @warning This function is locked during callbacks.
  DestroyFixture(fixture: b2Fixture): void {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    !!B2_DEBUG && b2Assert(fixture.m_body === this);

    // Remove the fixture from this body's singly linked list.
    !!B2_DEBUG && b2Assert(this.m_fixtureCount > 0);
    let node: b2Fixture | null = this.m_fixtureList;
    let ppF: b2Fixture | null = null;
    // DEBUG: let found: boolean = false;
    while (node !== null) {
      if (node === fixture) {
        if (ppF) {
          ppF.m_next = fixture.m_next;
        } else {
          this.m_fixtureList = fixture.m_next;
        }
        // DEBUG: found = true;
        break;
      }

      ppF = node;
      node = node.m_next;
    }

    // You tried to remove a shape that is not attached to this body.
    // TODO: debug
    //!!B2_DEBUG && b2Assert(found);

    // Destroy any contacts associated with the fixture.
    let edge: b2ContactEdge | null = this.m_contactList;
    while (edge) {
      const c = edge.contact;
      edge = edge.next;

      const fixtureA: b2Fixture = c.GetFixtureA();
      const fixtureB: b2Fixture = c.GetFixtureB();

      if (fixture === fixtureA || fixture === fixtureB) {
        // This destroys the contact and removes it from
        // this body's contact list.
        this.m_world.m_contactManager.Destroy(c);
      }
    }

    if (this.m_activeFlag) {
      fixture.DestroyProxies();
    }

    // fixture.m_body = null;
    fixture.m_next = null;
    fixture.Reset();

    --this.m_fixtureCount;

    // Reset the mass data.
    this.ResetMassData();
  }

  /// Set the position of the body's origin and rotation.
  /// This breaks any contacts and wakes the other bodies.
  /// Manipulating a body's transform may cause non-physical behavior.
  /// @param position the world position of the body's local origin.
  /// @param angle the world rotation in radians.
  SetTransformVec(position: XY, angle: number): void {
    this.SetTransformXY(position.x, position.y, angle);
  }

  SetTransformXY(x: number, y: number, angle: number): void {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    this.m_xf.q.SetAngle(angle);
    this.m_xf.p.Set(x, y);
    if (B2_ENABLE_PARTICLE) {
      this.m_xf0.Copy(this.m_xf);
    }

    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.a = angle;

    this.m_sweep.c0.Copy(this.m_sweep.c);
    this.m_sweep.a0 = angle;

    for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
      f.SynchronizeProxies(this.m_xf, this.m_xf, b2Vec2.ZERO);
    }

    this.m_world.m_contactManager.FindNewContacts();
  }

  SetTransform(xf: b2Transform): void {
    this.SetTransformVec(xf.p, xf.GetAngle());
  }

  /// Get the body transform for the body's origin.
  /// @return the world transform of the body's origin.
  GetTransform(): Readonly<b2Transform> {
    return this.m_xf;
  }

  /// Get the world body origin position.
  /// @return the world position of the body's origin.
  GetPosition(): Readonly<b2Vec2> {
    return this.m_xf.p;
  }

  SetPosition(position: XY): void {
    this.SetTransformVec(position, this.GetAngle());
  }

  SetPositionXY(x: number, y: number): void {
    this.SetTransformXY(x, y, this.GetAngle());
  }

  /// Get the angle in radians.
  /// @return the current world rotation angle in radians.
  GetAngle(): number {
    return this.m_sweep.a;
  }

  SetAngle(angle: number): void {
    this.SetTransformVec(this.GetPosition(), angle);
  }

  /// Get the world position of the center of mass.
  GetWorldCenter(): Readonly<b2Vec2> {
    return this.m_sweep.c;
  }

  /// Get the local position of the center of mass.
  GetLocalCenter(): Readonly<b2Vec2> {
    return this.m_sweep.localCenter;
  }

  /// Set the linear velocity of the center of mass.
  /// @param v the new linear velocity of the center of mass.
  SetLinearVelocity(v: XY): void {
    this.SetLinearVelocityXY(v.x, v.y);
  }

  SetLinearVelocityXY(x: number, y: number): void {
    if (this.m_type === b2BodyType.b2_staticBody) {
      return;
    }

    if (x * x + y * y > 0) {
      this.SetAwake(true);
    }

    this.m_linearVelocity.Set(x, y);
  }

  /// Get the linear velocity of the center of mass.
  /// @return the linear velocity of the center of mass.
  GetLinearVelocity(): Readonly<b2Vec2> {
    return this.m_linearVelocity;
  }

  /// Set the angular velocity.
  /// @param omega the new angular velocity in radians/second.
  SetAngularVelocity(w: number): void {
    if (this.m_type === b2BodyType.b2_staticBody) {
      return;
    }

    if (w * w > 0) {
      this.SetAwake(true);
    }

    this.m_angularVelocity = w;
  }

  /// Get the angular velocity.
  /// @return the angular velocity in radians/second.
  GetAngularVelocity(): number {
    return this.m_angularVelocity;
  }

  GetDefinition(bd: b2BodyDef): b2BodyDef {
    bd.type = this.GetType();
    bd.allowSleep = this.m_autoSleepFlag;
    bd.angle = this.GetAngle();
    bd.angularDamping = this.m_angularDamping;
    bd.gravityScale = this.m_gravityScale;
    bd.angularVelocity = this.m_angularVelocity;
    bd.fixedRotation = this.m_fixedRotationFlag;
    bd.bullet = this.m_bulletFlag;
    bd.awake = this.m_awakeFlag;
    bd.linearDamping = this.m_linearDamping;
    bd.linearVelocity.Copy(this.GetLinearVelocity());
    bd.position.Copy(this.GetPosition());
    bd.userData = this.GetUserData();
    return bd;
  }

  /// Apply a force at a world point. If the force is not
  /// applied at the center of mass, it will generate a torque and
  /// affect the angular velocity. This wakes up the body.
  /// @param force the world force vector, usually in Newtons (N).
  /// @param point the world position of the point of application.
  /// @param wake also wake up the body
  ApplyForce(force: XY, point: XY, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_force.x += force.x;
      this.m_force.y += force.y;
      this.m_torque +=
        (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x;
    }
  }

  /// Apply a force to the center of mass. This wakes up the body.
  /// @param force the world force vector, usually in Newtons (N).
  /// @param wake also wake up the body
  ApplyForceToCenter(force: XY, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_force.x += force.x;
      this.m_force.y += force.y;
    }
  }

  /// Apply a torque. This affects the angular velocity
  /// without affecting the linear velocity of the center of mass.
  /// @param torque about the z-axis (out of the screen), usually in N-m.
  /// @param wake also wake up the body
  ApplyTorque(torque: number, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_torque += torque;
    }
  }

  /// Apply an impulse at a point. This immediately modifies the velocity.
  /// It also modifies the angular velocity if the point of application
  /// is not at the center of mass. This wakes up the body.
  /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
  /// @param point the world position of the point of application.
  /// @param wake also wake up the body
  ApplyLinearImpulse(impulse: XY, point: XY, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_linearVelocity.x += this.m_invMass * impulse.x;
      this.m_linearVelocity.y += this.m_invMass * impulse.y;
      this.m_angularVelocity +=
        this.m_invI *
        ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
    }
  }

  /// Apply an impulse at the center of gravity. This immediately modifies the velocity.
  /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
  /// @param wake also wake up the body
  ApplyLinearImpulseToCenter(impulse: XY, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_linearVelocity.x += this.m_invMass * impulse.x;
      this.m_linearVelocity.y += this.m_invMass * impulse.y;
    }
  }

  /// Apply an angular impulse.
  /// @param impulse the angular impulse in units of kg*m*m/s
  /// @param wake also wake up the body
  ApplyAngularImpulse(impulse: number, wake = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_angularVelocity += this.m_invI * impulse;
    }
  }

  /// Get the total mass of the body.
  /// @return the mass, usually in kilograms (kg).
  GetMass(): number {
    return this.m_mass;
  }

  /// Get the rotational inertia of the body about the local origin.
  /// @return the rotational inertia, usually in kg-m^2.
  GetInertia(): number {
    return (
      this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter)
    );
  }

  /// Get the mass data of the body.
  /// @return a struct containing the mass, inertia and center of the body.
  GetMassData(data: b2MassData): b2MassData {
    data.mass = this.m_mass;
    data.I =
      this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
    data.center.Copy(this.m_sweep.localCenter);
    return data;
  }

  /// Set the mass properties to override the mass properties of the fixtures.
  /// Note that this changes the center of mass position.
  /// Note that creating or destroying fixtures can also alter the mass.
  /// This function has no effect if the body isn't dynamic.
  /// @param massData the mass properties.
  private static SetMassData_s_oldCenter: b2Vec2 = new b2Vec2();

  SetMassData(massData: b2MassData): void {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;

    this.m_mass = massData.mass;
    if (this.m_mass <= 0) {
      this.m_mass = 1;
    }

    this.m_invMass = 1 / this.m_mass;

    if (massData.I > 0 && !this.m_fixedRotationFlag) {
      this.m_I = massData.I - this.m_mass * b2Vec2.DotVV(massData.center, massData.center);
      !!B2_DEBUG && b2Assert(this.m_I > 0);
      this.m_invI = 1 / this.m_I;
    }

    // Move center of mass.
    const oldCenter: b2Vec2 = b2Body.SetMassData_s_oldCenter.Copy(this.m_sweep.c);
    this.m_sweep.localCenter.Copy(massData.center);
    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.c0.Copy(this.m_sweep.c);

    // Update center of mass velocity.
    b2Vec2.AddVCrossSV(
      this.m_linearVelocity,
      this.m_angularVelocity,
      b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0),
      this.m_linearVelocity,
    );
  }

  /// This resets the mass properties to the sum of the mass properties of the fixtures.
  /// This normally does not need to be called unless you called SetMassData to override
  /// the mass and you later want to reset the mass.
  private static ResetMassData_s_localCenter: b2Vec2 = new b2Vec2();
  private static ResetMassData_s_oldCenter: b2Vec2 = new b2Vec2();
  private static ResetMassData_s_massData: b2MassData = new b2MassData();

  ResetMassData(): void {
    // Compute mass data from shapes. Each shape has its own density.
    this.m_mass = 0;
    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;
    this.m_sweep.localCenter.SetZero();

    // Static and kinematic bodies have zero mass.
    if (this.m_type === b2BodyType.b2_staticBody || this.m_type === b2BodyType.b2_kinematicBody) {
      this.m_sweep.c0.Copy(this.m_xf.p);
      this.m_sweep.c.Copy(this.m_xf.p);
      this.m_sweep.a0 = this.m_sweep.a;
      return;
    }

    !!B2_DEBUG && b2Assert(this.m_type === b2BodyType.b2_dynamicBody);

    // Accumulate mass over all fixtures.
    const localCenter: b2Vec2 = b2Body.ResetMassData_s_localCenter.SetZero();
    for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
      if (f.m_density === 0) {
        continue;
      }

      const massData: b2MassData = f.GetMassData(b2Body.ResetMassData_s_massData);
      this.m_mass += massData.mass;
      localCenter.x += massData.center.x * massData.mass;
      localCenter.y += massData.center.y * massData.mass;
      this.m_I += massData.I;
    }

    // Compute center of mass.
    if (this.m_mass > 0) {
      this.m_invMass = 1 / this.m_mass;
      localCenter.x *= this.m_invMass;
      localCenter.y *= this.m_invMass;
    } else {
      // Force all dynamic bodies to have a positive mass.
      this.m_mass = 1;
      this.m_invMass = 1;
    }

    if (this.m_I > 0 && !this.m_fixedRotationFlag) {
      // Center the inertia about the center of mass.
      this.m_I -= this.m_mass * b2Vec2.DotVV(localCenter, localCenter);
      !!B2_DEBUG && b2Assert(this.m_I > 0);
      this.m_invI = 1 / this.m_I;
    } else {
      this.m_I = 0;
      this.m_invI = 0;
    }

    // Move center of mass.
    const oldCenter: b2Vec2 = b2Body.ResetMassData_s_oldCenter.Copy(this.m_sweep.c);
    this.m_sweep.localCenter.Copy(localCenter);
    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.c0.Copy(this.m_sweep.c);

    // Update center of mass velocity.
    b2Vec2.AddVCrossSV(
      this.m_linearVelocity,
      this.m_angularVelocity,
      b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0),
      this.m_linearVelocity,
    );
  }

  /// Get the world coordinates of a point given the local coordinates.
  /// @param localPoint a point on the body measured relative the the body's origin.
  /// @return the same point expressed in world coordinates.
  GetWorldPoint<T extends XY>(localPoint: XY, out: T): T {
    return b2Transform.MulXV(this.m_xf, localPoint, out);
  }

  /// Get the world coordinates of a vector given the local coordinates.
  /// @param localVector a vector fixed in the body.
  /// @return the same vector expressed in world coordinates.
  GetWorldVector<T extends XY>(localVector: XY, out: T): T {
    return b2Rot.MulRV(this.m_xf.q, localVector, out);
  }

  /// Gets a local point relative to the body's origin given a world point.
  /// @param a point in world coordinates.
  /// @return the corresponding local point relative to the body's origin.
  GetLocalPoint<T extends XY>(worldPoint: XY, out: T): T {
    return b2Transform.MulTXV(this.m_xf, worldPoint, out);
  }

  /// Gets a local vector given a world vector.
  /// @param a vector in world coordinates.
  /// @return the corresponding local vector.
  GetLocalVector<T extends XY>(worldVector: XY, out: T): T {
    return b2Rot.MulTRV(this.m_xf.q, worldVector, out);
  }

  /// Get the world linear velocity of a world point attached to this body.
  /// @param a point in world coordinates.
  /// @return the world velocity of a point.
  GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T {
    return b2Vec2.AddVCrossSV(
      this.m_linearVelocity,
      this.m_angularVelocity,
      b2Vec2.SubVV(worldPoint, this.m_sweep.c, b2Vec2.s_t0),
      out,
    );
  }

  /// Get the world velocity of a local point.
  /// @param a point in local coordinates.
  /// @return the world velocity of a point.
  GetLinearVelocityFromLocalPoint<T extends XY>(localPoint: XY, out: T): T {
    return this.GetLinearVelocityFromWorldPoint(this.GetWorldPoint(localPoint, out), out);
  }

  /// Get the linear damping of the body.
  GetLinearDamping(): number {
    return this.m_linearDamping;
  }

  /// Set the linear damping of the body.
  SetLinearDamping(linearDamping: number): void {
    this.m_linearDamping = linearDamping;
  }

  /// Get the angular damping of the body.
  GetAngularDamping(): number {
    return this.m_angularDamping;
  }

  /// Set the angular damping of the body.
  SetAngularDamping(angularDamping: number): void {
    this.m_angularDamping = angularDamping;
  }

  /// Get the gravity scale of the body.
  GetGravityScale(): number {
    return this.m_gravityScale;
  }

  /// Set the gravity scale of the body.
  SetGravityScale(scale: number): void {
    this.m_gravityScale = scale;
  }

  /// Set the type of this body. This may alter the mass and velocity.
  SetType(type: b2BodyType): void {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    if (this.m_type === type) {
      return;
    }

    this.m_type = type;

    this.ResetMassData();

    if (this.m_type === b2BodyType.b2_staticBody) {
      this.m_linearVelocity.SetZero();
      this.m_angularVelocity = 0;
      this.m_sweep.a0 = this.m_sweep.a;
      this.m_sweep.c0.Copy(this.m_sweep.c);
      this.SynchronizeFixtures();
    }

    this.SetAwake(true);

    this.m_force.SetZero();
    this.m_torque = 0;

    // Delete the attached contacts.
    let ce: b2ContactEdge | null = this.m_contactList;
    while (ce) {
      const ce0: b2ContactEdge = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact);
    }
    this.m_contactList = null;

    // Touch the proxies so that new contacts will be created (when appropriate)
    for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
      f.TouchProxies();
    }
  }

  /// Get the type of this body.
  GetType(): b2BodyType {
    return this.m_type;
  }

  /// Should this body be treated like a bullet for continuous collision detection?
  SetBullet(flag: boolean): void {
    this.m_bulletFlag = flag;
  }

  /// Is this body treated like a bullet for continuous collision detection?
  IsBullet(): boolean {
    return this.m_bulletFlag;
  }

  /// You can disable sleeping on this body. If you disable sleeping, the
  /// body will be woken.
  SetSleepingAllowed(flag: boolean): void {
    this.m_autoSleepFlag = flag;
    if (!flag) {
      this.SetAwake(true);
    }
  }

  /// Is this body allowed to sleep
  IsSleepingAllowed(): boolean {
    return this.m_autoSleepFlag;
  }

  /// Set the sleep state of the body. A sleeping body has very
  /// low CPU cost.
  /// @param flag set to true to wake the body, false to put it to sleep.
  SetAwake(flag: boolean): void {
    if (flag) {
      this.m_awakeFlag = true;
      this.m_sleepTime = 0;
    } else {
      this.m_awakeFlag = false;
      this.m_sleepTime = 0;
      this.m_linearVelocity.SetZero();
      this.m_angularVelocity = 0;
      this.m_force.SetZero();
      this.m_torque = 0;
    }
  }

  /// Get the sleeping state of this body.
  /// @return true if the body is sleeping.
  IsAwake(): boolean {
    return this.m_awakeFlag;
  }

  /// Set the active state of the body. An inactive body is not
  /// simulated and cannot be collided with or woken up.
  /// If you pass a flag of true, all fixtures will be added to the
  /// broad-phase.
  /// If you pass a flag of false, all fixtures will be removed from
  /// the broad-phase and all contacts will be destroyed.
  /// Fixtures and joints are otherwise unaffected. You may continue
  /// to create/destroy fixtures and joints on inactive bodies.
  /// Fixtures on an inactive body are implicitly inactive and will
  /// not participate in collisions, ray-casts, or queries.
  /// Joints connected to an inactive body are implicitly inactive.
  /// An inactive body is still owned by a b2World object and remains
  /// in the body list.
  SetActive(flag: boolean): void {
    if (this.m_world.IsLocked()) {
      throw new Error();
    }

    if (flag === this.IsActive()) {
      return;
    }

    this.m_activeFlag = flag;

    if (flag) {
      // Create all proxies.
      for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
        f.CreateProxies();
      }
      // Contacts are created the next time step.
    } else {
      // Destroy all proxies.
      for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
        f.DestroyProxies();
      }
      // Destroy the attached contacts.
      let ce: b2ContactEdge | null = this.m_contactList;
      while (ce) {
        const ce0: b2ContactEdge = ce;
        ce = ce.next;
        this.m_world.m_contactManager.Destroy(ce0.contact);
      }
      this.m_contactList = null;
    }
  }

  /// Get the active state of the body.
  IsActive(): boolean {
    return this.m_activeFlag;
  }

  /// Set this body to have fixed rotation. This causes the mass
  /// to be reset.
  SetFixedRotation(flag: boolean): void {
    if (this.m_fixedRotationFlag === flag) {
      return;
    }

    this.m_fixedRotationFlag = flag;

    this.m_angularVelocity = 0;

    this.ResetMassData();
  }

  /// Does this body have fixed rotation?
  IsFixedRotation(): boolean {
    return this.m_fixedRotationFlag;
  }

  /// Get the list of all fixtures attached to this body.
  GetFixtureList(): b2Fixture | null {
    return this.m_fixtureList;
  }

  /// Get the list of all joints attached to this body.
  GetJointList(): b2JointEdge | null {
    return this.m_jointList;
  }

  /// Get the list of all contacts attached to this body.
  /// @warning this list changes during the time step and you may
  /// miss some collisions if you don't use b2ContactListener.
  GetContactList(): b2ContactEdge | null {
    return this.m_contactList;
  }

  /// Get the next body in the world's body list.
  GetNext(): b2Body | null {
    return this.m_next;
  }

  /// Get the user data pointer that was provided in the body definition.
  GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data. Use this to store your application specific data.
  SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Get the parent world of this body.
  GetWorld(): b2World {
    return this.m_world;
  }

  private static SynchronizeFixtures_s_xf1: b2Transform = new b2Transform();
  private static SynchronizeFixtures_s_displacement: b2Vec2 = new b2Vec2();

  SynchronizeFixtures(): void {
    const xf1: b2Transform = b2Body.SynchronizeFixtures_s_xf1;
    xf1.q.SetAngle(this.m_sweep.a0);
    b2Rot.MulRV(xf1.q, this.m_sweep.localCenter, xf1.p);
    b2Vec2.SubVV(this.m_sweep.c0, xf1.p, xf1.p);

    // const displacement: b2Vec2 = b2Vec2.SubVV(this.m_xf.p, xf1.p, b2Body.SynchronizeFixtures_s_displacement);
    const displacement: b2Vec2 = b2Vec2.SubVV(
      this.m_sweep.c,
      this.m_sweep.c0,
      b2Body.SynchronizeFixtures_s_displacement,
    );

    for (let f: b2Fixture | null = this.m_fixtureList; f; f = f.m_next) {
      f.SynchronizeProxies(xf1, this.m_xf, displacement);
    }
  }

  SynchronizeTransform(): void {
    this.m_xf.q.SetAngle(this.m_sweep.a);
    b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
    b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
  }

  // This is used to prevent connected bodies from colliding.
  // It may lie, depending on the collideConnected flag.
  ShouldCollide(other: b2Body): boolean {
    // At least one body should be dynamic or kinematic.
    if (this.m_type === b2BodyType.b2_staticBody && other.m_type === b2BodyType.b2_staticBody) {
      return false;
    }
    return this.ShouldCollideConnected(other);
  }

  ShouldCollideConnected(other: b2Body): boolean {
    // Does a joint prevent collision?
    for (let jn: b2JointEdge | null = this.m_jointList; jn; jn = jn.next) {
      if (jn.other === other) {
        if (!jn.joint.m_collideConnected) {
          return false;
        }
      }
    }

    return true;
  }

  Advance(alpha: number): void {
    // Advance to the new safe time. This doesn't sync the broad-phase.
    this.m_sweep.Advance(alpha);
    this.m_sweep.c.Copy(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.m_xf.q.SetAngle(this.m_sweep.a);
    b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
    b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
  }

  // #if B2_ENABLE_CONTROLLER
  GetControllerList(): b2ControllerEdge | null {
    return this.m_controllerList;
  }

  GetControllerCount(): number {
    return this.m_controllerCount;
  }
  // #endif
}
