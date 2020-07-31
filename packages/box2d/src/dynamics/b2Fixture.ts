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

import {b2Assert} from "../common/b2Settings";
import {b2Transform, b2Vec2, XY} from "../common/b2Math";
import {b2AABB, b2RayCastInput, b2RayCastOutput} from "../collision/b2Collision";
import {b2TreeNode} from "../collision/b2DynamicTree";
import {b2MassData, b2Shape, b2ShapeType} from "../collision/shapes/b2Shape";
import {b2Body} from "./b2Body";

/// This holds contact filtering data.
export interface b2IFilter {
    /// The collision category bits. Normally you would just set one bit.
    categoryBits: number;

    /// The collision mask bits. This states the categories that this
    /// shape would accept for collision.
    maskBits: number;

    /// Collision groups allow a certain group of objects to never collide (negative)
    /// or always collide (positive). Zero means no collision group. Non-zero group
    /// filtering always wins against the mask bits.
    groupIndex?: number;
}

/// This holds contact filtering data.
export class b2Filter implements b2IFilter {
    static readonly DEFAULT: Readonly<b2Filter> = new b2Filter();

    /// The collision category bits. Normally you would just set one bit.
    categoryBits: number = 0x0001;

    /// The collision mask bits. This states the categories that this
    /// shape would accept for collision.
    maskBits: number = 0xFFFF;

    /// Collision groups allow a certain group of objects to never collide (negative)
    /// or always collide (positive). Zero means no collision group. Non-zero group
    /// filtering always wins against the mask bits.
    groupIndex: number = 0;

    Clone(): b2Filter {
        return new b2Filter().Copy(this);
    }

    Copy(other: b2IFilter): this {
        !!B2_DEBUG && b2Assert(this !== other);
        this.categoryBits = other.categoryBits;
        this.maskBits = other.maskBits;
        this.groupIndex = other.groupIndex ?? 0;
        return this;
    }
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
export interface b2IFixtureDef {
    /// The shape, this must be set. The shape will be cloned, so you
    /// can create the shape on the stack.
    shape: b2Shape;

    /// Use this to store application specific fixture data.
    userData?: any;

    /// The friction coefficient, usually in the range [0,1].
    friction?: number;

    /// The restitution (elasticity) usually in the range [0,1].
    restitution?: number;

    /// The density, usually in kg/m^2.
    density?: number;

    /// A sensor shape collects contact information but never generates a collision
    /// response.
    isSensor?: boolean;

    /// Contact filtering data.
    filter?: b2IFilter;
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
export class b2FixtureDef implements b2IFixtureDef {
    /// The shape, this must be set. The shape will be cloned, so you
    /// can create the shape on the stack.
    shape: b2Shape = null as unknown as b2Shape;

    /// Use this to store application specific fixture data.
    userData: any = null;

    /// The friction coefficient, usually in the range [0,1].
    friction = NaN;

    /// The restitution (elasticity) usually in the range [0,1].
    restitution = NaN;

    /// The density, usually in kg/m^2.
    density = NaN;

    /// A sensor shape collects contact information but never generates a collision
    /// response.
    isSensor: boolean = false;

    /// Contact filtering data.
    readonly filter: b2Filter = new b2Filter();

    constructor() {
        this.friction = 0.2;
        this.restitution = 0.0;
        this.density = 0.0;
    }
}

/// This proxy is used internally to connect fixtures to the broad-phase.
export class b2FixtureProxy {
    readonly aabb = new b2AABB();
    readonly fixture: b2Fixture;
    readonly childIndex: number = 0;
    treeNode: b2TreeNode<b2FixtureProxy>;

    constructor(fixture: b2Fixture, childIndex: number) {
        this.fixture = fixture;
        this.childIndex = childIndex;
        this.fixture.m_shape.ComputeAABB(this.aabb, this.fixture.m_body.GetTransform(), childIndex);
        this.treeNode = this.fixture.m_body.m_world.m_contactManager.m_broadPhase.CreateProxy(this.aabb, this);
    }

    Reset(): void {
        this.fixture.m_body.m_world.m_contactManager.m_broadPhase.DestroyProxy(this.treeNode);
    }

    Touch(): void {
        this.fixture.m_body.m_world.m_contactManager.m_broadPhase.TouchProxy(this.treeNode);
    }

    private static Synchronize_s_aabb1 = new b2AABB();
    private static Synchronize_s_aabb2 = new b2AABB();

    Synchronize(transform1: b2Transform, transform2: b2Transform, displacement: b2Vec2): void {
        if (transform1 === transform2) {
            this.fixture.m_shape.ComputeAABB(this.aabb, transform1, this.childIndex);
            this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, displacement);
        } else {
            // Compute an AABB that covers the swept shape (may miss some rotation effect).
            const aabb1: b2AABB = b2FixtureProxy.Synchronize_s_aabb1;
            const aabb2: b2AABB = b2FixtureProxy.Synchronize_s_aabb2;
            this.fixture.m_shape.ComputeAABB(aabb1, transform1, this.childIndex);
            this.fixture.m_shape.ComputeAABB(aabb2, transform2, this.childIndex);
            this.aabb.Combine2(aabb1, aabb2);
            this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, displacement);
        }
    }
}

/// A fixture is used to attach a shape to a body for collision detection. A fixture
/// inherits its transform from its parent. Fixtures hold additional non-geometric data
/// such as friction, collision filters, etc.
/// Fixtures are created via b2Body::CreateFixture.
/// @warning you cannot reuse fixtures.
export class b2Fixture {
    m_density = NaN;
    m_friction = NaN;
    m_restitution = NaN;

    m_next: b2Fixture | null = null;
    readonly m_body: b2Body;
    readonly m_shape: b2Shape;
    _shapeType: b2ShapeType;
    _shapeRadius = NaN;

    readonly m_proxies: b2FixtureProxy[] = [];

    get m_proxyCount(): number {
        return this.m_proxies.length;
    }

    readonly m_filter: b2Filter = new b2Filter();

    m_isSensor: boolean = false;

    m_userData: any = null;

    constructor(body: b2Body, def: b2IFixtureDef) {
        this.m_density = def.density ?? 0.0;
        this.m_friction = def.friction ?? 0.2;
        this.m_restitution = def.restitution ?? 0.0;
        this.m_body = body;
        this.m_shape = def.shape.Clone();
        this._shapeType = def.shape.m_type;
        // TODO: need to  sync radius if shape is changed by user!
        this._shapeRadius = def.shape.m_radius;
        this.m_userData = def.userData ?? null;
        this.m_filter.Copy(def.filter ?? b2Filter.DEFAULT);
        this.m_isSensor = def.isSensor ?? false;
    }

    Reset(): void {
        // The proxies must be destroyed before calling this.
        !!B2_DEBUG && b2Assert(this.m_proxyCount === 0);
    }

    /// Get the type of the child shape. You can use this to down cast to the concrete shape.
    /// @return the shape type.
    GetType(): b2ShapeType {
        return this._shapeType;
    }

    /// Get the child shape. You can modify the child shape, however you should not change the
    /// number of vertices because this will crash some collision caching mechanisms.
    /// Manipulating the shape may lead to non-physical behavior.
    GetShape(): b2Shape {
        return this.m_shape;
    }

    /// Set if this fixture is a sensor.
    SetSensor(sensor: boolean): void {
        if (sensor !== this.m_isSensor) {
            this.m_body.SetAwake(true);
            this.m_isSensor = sensor;
        }
    }

    /// Is this fixture a sensor (non-solid)?
    /// @return the true if the shape is a sensor.
    IsSensor(): boolean {
        return this.m_isSensor;
    }

    /// Set the contact filtering data. This will not update contacts until the next time
    /// step when either parent body is active and awake.
    /// This automatically calls Refilter.
    SetFilterData(filter: b2Filter): void {
        this.m_filter.Copy(filter);

        this.Refilter();
    }

    /// Get the contact filtering data.
    GetFilterData(): Readonly<b2Filter> {
        return this.m_filter;
    }

    /// Call this if you want to establish collision that was previously disabled by b2ContactFilter::ShouldCollide.
    Refilter(): void {
        // Flag associated contacts for filtering.
        let edge = this.m_body.GetContactList();

        while (edge) {
            const contact = edge.contact;
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();
            if (fixtureA === this || fixtureB === this) {
                contact.FlagForFiltering();
            }

            edge = edge.next;
        }

        // Touch each proxy so that new pairs may be created
        this.TouchProxies();
    }

    /// Get the parent body of this fixture. This is NULL if the fixture is not attached.
    /// @return the parent body.
    GetBody(): b2Body {
        return this.m_body;
    }

    /// Get the next fixture in the parent body's fixture list.
    /// @return the next shape.
    GetNext(): b2Fixture | null {
        return this.m_next;
    }

    /// Get the user data that was assigned in the fixture definition. Use this to
    /// store your application specific data.
    GetUserData(): any {
        return this.m_userData;
    }

    /// Set the user data. Use this to store your application specific data.
    SetUserData(data: any): void {
        this.m_userData = data;
    }

    /// Test a point for containment in this fixture.
    /// @param p a point in world coordinates.
    TestPoint(p: XY): boolean {
        return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
    }

    ComputeDistance(p: b2Vec2, normal: b2Vec2, childIndex: number): number {
        if (B2_ENABLE_PARTICLE) {
            return this.m_shape.ComputeDistance(this.m_body.GetTransform(), p, normal, childIndex);
        } else {
            return 0.0;
        }
    }

    /// Cast a ray against this shape.
    /// @param output the ray-cast results.
    /// @param input the ray-cast input parameters.
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, childIndex: number): boolean {
        return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
    }

    /// Get the mass data for this fixture. The mass data is based on the density and
    /// the shape. The rotational inertia is about the shape's origin. This operation
    /// may be expensive.
    GetMassData(massData: b2MassData = new b2MassData()): b2MassData {
        this.m_shape.ComputeMass(massData, this.m_density);

        return massData;
    }

    /// Set the density of this fixture. This will _not_ automatically adjust the mass
    /// of the body. You must call b2Body::ResetMassData to update the body's mass.
    SetDensity(density: number): void {
        this.m_density = density;
    }

    /// Get the density of this fixture.
    GetDensity(): number {
        return this.m_density;
    }

    /// Get the coefficient of friction.
    GetFriction(): number {
        return this.m_friction;
    }

    /// Set the coefficient of friction. This will _not_ change the friction of
    /// existing contacts.
    SetFriction(friction: number): void {
        this.m_friction = friction;
    }

    /// Get the coefficient of restitution.
    GetRestitution(): number {
        return this.m_restitution;
    }

    /// Set the coefficient of restitution. This will _not_ change the restitution of
    /// existing contacts.
    SetRestitution(restitution: number): void {
        this.m_restitution = restitution;
    }

    /// Get the fixture's AABB. This AABB may be enlarge and/or stale.
    /// If you need a more accurate AABB, compute it using the shape and
    /// the body transform.
    GetAABB(childIndex: number): Readonly<b2AABB> {
        !!B2_DEBUG && b2Assert(0 <= childIndex && childIndex < this.m_proxyCount);
        return this.m_proxies[childIndex].aabb;
    }

    // These support body activation/deactivation.
    CreateProxies(): void {
        if (this.m_proxies.length !== 0) {
            throw new Error();
        }
        // Create proxies in the broad-phase.
        for (let i = 0; i < this.m_shape.GetChildCount(); ++i) {
            this.m_proxies[i] = new b2FixtureProxy(this, i);
        }
    }

    DestroyProxies(): void {
        // Destroy proxies in the broad-phase.
        for (let i = 0; i < this.m_proxies.length; ++i) {
            this.m_proxies[i].Reset();
        }
        this.m_proxies.length = 0;
    }

    TouchProxies(): void {
        for (let i = 0; i < this.m_proxies.length; ++i) {
            this.m_proxies[i].Touch();
        }
    }

    SynchronizeProxies(transform1: b2Transform, transform2: b2Transform, displacement: b2Vec2): void {
        for (let i = 0; i < this.m_proxies.length; ++i) {
            this.m_proxies[i].Synchronize(transform1, transform2, displacement);
        }
    }
}
