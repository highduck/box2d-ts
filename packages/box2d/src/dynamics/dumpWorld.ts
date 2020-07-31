import {DumpJoint} from "./joints/dumpJoints";
import {DumpShape} from "../collision/shapes/dumpShapes";
import {b2Fixture} from "./b2Fixture";
import {b2Body, b2BodyType} from "./b2Body";
import {b2Joint, b2JointType} from "./joints/b2Joint";
import {b2World} from "./b2World";
import {b2Assert} from '../common/b2Settings';

/// Dump the world into the log file.
/// @warning this should be called outside of a time step.
// TODO: all of them :)

function DumpFixture(fixture: b2Fixture, log: (format: string, ...args: any[]) => void, bodyIndex: number): void {
    log("    const fd: b2FixtureDef = new b2FixtureDef();\n");
    log("    fd.friction = %.15f;\n", fixture.m_friction);
    log("    fd.restitution = %.15f;\n", fixture.m_restitution);
    log("    fd.density = %.15f;\n", fixture.m_density);
    log("    fd.isSensor = %s;\n", (fixture.m_isSensor) ? ("true") : ("false"));
    log("    fd.filter.categoryBits = %d;\n", fixture.m_filter.categoryBits);
    log("    fd.filter.maskBits = %d;\n", fixture.m_filter.maskBits);
    log("    fd.filter.groupIndex = %d;\n", fixture.m_filter.groupIndex);

    DumpShape(fixture.m_shape, log);

    log("\n");
    log("    fd.shape = shape;\n");
    log("\n");
    log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
}

/// Dump this body to a log file
function DumpBody(body: b2Body, log: (format: string, ...args: any[]) => void): void {
    const bodyIndex: number = body.m_islandIndex;

    log("{\n");
    log("  const bd: b2BodyDef = new b2BodyDef();\n");
    let type_str: string = "";
    switch (body.m_type) {
        case b2BodyType.b2_staticBody:
            type_str = "b2BodyType.b2_staticBody";
            break;
        case b2BodyType.b2_kinematicBody:
            type_str = "b2BodyType.b2_kinematicBody";
            break;
        case b2BodyType.b2_dynamicBody:
            type_str = "b2BodyType.b2_dynamicBody";
            break;
        default:
            !!B2_DEBUG && b2Assert(false);
            break;
    }
    log("  bd.type = %s;\n", type_str);
    log("  bd.position.Set(%.15f, %.15f);\n", body.m_xf.p.x, body.m_xf.p.y);
    log("  bd.angle = %.15f;\n", body.m_sweep.a);
    log("  bd.linearVelocity.Set(%.15f, %.15f);\n", body.m_linearVelocity.x, body.m_linearVelocity.y);
    log("  bd.angularVelocity = %.15f;\n", body.m_angularVelocity);
    log("  bd.linearDamping = %.15f;\n", body.m_linearDamping);
    log("  bd.angularDamping = %.15f;\n", body.m_angularDamping);
    log("  bd.allowSleep = %s;\n", (body.m_autoSleepFlag) ? ("true") : ("false"));
    log("  bd.awake = %s;\n", (body.m_awakeFlag) ? ("true") : ("false"));
    log("  bd.fixedRotation = %s;\n", (body.m_fixedRotationFlag) ? ("true") : ("false"));
    log("  bd.bullet = %s;\n", (body.m_bulletFlag) ? ("true") : ("false"));
    log("  bd.active = %s;\n", (body.m_activeFlag) ? ("true") : ("false"));
    log("  bd.gravityScale = %.15f;\n", body.m_gravityScale);
    log("\n");
    log("  bodies[%d] = this.m_world.CreateBody(bd);\n", body.m_islandIndex);
    log("\n");
    for (let f: b2Fixture | null = body.m_fixtureList; f; f = f.m_next) {
        log("  {\n");
        DumpFixture(f, log, bodyIndex);
        log("  }\n");
    }
    log("}\n");
}

export function DumpWorld(world: b2World, log: (format: string, ...args: any[]) => void): void {
    if (world.m_locked) {
        return;
    }

    log("const g: b2Vec2 = new b2Vec2(%.15f, %.15f);\n", world.m_gravity.x, world.m_gravity.y);
    log("this.m_world.SetGravity(g);\n");

    log("const bodies: b2Body[] = [];\n");
    log("const joints: b2Joint[] = [];\n");
    let i: number = 0;
    for (let b: b2Body | null = world.m_bodyList; b; b = b.m_next) {
        b.m_islandIndex = i;
        DumpBody(b, log);
        ++i;
    }

    i = 0;
    for (let j: b2Joint | null = world.m_jointList; j; j = j.m_next) {
        j._logIndex = i;
        ++i;
    }

// First pass on joints, skip gear joints.
    for (let j: b2Joint | null = world.m_jointList; j; j = j.m_next) {
        if (j.m_type === b2JointType.e_gearJoint) {
            continue;
        }

        log("{\n");
        DumpJoint(j, log);
        log("}\n");
    }

// Second pass on joints, only gear joints.
    for (let j: b2Joint | null = world.m_jointList; j; j = j.m_next) {
        if (j.m_type !== b2JointType.e_gearJoint) {
            continue;
        }

        log("{\n");
        DumpJoint(j, log);
        log("}\n");
    }
}