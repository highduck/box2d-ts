import {b2Color, b2Draw, b2DrawFlags,} from "../common/b2Draw";
import {b2World} from "./b2World";
import {b2Body, b2BodyType} from "./b2Body";
import {b2AABB} from "../collision/b2Collision";
import {b2ChainShape} from "../collision/shapes/b2ChainShape";
import {b2CircleShape} from "../collision/shapes/b2CircleShape";
import {b2EdgeShape} from "../collision/shapes/b2EdgeShape";
import {b2PolygonShape} from "../collision/shapes/b2PolygonShape";
import {b2Shape, b2ShapeType} from "../collision/shapes/b2Shape";
import {b2Fixture, b2FixtureProxy} from "./b2Fixture";
import {b2Joint, b2JointType} from "./joints/b2Joint";
import {b2PulleyJoint} from "./joints/b2PulleyJoint";
import {b2Transform, b2Vec2} from "../common/b2Math";
import {b2ParticleSystem} from "../particle/b2ParticleSystem";

function DrawParticleSystem(drawer: b2Draw, system: b2ParticleSystem): void {
    const particleCount = system.GetParticleCount();
    if (particleCount) {
        const radius = system.GetRadius();
        const positionBuffer = system.GetPositionBuffer();
        if (system.m_colorBuffer.data) {
            const colorBuffer = system.GetColorBuffer();
            drawer.DrawParticles(positionBuffer, radius, colorBuffer, particleCount);
        } else {
            drawer.DrawParticles(positionBuffer, radius, null, particleCount);
        }
    }
}

const DrawJoint_s_p1: b2Vec2 = new b2Vec2();
const DrawJoint_s_p2: b2Vec2 = new b2Vec2();
const DrawJoint_s_color: b2Color = new b2Color(0.5, 0.8, 0.8);
const DrawJoint_s_c: b2Color = new b2Color();

function DrawJoint(drawer: b2Draw, joint: b2Joint): void {
    const bodyA: b2Body = joint.GetBodyA();
    const bodyB: b2Body = joint.GetBodyB();
    const xf1: b2Transform = bodyA.m_xf;
    const xf2: b2Transform = bodyB.m_xf;
    const x1: b2Vec2 = xf1.p;
    const x2: b2Vec2 = xf2.p;
    const p1: b2Vec2 = joint.GetAnchorA(DrawJoint_s_p1);
    const p2: b2Vec2 = joint.GetAnchorB(DrawJoint_s_p2);

    const color: b2Color = DrawJoint_s_color.SetRGB(0.5, 0.8, 0.8);

    switch (joint.m_type) {
        case b2JointType.e_distanceJoint:
            drawer.DrawSegment(p1, p2, color);
            break;

        case b2JointType.e_pulleyJoint: {
            const pulley = joint as b2PulleyJoint;
            const s1: b2Vec2 = pulley.GetGroundAnchorA();
            const s2: b2Vec2 = pulley.GetGroundAnchorB();
            drawer.DrawSegment(s1, p1, color);
            drawer.DrawSegment(s2, p2, color);
            drawer.DrawSegment(s1, s2, color);
            break;
        }

        case b2JointType.e_mouseJoint: {
            const c = DrawJoint_s_c;
            c.Set(0.0, 1.0, 0.0);
            drawer.DrawPoint(p1, 4.0, c);
            drawer.DrawPoint(p2, 4.0, c);

            c.Set(0.8, 0.8, 0.8);
            drawer.DrawSegment(p1, p2, c);
            break;
        }

        default:
            drawer.DrawSegment(x1, p1, color);
            drawer.DrawSegment(p1, p2, color);
            drawer.DrawSegment(x2, p2, color);
    }
}

const DrawShape_s_ghostColor = new b2Color();

function DrawShape(drawer: b2Draw, fixture: b2Fixture, color: b2Color): void {

    const shape: b2Shape = fixture.GetShape();

    switch (shape.m_type) {
        case b2ShapeType.e_circleShape: {
            const circle: b2CircleShape = shape as b2CircleShape;
            const center: b2Vec2 = circle.m_p;
            const radius: number = circle.m_radius;
            const axis: b2Vec2 = b2Vec2.UNITX;
            drawer.DrawSolidCircle(center, radius, axis, color);
            break;
        }

        case b2ShapeType.e_edgeShape: {
            const edge: b2EdgeShape = shape as b2EdgeShape;
            const v1: b2Vec2 = edge.m_vertex1;
            const v2: b2Vec2 = edge.m_vertex2;
            drawer.DrawSegment(v1, v2, color);
            break;
        }

        case b2ShapeType.e_chainShape: {
            const chain: b2ChainShape = shape as b2ChainShape;
            const count: number = chain.m_count;
            const vertices: b2Vec2[] = chain.m_vertices;
            const ghostColor: b2Color = DrawShape_s_ghostColor.SetRGBA(0.75 * color.r, 0.75 * color.g, 0.75 * color.b, color.a);
            let v1: b2Vec2 = vertices[0];
            drawer.DrawPoint(v1, 4.0, color);

            if (chain.m_hasPrevVertex) {
                const vp = chain.m_prevVertex;
                drawer.DrawSegment(vp, v1, ghostColor);
                drawer.DrawCircle(vp, 0.1, ghostColor);
            }

            for (let i: number = 1; i < count; ++i) {
                const v2: b2Vec2 = vertices[i];
                drawer.DrawSegment(v1, v2, color);
                drawer.DrawPoint(v2, 4.0, color);
                v1 = v2;
            }

            if (chain.m_hasNextVertex) {
                const vn = chain.m_nextVertex;
                drawer.DrawSegment(vn, v1, ghostColor);
                drawer.DrawCircle(vn, 0.1, ghostColor);
            }
            break;
        }

        case b2ShapeType.e_polygonShape: {
            const poly: b2PolygonShape = shape as b2PolygonShape;
            const vertexCount: number = poly.m_count;
            const vertices: b2Vec2[] = poly.m_vertices;
            drawer.DrawSolidPolygon(vertices, vertexCount, color);
            break;
        }
    }
}


/// Call this to draw shapes and other debug draw data.
const DrawDebugData_s_color = new b2Color(0, 0, 0);
const DrawDebugData_s_vs = b2Vec2.MakeArray(4);
const DrawDebugData_s_xf = new b2Transform();

export function drawDebugData(drawer: b2Draw, world: b2World): void {
    const flags = drawer.GetFlags();
    const color = DrawDebugData_s_color.SetRGB(0, 0, 0);

    if (flags & b2DrawFlags.e_shapeBit) {
        for (let b: b2Body | null = world.m_bodyList; b; b = b.m_next) {
            const xf: b2Transform = b.m_xf;

            drawer.PushTransform(xf);

            for (let f = b.GetFixtureList(); f; f = f.m_next) {
                if (!b.IsActive()) {
                    color.SetRGB(0.5, 0.5, 0.3);
                    DrawShape(drawer, f, color);
                } else if (b.GetType() === b2BodyType.b2_staticBody) {
                    color.SetRGB(0.5, 0.9, 0.5);
                    DrawShape(drawer, f, color);
                } else if (b.GetType() === b2BodyType.b2_kinematicBody) {
                    color.SetRGB(0.5, 0.5, 0.9);
                    DrawShape(drawer, f, color);
                } else if (!b.IsAwake()) {
                    color.SetRGB(0.6, 0.6, 0.6);
                    DrawShape(drawer, f, color);
                } else {
                    color.SetRGB(0.9, 0.7, 0.7);
                    DrawShape(drawer, f, color);
                }
            }

            drawer.PopTransform(xf);
        }
    }

    if (!!B2_ENABLE_PARTICLE && flags & b2DrawFlags.e_particleBit) {
        for (let p = world.m_particleSystemList; p; p = p.m_next) {
            DrawParticleSystem(drawer, p);
        }
    }

    if (flags & b2DrawFlags.e_jointBit) {
        for (let j = world.m_jointList; j; j = j.m_next) {
            DrawJoint(drawer, j);
        }
    }

    /*
    if (flags & b2DrawFlags.e_pairBit) {
      color.SetRGB(0.3, 0.9, 0.9);
      for (let contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();

        const cA = fixtureA.GetAABB().GetCenter();
        const cB = fixtureB.GetAABB().GetCenter();

        this.m_debugDraw.DrawSegment(cA, cB, color);
      }
    }
    */

    if (flags & b2DrawFlags.e_aabbBit) {
        color.SetRGB(0.9, 0.3, 0.9);
        const vs = DrawDebugData_s_vs;

        for (let b: b2Body | null = world.m_bodyList; b; b = b.m_next) {
            if (!b.IsActive()) {
                continue;
            }

            for (let f = b.GetFixtureList(); f; f = f.m_next) {
                for (let i = 0; i < f.m_proxyCount; ++i) {
                    const proxy: b2FixtureProxy = f.m_proxies[i];

                    const aabb: b2AABB = proxy.treeNode.aabb;
                    vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
                    vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
                    vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
                    vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);

                    drawer.DrawPolygon(vs, 4, color);
                }
            }
        }
    }

    if (flags & b2DrawFlags.e_centerOfMassBit) {
        for (let b: b2Body | null = world.m_bodyList; b; b = b.m_next) {
            const xf = DrawDebugData_s_xf;
            xf.q.Copy(b.m_xf.q);
            xf.p.Copy(b.GetWorldCenter());
            drawer.DrawTransform(xf);
        }
    }

    // @see b2Controller list
    if (B2_ENABLE_CONTROLLER) {
        if (flags & b2DrawFlags.e_controllerBit) {
            for (let c = world.m_controllerList; c; c = c.m_next) {
                c.Draw(drawer);
            }
        }
    }
}