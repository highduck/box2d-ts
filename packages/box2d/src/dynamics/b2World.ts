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

import {b2_epsilon, b2_maxFloat, b2_maxSubSteps, b2_maxTOIContacts, b2Assert} from "../common/b2Settings";
import {b2Min, b2Sweep, b2Transform, b2Vec2, XY} from "../common/b2Math";
import {b2Timer} from "../common/b2Timer";
import {b2AABB, b2RayCastInput, b2RayCastOutput, b2TestOverlapShape} from "../collision/b2Collision";
import {b2TreeNode} from "../collision/b2DynamicTree";
import {b2TimeOfImpact, b2TOIInput, b2TOIOutput, b2TOIOutputState} from "../collision/b2TimeOfImpact";
import {b2Shape} from "../collision/shapes/b2Shape";
import {b2Contact, b2ContactEdge} from "./contacts/b2Contact";
import {b2IJointDef, b2Joint, b2JointEdge, b2JointType} from "./joints/b2Joint";
import {b2AreaJoint, b2IAreaJointDef} from "./joints/b2AreaJoint";
import {b2DistanceJoint, b2IDistanceJointDef} from "./joints/b2DistanceJoint";
import {b2FrictionJoint, b2IFrictionJointDef} from "./joints/b2FrictionJoint";
import {b2GearJoint, b2IGearJointDef} from "./joints/b2GearJoint";
import {b2IMotorJointDef, b2MotorJoint} from "./joints/b2MotorJoint";
import {b2IMouseJointDef, b2MouseJoint} from "./joints/b2MouseJoint";
import {b2IPrismaticJointDef, b2PrismaticJoint} from "./joints/b2PrismaticJoint";
import {b2IPulleyJointDef, b2PulleyJoint} from "./joints/b2PulleyJoint";
import {b2IRevoluteJointDef, b2RevoluteJoint} from "./joints/b2RevoluteJoint";
import {b2IRopeJointDef, b2RopeJoint} from "./joints/b2RopeJoint";
import {b2IWeldJointDef, b2WeldJoint} from "./joints/b2WeldJoint";
import {b2IWheelJointDef, b2WheelJoint} from "./joints/b2WheelJoint";
import {b2Body, b2BodyType, b2IBodyDef} from "./b2Body";
import {b2ContactManager} from "./b2ContactManager";
import {b2Fixture, b2FixtureProxy} from "./b2Fixture";
import {b2Island} from "./b2Island";
import {b2Profile, b2TimeStep} from "./b2TimeStep";
import {
    b2ContactFilter,
    b2ContactListener,
    b2DestructionListener,
    b2QueryCallback,
    b2QueryCallbackFunction,
    b2RayCastCallback,
    b2RayCastCallbackFunction
} from "./b2WorldCallbacks";
import {b2CalculateParticleIterations} from "../particle/b2Particle";
import {b2ParticleSystem, b2ParticleSystemDef} from "../particle/b2ParticleSystem";
import {b2Controller, b2ControllerEdge} from "../controllers/b2Controller";

const SolveTOI_s_subStep = new b2TimeStep();
const SolveTOI_s_backup = new b2Sweep();
const SolveTOI_s_backup1 = new b2Sweep();
const SolveTOI_s_backup2 = new b2Sweep();
const SolveTOI_s_toi_input = new b2TOIInput();
const SolveTOI_s_toi_output = new b2TOIOutput();

/// Take a time step. This performs collision detection, integration,
/// and constraint solution.
/// @param timeStep the amount of time to simulate, this should not vary.
/// @param velocityIterations for the velocity constraint solver.
/// @param positionIterations for the position constraint solver.
const Step_s_step = new b2TimeStep();
const Step_s_stepTimer = new b2Timer();
const Step_s_timer = new b2Timer();
const Step_s_broadphaseTimer = new b2Timer();

/// The world class manages all physics entities, dynamic simulation,
/// and asynchronous queries. The world also contains efficient memory
/// management facilities.
export class b2World {
    m_newFixture = false;
    m_locked = false;
    m_clearForces = true;

    readonly m_contactManager = new b2ContactManager();

    m_bodyList: b2Body | null = null;
    m_jointList: b2Joint | null = null;

    // #if B2_ENABLE_PARTICLE
    m_particleSystemList: b2ParticleSystem | null = null;
    // #endif

    m_bodyCount = 0;
    m_jointCount = 0;

    readonly m_gravity = new b2Vec2();
    m_allowSleep = true;

    m_destructionListener: b2DestructionListener | null = null;

    // This is used to compute the time step ratio to
    // support a variable time step.
    m_inv_dt0 = NaN;

    // These are for debugging the solver.
    m_warmStarting = true;
    m_continuousPhysics = true;
    m_subStepping = false;

    m_stepComplete = true;

    readonly m_profile = new b2Profile();
    readonly m_island = new b2Island();
    readonly s_stack: Array<b2Body | null> = [null];

    // #if B2_ENABLE_CONTROLLER
    m_controllerList: b2Controller | null = null;
    m_controllerCount = 0;
    // #endif

    /// Construct a world object.
    /// @param gravity the world gravity vector.
    constructor(gravity: XY) {
        this.m_inv_dt0 = 0.0;
        this.m_gravity.Copy(gravity);
    }

    /// Register a destruction listener. The listener is owned by you and must
    /// remain in scope.
    SetDestructionListener(listener: b2DestructionListener | null): void {
        this.m_destructionListener = listener;
    }

    /// Register a contact filter to provide specific control over collision.
    /// Otherwise the default filter is used (b2_defaultFilter). The listener is
    /// owned by you and must remain in scope.
    SetContactFilter(filter: b2ContactFilter): void {
        this.m_contactManager.m_contactFilter = filter;
    }

    /// Register a contact event listener. The listener is owned by you and must
    /// remain in scope.
    SetContactListener(listener: b2ContactListener): void {
        this.m_contactManager.m_contactListener = listener;
    }

    /// Create a rigid body given a definition. No reference to the definition
    /// is retained.
    /// @warning This function is locked during callbacks.
    CreateBody(def: b2IBodyDef = {}): b2Body {
        if (this.IsLocked()) {
            throw new Error();
        }

        const b: b2Body = new b2Body(def, this);

        // Add to world doubly linked list.
        b.m_prev = null;
        b.m_next = this.m_bodyList;
        if (this.m_bodyList) {
            this.m_bodyList.m_prev = b;
        }
        this.m_bodyList = b;
        ++this.m_bodyCount;

        return b;
    }

    /// Destroy a rigid body given a definition. No reference to the definition
    /// is retained. This function is locked during callbacks.
    /// @warning This automatically deletes all associated shapes and joints.
    /// @warning This function is locked during callbacks.
    DestroyBody(b: b2Body): void {
        !!B2_DEBUG && b2Assert(this.m_bodyCount > 0);
        if (this.IsLocked()) {
            throw new Error();
        }

        // Delete the attached joints.
        let je: b2JointEdge | null = b.m_jointList;
        while (je) {
            const je0: b2JointEdge = je;
            je = je.next;

            if (this.m_destructionListener) {
                this.m_destructionListener.SayGoodbyeJoint(je0.joint);
            }

            this.DestroyJoint(je0.joint);

            b.m_jointList = je;
        }
        b.m_jointList = null;

        if (B2_ENABLE_CONTROLLER) {
            // @see b2Controller list
            let coe: b2ControllerEdge | null = b.m_controllerList;
            while (coe) {
                const coe0: b2ControllerEdge = coe;
                coe = coe.nextController;
                coe0.controller.RemoveBody(b);
            }
        }

        // Delete the attached contacts.
        let ce: b2ContactEdge | null = b.m_contactList;
        while (ce) {
            const ce0: b2ContactEdge = ce;
            ce = ce.next;
            this.m_contactManager.Destroy(ce0.contact);
        }
        b.m_contactList = null;

        // Delete the attached fixtures. This destroys broad-phase proxies.
        let f: b2Fixture | null = b.m_fixtureList;
        while (f) {
            const f0: b2Fixture = f;
            f = f.m_next;

            if (this.m_destructionListener) {
                this.m_destructionListener.SayGoodbyeFixture(f0);
            }

            f0.DestroyProxies();
            f0.Reset();

            b.m_fixtureList = f;
            b.m_fixtureCount -= 1;
        }
        b.m_fixtureList = null;
        b.m_fixtureCount = 0;

        // Remove world body list.
        if (b.m_prev) {
            b.m_prev.m_next = b.m_next;
        }

        if (b.m_next) {
            b.m_next.m_prev = b.m_prev;
        }

        if (b === this.m_bodyList) {
            this.m_bodyList = b.m_next;
        }

        --this.m_bodyCount;
    }

    private static _Joint_Create(def: b2IJointDef): b2Joint {
        switch (def.type) {
            case b2JointType.e_distanceJoint:
                return new b2DistanceJoint(def as b2IDistanceJointDef);
            case b2JointType.e_mouseJoint:
                return new b2MouseJoint(def as b2IMouseJointDef);
            case b2JointType.e_prismaticJoint:
                return new b2PrismaticJoint(def as b2IPrismaticJointDef);
            case b2JointType.e_revoluteJoint:
                return new b2RevoluteJoint(def as b2IRevoluteJointDef);
            case b2JointType.e_pulleyJoint:
                return new b2PulleyJoint(def as b2IPulleyJointDef);
            case b2JointType.e_gearJoint:
                return new b2GearJoint(def as b2IGearJointDef);
            case b2JointType.e_wheelJoint:
                return new b2WheelJoint(def as b2IWheelJointDef);
            case b2JointType.e_weldJoint:
                return new b2WeldJoint(def as b2IWeldJointDef);
            case b2JointType.e_frictionJoint:
                return new b2FrictionJoint(def as b2IFrictionJointDef);
            case b2JointType.e_ropeJoint:
                return new b2RopeJoint(def as b2IRopeJointDef);
            case b2JointType.e_motorJoint:
                return new b2MotorJoint(def as b2IMotorJointDef);
            case b2JointType.e_areaJoint:
                return new b2AreaJoint(def as b2IAreaJointDef);
        }
        throw new Error();
    }

    private static _Joint_Destroy(joint: b2Joint): void {
    }

    /// Create a joint to constrain bodies together. No reference to the definition
    /// is retained. This may cause the connected bodies to cease colliding.
    /// @warning This function is locked during callbacks.
    CreateJoint(def: b2IAreaJointDef): b2AreaJoint;
    CreateJoint(def: b2IDistanceJointDef): b2DistanceJoint;
    CreateJoint(def: b2IFrictionJointDef): b2FrictionJoint;
    CreateJoint(def: b2IGearJointDef): b2GearJoint;
    CreateJoint(def: b2IMotorJointDef): b2MotorJoint;
    CreateJoint(def: b2IMouseJointDef): b2MouseJoint;
    CreateJoint(def: b2IPrismaticJointDef): b2PrismaticJoint;
    CreateJoint(def: b2IPulleyJointDef): b2PulleyJoint;
    CreateJoint(def: b2IRevoluteJointDef): b2RevoluteJoint;
    CreateJoint(def: b2IRopeJointDef): b2RopeJoint;
    CreateJoint(def: b2IWeldJointDef): b2WeldJoint;
    CreateJoint(def: b2IWheelJointDef): b2WheelJoint;
    CreateJoint(def: b2IJointDef): b2Joint {
        if (this.IsLocked()) {
            throw new Error();
        }

        const j: b2Joint = b2World._Joint_Create(def);

        // Connect to the world list.
        j.m_prev = null;
        j.m_next = this.m_jointList;
        if (this.m_jointList) {
            this.m_jointList.m_prev = j;
        }
        this.m_jointList = j;
        ++this.m_jointCount;

        // Connect to the bodies' doubly linked lists.
        // j.m_edgeA.other = j.m_bodyB; // done in b2Joint constructor
        j.m_edgeA.prev = null;
        j.m_edgeA.next = j.m_bodyA.m_jointList;
        if (j.m_bodyA.m_jointList) {
            j.m_bodyA.m_jointList.prev = j.m_edgeA;
        }
        j.m_bodyA.m_jointList = j.m_edgeA;

        // j.m_edgeB.other = j.m_bodyA; // done in b2Joint constructor
        j.m_edgeB.prev = null;
        j.m_edgeB.next = j.m_bodyB.m_jointList;
        if (j.m_bodyB.m_jointList) {
            j.m_bodyB.m_jointList.prev = j.m_edgeB;
        }
        j.m_bodyB.m_jointList = j.m_edgeB;

        const bodyA: b2Body = j.m_bodyA;
        const bodyB: b2Body = j.m_bodyB;
        const collideConnected: boolean = j.m_collideConnected;

        // If the joint prevents collisions, then flag any contacts for filtering.
        if (!collideConnected) {
            let edge: b2ContactEdge | null = bodyB.GetContactList();
            while (edge) {
                if (edge.other === bodyA) {
                    // Flag the contact for filtering at the next time step (where either
                    // body is awake).
                    edge.contact.FlagForFiltering();
                }

                edge = edge.next;
            }
        }

        // Note: creating a joint doesn't wake the bodies.

        return j;
    }

    /// Destroy a joint. This may cause the connected bodies to begin colliding.
    /// @warning This function is locked during callbacks.
    DestroyJoint(j: b2Joint): void {
        if (this.IsLocked()) {
            throw new Error();
        }

        // Remove from the doubly linked list.
        if (j.m_prev) {
            j.m_prev.m_next = j.m_next;
        }

        if (j.m_next) {
            j.m_next.m_prev = j.m_prev;
        }

        if (j === this.m_jointList) {
            this.m_jointList = j.m_next;
        }

        // Disconnect from island graph.
        const bodyA: b2Body = j.m_bodyA;
        const bodyB: b2Body = j.m_bodyB;
        const collideConnected: boolean = j.m_collideConnected;

        // Wake up connected bodies.
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);

        // Remove from body 1.
        if (j.m_edgeA.prev) {
            j.m_edgeA.prev.next = j.m_edgeA.next;
        }

        if (j.m_edgeA.next) {
            j.m_edgeA.next.prev = j.m_edgeA.prev;
        }

        if (j.m_edgeA === bodyA.m_jointList) {
            bodyA.m_jointList = j.m_edgeA.next;
        }

        j.m_edgeA.Reset();

        // Remove from body 2
        if (j.m_edgeB.prev) {
            j.m_edgeB.prev.next = j.m_edgeB.next;
        }

        if (j.m_edgeB.next) {
            j.m_edgeB.next.prev = j.m_edgeB.prev;
        }

        if (j.m_edgeB === bodyB.m_jointList) {
            bodyB.m_jointList = j.m_edgeB.next;
        }

        j.m_edgeB.Reset();

        b2World._Joint_Destroy(j);

        !!B2_DEBUG && b2Assert(this.m_jointCount > 0);
        --this.m_jointCount;

        // If the joint prevents collisions, then flag any contacts for filtering.
        if (!collideConnected) {
            let edge: b2ContactEdge | null = bodyB.GetContactList();
            while (edge) {
                if (edge.other === bodyA) {
                    // Flag the contact for filtering at the next time step (where either
                    // body is awake).
                    edge.contact.FlagForFiltering();
                }

                edge = edge.next;
            }
        }
    }

    CreateParticleSystem(def: b2ParticleSystemDef): b2ParticleSystem {
        if (!B2_ENABLE_PARTICLE) {
            throw new Error();
        }

        if (this.IsLocked()) {
            throw new Error();
        }

        const p = new b2ParticleSystem(def, this);

        // Add to world doubly linked list.
        p.m_prev = null;
        p.m_next = this.m_particleSystemList;
        if (this.m_particleSystemList) {
            this.m_particleSystemList.m_prev = p;
        }
        this.m_particleSystemList = p;

        return p;
    }

    DestroyParticleSystem(p: b2ParticleSystem): void {
        if (!B2_ENABLE_PARTICLE) {
            throw new Error();
        }

        if (this.IsLocked()) {
            throw new Error();
        }

        // Remove world particleSystem list.
        if (p.m_prev) {
            p.m_prev.m_next = p.m_next;
        }

        if (p.m_next) {
            p.m_next.m_prev = p.m_prev;
        }

        if (p === this.m_particleSystemList) {
            this.m_particleSystemList = p.m_next;
        }
    }

    CalculateReasonableParticleIterations(timeStep: number): number {
        if (!B2_ENABLE_PARTICLE || this.m_particleSystemList === null) {
            return 1;
        }

        // todo:
        function GetSmallestRadius(world: b2World): number {
            let smallestRadius = b2_maxFloat;
            for (let system = world.GetParticleSystemList(); system !== null; system = system.m_next) {
                smallestRadius = b2Min(smallestRadius, system.GetRadius());
            }
            return smallestRadius;
        }

        // Use the smallest radius, since that represents the worst-case.
        return b2CalculateParticleIterations(this.m_gravity.Length(), GetSmallestRadius(this), timeStep);
    }

    Step(dt: number, velocityIterations: number,
         positionIterations: number,
         particleIterations: number = this.CalculateReasonableParticleIterations(dt)): void {
        const stepTimer = Step_s_stepTimer.Reset();

        // If new fixtures were added, we need to find the new contacts.
        if (this.m_newFixture) {
            this.m_contactManager.FindNewContacts();
            this.m_newFixture = false;
        }

        this.m_locked = true;

        const step = Step_s_step;
        step.dt = dt;
        step.velocityIterations = velocityIterations;
        step.positionIterations = positionIterations;
        if (B2_ENABLE_PARTICLE) {
            step.particleIterations = particleIterations;
        }
        if (dt > 0) {
            step.inv_dt = 1 / dt;
        } else {
            step.inv_dt = 0;
        }

        step.dtRatio = this.m_inv_dt0 * dt;

        step.warmStarting = this.m_warmStarting;

        // Update contacts. This is where some contacts are destroyed.
        const timer = Step_s_timer.Reset();
        this.m_contactManager.Collide();
        this.m_profile.collide = timer.GetMilliseconds();

        // Integrate velocities, solve velocity constraints, and integrate positions.
        if (this.m_stepComplete && step.dt > 0) {
            const timer = Step_s_timer.Reset();
            if (B2_ENABLE_PARTICLE) {
                for (let p = this.m_particleSystemList; p; p = p.m_next) {
                    p.Solve(step); // Particle Simulation
                }
            }
            this.Solve(step);
            this.m_profile.solve = timer.GetMilliseconds();
        }

        // Handle TOI events.
        if (this.m_continuousPhysics && step.dt > 0) {
            const timer = Step_s_timer.Reset();
            this.SolveTOI(step);
            this.m_profile.solveTOI = timer.GetMilliseconds();
        }

        if (step.dt > 0) {
            this.m_inv_dt0 = step.inv_dt;
        }

        if (this.m_clearForces) {
            this.ClearForces();
        }

        this.m_locked = false;

        this.m_profile.step = stepTimer.GetMilliseconds();
    }

    /// Manually clear the force buffer on all bodies. By default, forces are cleared automatically
    /// after each call to Step. The default behavior is modified by calling SetAutoClearForces.
    /// The purpose of this function is to support sub-stepping. Sub-stepping is often used to maintain
    /// a fixed sized time step under a variable frame-rate.
    /// When you perform sub-stepping you will disable auto clearing of forces and instead call
    /// ClearForces after all sub-steps are complete in one pass of your game loop.
    /// @see SetAutoClearForces
    ClearForces(): void {
        for (let body = this.m_bodyList; body; body = body.m_next) {
            body.m_force.SetZero();
            body.m_torque = 0;
        }
    }

    /// Query the world for all fixtures that potentially overlap the
    /// provided AABB.
    /// @param callback a user implemented callback class.
    /// @param aabb the query box.
    QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
    QueryAABB(aabb: b2AABB, fn: b2QueryCallbackFunction): void;
    QueryAABB(...args: any[]): void {
        if (args[0] instanceof b2QueryCallback) {
            this._QueryAABB(args[0], args[1]);
        } else {
            this._QueryAABB(null, args[0], args[1]);
        }
    }

    private _QueryAABB(callback: b2QueryCallback | null, aabb: b2AABB, fn?: b2QueryCallbackFunction): void {
        this.m_contactManager.m_broadPhase.Query(aabb, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
            const fixture_proxy: b2FixtureProxy = proxy.userData;
            !!B2_DEBUG && b2Assert(fixture_proxy instanceof b2FixtureProxy);
            const fixture: b2Fixture = fixture_proxy.fixture;
            if (callback) {
                return callback.ReportFixture(fixture);
            } else if (fn) {
                return fn(fixture);
            }
            return true;
        });
        if (B2_ENABLE_PARTICLE && callback instanceof b2QueryCallback) {
            for (let p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryAABB(callback, aabb);
                }
            }
        }
    }

    QueryAllAABB(aabb: b2AABB, out: b2Fixture[] = []): b2Fixture[] {
        this.QueryAABB(aabb, (fixture: b2Fixture): boolean => {
            out.push(fixture);
            return true;
        });
        return out;
    }

    /// Query the world for all fixtures that potentially overlap the
    /// provided point.
    /// @param callback a user implemented callback class.
    /// @param point the query point.
    QueryPointAABB(callback: b2QueryCallback, point: XY): void;
    QueryPointAABB(point: XY, fn: b2QueryCallbackFunction): void;
    QueryPointAABB(...args: any[]): void {
        if (args[0] instanceof b2QueryCallback) {
            this._QueryPointAABB(args[0], args[1]);
        } else {
            this._QueryPointAABB(null, args[0], args[1]);
        }
    }

    private _QueryPointAABB(callback: b2QueryCallback | null, point: XY, fn?: b2QueryCallbackFunction): void {
        this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
            const fixture_proxy: b2FixtureProxy = proxy.userData;
            !!B2_DEBUG && b2Assert(fixture_proxy instanceof b2FixtureProxy);
            const fixture: b2Fixture = fixture_proxy.fixture;
            if (callback) {
                return callback.ReportFixture(fixture);
            } else if (fn) {
                return fn(fixture);
            }
            return true;
        });
        if (B2_ENABLE_PARTICLE && callback instanceof b2QueryCallback) {
            for (let p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryPointAABB(callback, point);
                }
            }
        }
    }

    QueryAllPointAABB(point: XY, out: b2Fixture[] = []): b2Fixture[] {
        this.QueryPointAABB(point, (fixture: b2Fixture): boolean => {
            out.push(fixture);
            return true;
        });
        return out;
    }

    QueryFixtureShape(callback: b2QueryCallback, shape: b2Shape, index: number, transform: b2Transform): void;
    QueryFixtureShape(shape: b2Shape, index: number, transform: b2Transform, fn: b2QueryCallbackFunction): void;
    QueryFixtureShape(...args: any[]): void {
        if (args[0] instanceof b2QueryCallback) {
            this._QueryFixtureShape(args[0], args[1], args[2], args[3]);
        } else {
            this._QueryFixtureShape(null, args[0], args[1], args[2], args[3]);
        }
    }

    private static QueryFixtureShape_s_aabb = new b2AABB();

    private _QueryFixtureShape(callback: b2QueryCallback | null, shape: b2Shape, index: number, transform: b2Transform, fn?: b2QueryCallbackFunction): void {
        const aabb: b2AABB = b2World.QueryFixtureShape_s_aabb;
        shape.ComputeAABB(aabb, transform, index);
        this.m_contactManager.m_broadPhase.Query(aabb, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
            const fixture_proxy: b2FixtureProxy = proxy.userData;
            !!B2_DEBUG && b2Assert(fixture_proxy instanceof b2FixtureProxy);
            const fixture: b2Fixture = fixture_proxy.fixture;
            if (b2TestOverlapShape(shape, index, fixture.GetShape(), fixture_proxy.childIndex, transform, fixture.GetBody().GetTransform())) {
                if (callback) {
                    return callback.ReportFixture(fixture);
                } else if (fn) {
                    return fn(fixture);
                }
            }
            return true;
        });
        if (B2_ENABLE_PARTICLE && callback instanceof b2QueryCallback) {
            for (let p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryAABB(callback, aabb);
                }
            }
        }
    }

    QueryAllFixtureShape(shape: b2Shape, index: number, transform: b2Transform, out: b2Fixture[] = []): b2Fixture[] {
        this.QueryFixtureShape(shape, index, transform, (fixture: b2Fixture): boolean => {
            out.push(fixture);
            return true;
        });
        return out;
    }

    QueryFixturePoint(callback: b2QueryCallback, point: XY): void;
    QueryFixturePoint(point: XY, fn: b2QueryCallbackFunction): void;
    QueryFixturePoint(...args: any[]): void {
        if (args[0] instanceof b2QueryCallback) {
            this._QueryFixturePoint(args[0], args[1]);
        } else {
            this._QueryFixturePoint(null, args[0], args[1]);
        }
    }

    private _QueryFixturePoint(callback: b2QueryCallback | null, point: XY, fn?: b2QueryCallbackFunction): void {
        this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
            const fixture_proxy: b2FixtureProxy = proxy.userData;
            !!B2_DEBUG && b2Assert(fixture_proxy instanceof b2FixtureProxy);
            const fixture: b2Fixture = fixture_proxy.fixture;
            if (fixture.TestPoint(point)) {
                if (callback) {
                    return callback.ReportFixture(fixture);
                } else if (fn) {
                    return fn(fixture);
                }
            }
            return true;
        });
        if (B2_ENABLE_PARTICLE && callback) {
            for (let p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryPointAABB(callback, point);
                }
            }
        }
    }

    QueryAllFixturePoint(point: XY, out: b2Fixture[] = []): b2Fixture[] {
        this.QueryFixturePoint(point, (fixture: b2Fixture): boolean => {
            out.push(fixture);
            return true;
        });
        return out;
    }

    /// Ray-cast the world for all fixtures in the path of the ray. Your callback
    /// controls whether you get the closest point, any point, or n-points.
    /// The ray-cast ignores shapes that contain the starting point.
    /// @param callback a user implemented callback class.
    /// @param point1 the ray starting point
    /// @param point2 the ray ending point
    RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
    RayCast(point1: XY, point2: XY, fn: b2RayCastCallbackFunction): void;
    RayCast(...args: any[]): void {
        if (args[0] instanceof b2RayCastCallback) {
            this._RayCast(args[0], args[1], args[2]);
        } else {
            this._RayCast(null, args[0], args[1], args[2]);
        }
    }

    private static RayCast_s_input = new b2RayCastInput();
    private static RayCast_s_output = new b2RayCastOutput();
    private static RayCast_s_point = new b2Vec2();

    private _RayCast(callback: b2RayCastCallback | null, point1: XY, point2: XY, fn?: b2RayCastCallbackFunction): void {
        const input: b2RayCastInput = b2World.RayCast_s_input;
        input.maxFraction = 1;
        input.p1.Copy(point1);
        input.p2.Copy(point2);
        this.m_contactManager.m_broadPhase.RayCast(input, (input: b2RayCastInput, proxy: b2TreeNode<b2FixtureProxy>): number => {
            const fixture_proxy: b2FixtureProxy = proxy.userData;
            !!B2_DEBUG && b2Assert(fixture_proxy instanceof b2FixtureProxy);
            const fixture: b2Fixture = fixture_proxy.fixture;
            const index: number = fixture_proxy.childIndex;
            const output: b2RayCastOutput = b2World.RayCast_s_output;
            const hit: boolean = fixture.RayCast(output, input, index);
            if (hit) {
                const fraction: number = output.fraction;
                const point: b2Vec2 = b2World.RayCast_s_point;
                point.Set((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
                if (callback) {
                    return callback.ReportFixture(fixture, point, output.normal, fraction);
                } else if (fn) {
                    return fn(fixture, point, output.normal, fraction);
                }
            }
            return input.maxFraction;
        });
        if (B2_ENABLE_PARTICLE && callback) {
            for (let p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.RayCast(callback, point1, point2);
                }
            }
        }
    }

    RayCastOne(point1: XY, point2: XY): b2Fixture | null {
        let result: b2Fixture | null = null;
        let min_fraction: number = 1;
        this.RayCast(point1, point2, (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number => {
            if (fraction < min_fraction) {
                min_fraction = fraction;
                result = fixture;
            }
            return min_fraction;
        });
        return result;
    }

    RayCastAll(point1: XY, point2: XY, out: b2Fixture[] = []): b2Fixture[] {
        this.RayCast(point1, point2, (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number => {
            out.push(fixture);
            return 1;
        });
        return out;
    }

    /// Get the world body list. With the returned body, use b2Body::GetNext to get
    /// the next body in the world list. A NULL body indicates the end of the list.
    /// @return the head of the world body list.
    GetBodyList(): b2Body | null {
        return this.m_bodyList;
    }

    /// Get the world joint list. With the returned joint, use b2Joint::GetNext to get
    /// the next joint in the world list. A NULL joint indicates the end of the list.
    /// @return the head of the world joint list.
    GetJointList(): b2Joint | null {
        return this.m_jointList;
    }

    GetParticleSystemList(): b2ParticleSystem | null {
        return this.m_particleSystemList;
    }

    /// Get the world contact list. With the returned contact, use b2Contact::GetNext to get
    /// the next contact in the world list. A NULL contact indicates the end of the list.
    /// @return the head of the world contact list.
    /// @warning contacts are created and destroyed in the middle of a time step.
    /// Use b2ContactListener to avoid missing contacts.
    GetContactList(): b2Contact | null {
        return this.m_contactManager.m_contactList;
    }

    /// Enable/disable sleep.
    SetAllowSleeping(flag: boolean): void {
        if (flag === this.m_allowSleep) {
            return;
        }

        this.m_allowSleep = flag;
        if (!this.m_allowSleep) {
            for (let b = this.m_bodyList; b; b = b.m_next) {
                b.SetAwake(true);
            }
        }
    }

    GetAllowSleeping(): boolean {
        return this.m_allowSleep;
    }

    /// Enable/disable warm starting. For testing.
    SetWarmStarting(flag: boolean): void {
        this.m_warmStarting = flag;
    }

    GetWarmStarting(): boolean {
        return this.m_warmStarting;
    }

    /// Enable/disable continuous physics. For testing.
    SetContinuousPhysics(flag: boolean): void {
        this.m_continuousPhysics = flag;
    }

    GetContinuousPhysics(): boolean {
        return this.m_continuousPhysics;
    }

    /// Enable/disable single stepped continuous physics. For testing.
    SetSubStepping(flag: boolean): void {
        this.m_subStepping = flag;
    }

    GetSubStepping(): boolean {
        return this.m_subStepping;
    }

    /// Get the number of broad-phase proxies.
    GetProxyCount(): number {
        return this.m_contactManager.m_broadPhase.GetProxyCount();
    }

    /// Get the number of bodies.
    GetBodyCount(): number {
        return this.m_bodyCount;
    }

    /// Get the number of joints.
    GetJointCount(): number {
        return this.m_jointCount;
    }

    /// Get the number of contacts (each may have 0 or more contact points).
    GetContactCount(): number {
        return this.m_contactManager.m_contactCount;
    }

    /// Get the height of the dynamic tree.
    GetTreeHeight(): number {
        return this.m_contactManager.m_broadPhase.GetTreeHeight();
    }

    /// Get the balance of the dynamic tree.
    GetTreeBalance(): number {
        return this.m_contactManager.m_broadPhase.GetTreeBalance();
    }

    /// Get the quality metric of the dynamic tree. The smaller the better.
    /// The minimum is 1.
    GetTreeQuality(): number {
        return this.m_contactManager.m_broadPhase.GetTreeQuality();
    }

    /// Change the global gravity vector.
    SetGravity(gravity: XY, wake: boolean = true) {
        if (!b2Vec2.IsEqualToV(this.m_gravity, gravity)) {
            this.m_gravity.Copy(gravity);

            if (wake) {
                for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
                    b.SetAwake(true);
                }
            }
        }
    }

    /// Get the global gravity vector.
    GetGravity(): Readonly<b2Vec2> {
        return this.m_gravity;
    }

    /// Is the world locked (in the middle of a time step).
    IsLocked(): boolean {
        return this.m_locked;
    }

    /// Set flag to control automatic clearing of forces after each time step.
    SetAutoClearForces(flag: boolean): void {
        this.m_clearForces = flag;
    }

    /// Get the flag that controls automatic clearing of forces after each time step.
    GetAutoClearForces(): boolean {
        return this.m_clearForces;
    }

    /// Shift the world origin. Useful for large worlds.
    /// The body shift formula is: position -= newOrigin
    /// @param newOrigin the new origin with respect to the old origin
    ShiftOrigin(newOrigin: XY): void {
        if (this.IsLocked()) {
            throw new Error();
        }

        for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
            b.m_xf.p.SelfSub(newOrigin);
            b.m_sweep.c0.SelfSub(newOrigin);
            b.m_sweep.c.SelfSub(newOrigin);
        }

        for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
            j.ShiftOrigin(newOrigin);
        }

        this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
    }

    /// Get the contact manager for testing.
    GetContactManager(): b2ContactManager {
        return this.m_contactManager;
    }

    /// Get the current profile.
    GetProfile(): b2Profile {
        return this.m_profile;
    }

    Solve(step: b2TimeStep): void {
        if (B2_ENABLE_PARTICLE) {
            // update previous transforms
            for (let b = this.m_bodyList; b; b = b.m_next) {
                b.m_xf0.Copy(b.m_xf);
            }
        }

        if (B2_ENABLE_CONTROLLER) {
            // @see b2Controller list
            for (let controller = this.m_controllerList; controller; controller = controller.m_next) {
                controller.Step(step);
            }
        }

        this.m_profile.solveInit = 0;
        this.m_profile.solveVelocity = 0;
        this.m_profile.solvePosition = 0;

        // Size the island for the worst case.
        const island = this.m_island;
        island.Initialize(this.m_bodyCount,
            this.m_contactManager.m_contactCount,
            this.m_jointCount,
            this.m_contactManager.m_contactListener);

        // Clear all the island flags.
        for (let b = this.m_bodyList; b; b = b.m_next) {
            b.m_islandFlag = false;
        }
        for (let c = this.m_contactManager.m_contactList; c; c = c.m_next) {
            c.m_islandFlag = false;
        }
        for (let j = this.m_jointList; j; j = j.m_next) {
            j.m_islandFlag = false;
        }

        // Build and simulate all awake islands.
        const stackSize = this.m_bodyCount; // DEBUG
        const stack = this.s_stack;
        for (let seed = this.m_bodyList; seed; seed = seed.m_next) {
            if (seed.m_islandFlag) {
                continue;
            }

            if (!seed.IsAwake() || !seed.IsActive()) {
                continue;
            }

            // The seed can be dynamic or kinematic.
            if (seed.GetType() === b2BodyType.b2_staticBody) {
                continue;
            }

            // Reset island and stack.
            island.Clear();
            let stackCount: number = 0;
            stack[stackCount++] = seed;
            seed.m_islandFlag = true;

            // Perform a depth first search (DFS) on the constraint graph.
            while (stackCount > 0) {
                // Grab the next body off the stack and add it to the island.
                const b: b2Body | null = stack[--stackCount];
                if (!b) {
                    throw new Error();
                }
                !!B2_DEBUG && b2Assert(b.IsActive());
                island.AddBody(b);

                // Make sure the body is awake. (without resetting sleep timer).
                b.m_awakeFlag = true;

                // To keep islands as small as possible, we don't
                // propagate islands across static bodies.
                if (b.GetType() === b2BodyType.b2_staticBody) {
                    continue;
                }

                // Search all contacts connected to this body.
                for (let ce = b.m_contactList; ce; ce = ce.next) {
                    const contact = ce.contact;

                    // Has this contact already been added to an island?
                    if (contact.m_islandFlag) {
                        continue;
                    }

                    // Is this contact solid and touching?
                    if (!contact.IsEnabled() || !contact.IsTouching()) {
                        continue;
                    }

                    // Skip sensors.
                    const sensorA = contact.m_fixtureA.m_isSensor;
                    const sensorB = contact.m_fixtureB.m_isSensor;
                    if (sensorA || sensorB) {
                        continue;
                    }

                    island.AddContact(contact);
                    contact.m_islandFlag = true;

                    const other = ce.other;

                    // Was the other body already added to this island?
                    if (other.m_islandFlag) {
                        continue;
                    }

                    !!B2_DEBUG && b2Assert(stackCount < stackSize);
                    stack[stackCount++] = other;
                    other.m_islandFlag = true;
                }

                // Search all joints connect to this body.
                for (let je = b.m_jointList; je; je = je.next) {
                    if (je.joint.m_islandFlag) {
                        continue;
                    }

                    const other = je.other;

                    // Don't simulate joints connected to inactive bodies.
                    if (!other.IsActive()) {
                        continue;
                    }

                    island.AddJoint(je.joint);
                    je.joint.m_islandFlag = true;

                    if (other.m_islandFlag) {
                        continue;
                    }

                    !!B2_DEBUG && b2Assert(stackCount < stackSize);
                    stack[stackCount++] = other;
                    other.m_islandFlag = true;
                }
            }

            if ((island.Solve(this.m_profile, step, this.m_gravity, this.m_allowSleep) & 3) === 3) {
                island.SleepAll();
            }

            // Post solve cleanup.
            for (let i = 0; i < island.m_bodyCount; ++i) {
                // Allow static bodies to participate in other islands.
                const b = island.m_bodies[i];
                if (b.GetType() === b2BodyType.b2_staticBody) {
                    b.m_islandFlag = false;
                }
            }
        }

        for (let i = 0; i < stack.length; ++i) {
            if (!stack[i]) {
                break;
            }
            stack[i] = null;
        }

        const timer = Step_s_broadphaseTimer.Reset();

        // Synchronize fixtures, check for out of range bodies.
        this._SynchronizeFixturesCheck();

        // Look for new contacts.
        this.m_contactManager.FindNewContacts();
        this.m_profile.broadphase = timer.GetMilliseconds();
    }

    _SynchronizeFixturesCheck() {
        // Synchronize fixtures, check for out of range bodies.
        for (let b = this.m_bodyList; b; b = b.m_next) {
            // If a body was not in an island then it did not move.
            if (!b.m_islandFlag) {
                continue;
            }

            if (b.GetType() === b2BodyType.b2_staticBody) {
                continue;
            }

            // Update fixtures (for broad-phase).
            b.SynchronizeFixtures();
        }
    }

    SolveTOI(step: b2TimeStep): void {
        const island: b2Island = this.m_island;
        island.Initialize(b2_maxTOIContacts << 1, b2_maxTOIContacts, 0, this.m_contactManager.m_contactListener);

        if (this.m_stepComplete) {
            for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
                b.m_islandFlag = false;
                b.m_sweep.alpha0 = 0;
            }

            for (let c: b2Contact | null = this.m_contactManager.m_contactList; c; c = c.m_next) {
                // Invalidate TOI
                c.m_toiFlag = false;
                c.m_islandFlag = false;
                c.m_toiCount = 0;
                c.m_toi = 1.0;
            }
        }

        // Find TOI events and solve them.
        for (; ;) {
            // Find the first TOI.
            let minContact: b2Contact | null = null;
            let minAlpha = 1.0;

            for (let c = this.m_contactManager.m_contactList; c; c = c.m_next) {
                // Is this contact disabled?
                if (!c.IsEnabled()) {
                    continue;
                }

                // Prevent excessive sub-stepping.
                if (c.m_toiCount > b2_maxSubSteps) {
                    continue;
                }

                let alpha: number = 1;
                if (c.m_toiFlag) {
                    // This contact has a valid cached TOI.
                    alpha = c.m_toi;
                } else {
                    const fA: b2Fixture = c.GetFixtureA();
                    const fB: b2Fixture = c.GetFixtureB();

                    // Is there a sensor?
                    if (fA.IsSensor() || fB.IsSensor()) {
                        continue;
                    }

                    const bA: b2Body = fA.GetBody();
                    const bB: b2Body = fB.GetBody();

                    const typeA: b2BodyType = bA.m_type;
                    const typeB: b2BodyType = bB.m_type;
                    !!B2_DEBUG && b2Assert(typeA !== b2BodyType.b2_staticBody || typeB !== b2BodyType.b2_staticBody);

                    const activeA: boolean = bA.IsAwake() && typeA !== b2BodyType.b2_staticBody;
                    const activeB: boolean = bB.IsAwake() && typeB !== b2BodyType.b2_staticBody;

                    // Is at least one body active (awake and dynamic or kinematic)?
                    if (!activeA && !activeB) {
                        continue;
                    }

                    const collideA: boolean = bA.IsBullet() || typeA !== b2BodyType.b2_dynamicBody;
                    const collideB: boolean = bB.IsBullet() || typeB !== b2BodyType.b2_dynamicBody;

                    // Are these two non-bullet dynamic bodies?
                    if (!collideA && !collideB) {
                        continue;
                    }

                    // Compute the TOI for this contact.
                    // Put the sweeps onto the same time interval.
                    let alpha0: number = bA.m_sweep.alpha0;

                    if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0) {
                        alpha0 = bB.m_sweep.alpha0;
                        bA.m_sweep.Advance(alpha0);
                    } else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0) {
                        alpha0 = bA.m_sweep.alpha0;
                        bB.m_sweep.Advance(alpha0);
                    }

                    !!B2_DEBUG && b2Assert(alpha0 < 1);

                    const indexA: number = c.GetChildIndexA();
                    const indexB: number = c.GetChildIndexB();

                    // Compute the time of impact in interval [0, minTOI]
                    const input: b2TOIInput = SolveTOI_s_toi_input;
                    input.proxyA.SetShape(fA.GetShape(), indexA);
                    input.proxyB.SetShape(fB.GetShape(), indexB);
                    input.sweepA.Copy(bA.m_sweep);
                    input.sweepB.Copy(bB.m_sweep);
                    input.tMax = 1;

                    const output: b2TOIOutput = SolveTOI_s_toi_output;
                    b2TimeOfImpact(output, input);

                    // Beta is the fraction of the remaining portion of the .
                    const beta: number = output.t;
                    if (output.state === b2TOIOutputState.e_touching) {
                        alpha = b2Min(alpha0 + (1 - alpha0) * beta, 1);
                    } else {
                        alpha = 1;
                    }

                    c.m_toi = alpha;
                    c.m_toiFlag = true;
                }

                if (alpha < minAlpha) {
                    // This is the minimum TOI found so far.
                    minContact = c;
                    minAlpha = alpha;
                }
            }

            if (minContact === null || 1 - 10 * b2_epsilon < minAlpha) {
                // No more TOI events. Done!
                this.m_stepComplete = true;
                break;
            }

            // Advance the bodies to the TOI.
            const fA: b2Fixture = minContact.GetFixtureA();
            const fB: b2Fixture = minContact.GetFixtureB();
            const bA: b2Body = fA.GetBody();
            const bB: b2Body = fB.GetBody();

            const backup1 = SolveTOI_s_backup1.Copy(bA.m_sweep);
            const backup2 = SolveTOI_s_backup2.Copy(bB.m_sweep);

            bA.Advance(minAlpha);
            bB.Advance(minAlpha);

            // The TOI contact likely has some new contact points.
            minContact.Update(this.m_contactManager.m_contactListener);
            minContact.m_toiFlag = false;
            ++minContact.m_toiCount;

            // Is the contact solid?
            if (!minContact.IsEnabled() || !minContact.IsTouching()) {
                // Restore the sweeps.
                minContact.SetEnabled(false);
                bA.m_sweep.Copy(backup1);
                bB.m_sweep.Copy(backup2);
                bA.SynchronizeTransform();
                bB.SynchronizeTransform();
                continue;
            }

            bA.SetAwake(true);
            bB.SetAwake(true);

            // Build the island
            island.Clear();
            island.AddBody(bA);
            island.AddBody(bB);
            island.AddContact(minContact);

            bA.m_islandFlag = true;
            bB.m_islandFlag = true;
            minContact.m_islandFlag = true;

            // Get contacts on bodyA and bodyB.
            // const bodies: b2Body[] = [bA, bB];
            for (let i = 0; i < 2; ++i) {
                const body: b2Body = (i === 0) ? (bA) : (bB); // bodies[i];
                if (body.m_type === b2BodyType.b2_dynamicBody) {
                    for (let ce: b2ContactEdge | null = body.m_contactList; ce; ce = ce.next) {
                        if (island.m_bodyCount === island.m_bodyCapacity) {
                            break;
                        }

                        if (island.m_contactCount === island.m_contactCapacity) {
                            break;
                        }

                        const contact: b2Contact = ce.contact;

                        // Has this contact already been added to the island?
                        if (contact.m_islandFlag) {
                            continue;
                        }

                        // Only add static, kinematic, or bullet bodies.
                        const other = ce.other;
                        if (other.m_type === b2BodyType.b2_dynamicBody &&
                            !body.IsBullet() && !other.IsBullet()) {
                            continue;
                        }

                        // Skip sensors.
                        const sensorA = contact.m_fixtureA.m_isSensor;
                        const sensorB = contact.m_fixtureB.m_isSensor;
                        if (sensorA || sensorB) {
                            continue;
                        }

                        // Tentatively advance the body to the TOI.
                        const backup = SolveTOI_s_backup.Copy(other.m_sweep);
                        if (!other.m_islandFlag) {
                            other.Advance(minAlpha);
                        }

                        // Update the contact points
                        contact.Update(this.m_contactManager.m_contactListener);

                        // Was the contact disabled by the user?
                        if (!contact.IsEnabled()) {
                            other.m_sweep.Copy(backup);
                            other.SynchronizeTransform();
                            continue;
                        }

                        // Are there contact points?
                        if (!contact.IsTouching()) {
                            other.m_sweep.Copy(backup);
                            other.SynchronizeTransform();
                            continue;
                        }

                        // Add the contact to the island
                        contact.m_islandFlag = true;
                        island.AddContact(contact);

                        // Has the other body already been added to the island?
                        if (other.m_islandFlag) {
                            continue;
                        }

                        // Add the other body to the island.
                        other.m_islandFlag = true;

                        if (other.m_type !== b2BodyType.b2_staticBody) {
                            other.SetAwake(true);
                        }

                        island.AddBody(other);
                    }
                }
            }

            const subStep = SolveTOI_s_subStep;
            subStep.dt = (1 - minAlpha) * step.dt;
            subStep.inv_dt = 1 / subStep.dt;
            subStep.dtRatio = 1;
            subStep.positionIterations = 20;
            subStep.velocityIterations = step.velocityIterations;
            if (B2_ENABLE_PARTICLE) {
                subStep.particleIterations = step.particleIterations;
            }
            subStep.warmStarting = false;
            island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);

            // Reset island flags and synchronize broad-phase proxies.
            for (let i = 0; i < island.m_bodyCount; ++i) {
                const body: b2Body = island.m_bodies[i];
                body.m_islandFlag = false;

                if (body.m_type !== b2BodyType.b2_dynamicBody) {
                    continue;
                }

                body.SynchronizeFixtures();

                // Invalidate all contact TOIs on this displaced body.
                for (let ce: b2ContactEdge | null = body.m_contactList; ce; ce = ce.next) {
                    ce.contact.m_toiFlag = false;
                    ce.contact.m_islandFlag = false;
                }
            }

            // Commit fixture proxy movements to the broad-phase so that new contacts are created.
            // Also, some contacts can be destroyed.
            this.m_contactManager.FindNewContacts();

            if (this.m_subStepping) {
                this.m_stepComplete = false;
                break;
            }
        }
    }

    AddController(controller: b2Controller): b2Controller {
        if (!B2_ENABLE_CONTROLLER) {
            return controller;
        }
        // b2Assert(controller.m_world === null, "Controller can only be a member of one world");
        // controller.m_world = this;
        controller.m_next = this.m_controllerList;
        controller.m_prev = null;
        if (this.m_controllerList) {
            this.m_controllerList.m_prev = controller;
        }
        this.m_controllerList = controller;
        ++this.m_controllerCount;
        return controller;
    }

    RemoveController(controller: b2Controller): b2Controller {
        if (!B2_ENABLE_CONTROLLER) {
            return controller;
        }
        // b2Assert(controller.m_world === this, "Controller is not a member of this world");
        if (controller.m_prev) {
            controller.m_prev.m_next = controller.m_next;
        }
        if (controller.m_next) {
            controller.m_next.m_prev = controller.m_prev;
        }
        if (this.m_controllerList === controller) {
            this.m_controllerList = controller.m_next;
        }
        --this.m_controllerCount;
        controller.m_prev = null;
        controller.m_next = null;
        // delete controller.m_world; // = null;
        return controller;
    }
}
