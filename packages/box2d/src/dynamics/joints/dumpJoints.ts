import {b2DistanceJoint} from "./b2DistanceJoint";
import {b2FrictionJoint} from "./b2FrictionJoint";
import {b2GearJoint} from "./b2GearJoint";
import {b2Joint, b2JointType} from "./b2Joint";
import {b2MotorJoint} from "./b2MotorJoint";
import {b2PrismaticJoint} from "./b2PrismaticJoint";
import {b2PulleyJoint} from "./b2PulleyJoint";
import {b2RevoluteJoint} from "./b2RevoluteJoint";
import {b2RopeJoint} from "./b2RopeJoint";
import {b2WeldJoint} from "./b2WeldJoint";
import {b2WheelJoint} from "./b2WheelJoint";

function DumpDistanceJoint(joint: b2DistanceJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2DistanceJointDef = new b2DistanceJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.length = %.15f;\n", joint.m_length);
    log("  jd.frequencyHz = %.15f;\n", joint.m_frequencyHz);
    log("  jd.dampingRatio = %.15f;\n", joint.m_dampingRatio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpFrictionJoint(joint: b2FrictionJoint, log: (format: string, ...args: any[]) => void): void {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2FrictionJointDef = new b2FrictionJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.maxForce = %.15f;\n", joint.m_maxForce);
    log("  jd.maxTorque = %.15f;\n", joint.m_maxTorque);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}


function DumpMotorJoint(joint: b2MotorJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2MotorJointDef = new b2MotorJointDef();\n");

    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));

    log("  jd.linearOffset.Set(%.15f, %.15f);\n", joint.m_linearOffset.x, joint.m_linearOffset.y);
    log("  jd.angularOffset = %.15f;\n", joint.m_angularOffset);
    log("  jd.maxForce = %.15f;\n", joint.m_maxForce);
    log("  jd.maxTorque = %.15f;\n", joint.m_maxTorque);
    log("  jd.correctionFactor = %.15f;\n", joint.m_correctionFactor);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpPrismaticJoint(joint: b2PrismaticJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2PrismaticJointDef = new b2PrismaticJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.localAxisA.Set(%.15f, %.15f);\n", joint.m_localXAxisA.x, joint.m_localXAxisA.y);
    log("  jd.referenceAngle = %.15f;\n", joint.m_referenceAngle);
    log("  jd.enableLimit = %s;\n", (joint.m_enableLimit) ? ("true") : ("false"));
    log("  jd.lowerTranslation = %.15f;\n", joint.m_lowerTranslation);
    log("  jd.upperTranslation = %.15f;\n", joint.m_upperTranslation);
    log("  jd.enableMotor = %s;\n", (joint.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", joint.m_motorSpeed);
    log("  jd.maxMotorForce = %.15f;\n", joint.m_maxMotorForce);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpPulleyJoint(joint: b2PulleyJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2PulleyJointDef = new b2PulleyJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.groundAnchorA.Set(%.15f, %.15f);\n", joint.m_groundAnchorA.x, joint.m_groundAnchorA.y);
    log("  jd.groundAnchorB.Set(%.15f, %.15f);\n", joint.m_groundAnchorB.x, joint.m_groundAnchorB.y);
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.lengthA = %.15f;\n", joint.m_lengthA);
    log("  jd.lengthB = %.15f;\n", joint.m_lengthB);
    log("  jd.ratio = %.15f;\n", joint.m_ratio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpRevoluteJoint(joint: b2RevoluteJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2RevoluteJointDef = new b2RevoluteJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.referenceAngle = %.15f;\n", joint.m_referenceAngle);
    log("  jd.enableLimit = %s;\n", (joint.m_enableLimit) ? ("true") : ("false"));
    log("  jd.lowerAngle = %.15f;\n", joint.m_lowerAngle);
    log("  jd.upperAngle = %.15f;\n", joint.m_upperAngle);
    log("  jd.enableMotor = %s;\n", (joint.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", joint.m_motorSpeed);
    log("  jd.maxMotorTorque = %.15f;\n", joint.m_maxMotorTorque);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpRopeJoint(joint: b2RopeJoint, log: (format: string, ...args: any[]) => void): void {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2RopeJointDef = new b2RopeJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.maxLength = %.15f;\n", joint.m_maxLength);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpWeldJoint(joint: b2WeldJoint, log: (format: string, ...args: any[]) => void) {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2WeldJointDef = new b2WeldJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.referenceAngle = %.15f;\n", joint.m_referenceAngle);
    log("  jd.frequencyHz = %.15f;\n", joint.m_frequencyHz);
    log("  jd.dampingRatio = %.15f;\n", joint.m_dampingRatio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

function DumpWheelJoint(joint: b2WheelJoint, log: (format: string, ...args: any[]) => void): void {
    const indexA = joint.m_bodyA.m_islandIndex;
    const indexB = joint.m_bodyB.m_islandIndex;

    log("  const jd: b2WheelJointDef = new b2WheelJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (joint.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", joint.m_localAnchorA.x, joint.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", joint.m_localAnchorB.x, joint.m_localAnchorB.y);
    log("  jd.localAxisA.Set(%.15f, %.15f);\n", joint.m_localXAxisA.x, joint.m_localXAxisA.y);
    log("  jd.enableMotor = %s;\n", (joint.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", joint.m_motorSpeed);
    log("  jd.maxMotorTorque = %.15f;\n", joint.m_maxMotorTorque);
    log("  jd.frequencyHz = %.15f;\n", joint.m_frequencyHz);
    log("  jd.dampingRatio = %.15f;\n", joint.m_dampingRatio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

export function DumpGearJoint(joint: b2GearJoint, log: (format: string, ...args: any[]) => void): void {
    const j = joint as b2GearJoint;
    const indexA = j.m_bodyA.m_islandIndex;
    const indexB = j.m_bodyB.m_islandIndex;

    const index1 = j.m_joint1._logIndex;
    const index2 = j.m_joint2._logIndex;

    log("  const jd: b2GearJointDef = new b2GearJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (j.m_collideConnected) ? ("true") : ("false"));
    log("  jd.joint1 = joints[%d];\n", index1);
    log("  jd.joint2 = joints[%d];\n", index2);
    log("  jd.ratio = %.15f;\n", j.m_ratio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", joint._logIndex);
}

/// Dump this joint to the log file.
export function DumpJoint(joint: b2Joint, log: (format: string, ...args: any[]) => void): void {
    if (joint.m_type === b2JointType.e_gearJoint) {
        DumpGearJoint(joint as b2GearJoint, log);
    } else if (joint.m_type === b2JointType.e_distanceJoint) {
        DumpDistanceJoint(joint as b2DistanceJoint, log);
    } else if (joint.m_type === b2JointType.e_frictionJoint) {
        DumpFrictionJoint(joint as b2FrictionJoint, log);
    } else if (joint.m_type === b2JointType.e_motorJoint) {
        DumpMotorJoint(joint as b2MotorJoint, log);
    } else if (joint.m_type === b2JointType.e_prismaticJoint) {
        DumpPrismaticJoint(joint as b2PrismaticJoint, log);
    } else if (joint.m_type === b2JointType.e_pulleyJoint) {
        DumpPulleyJoint(joint as b2PulleyJoint, log);
    } else if (joint.m_type === b2JointType.e_revoluteJoint) {
        DumpRevoluteJoint(joint as b2RevoluteJoint, log);
    } else if (joint.m_type === b2JointType.e_ropeJoint) {
        DumpRopeJoint(joint as b2RopeJoint, log);
    } else if (joint.m_type === b2JointType.e_weldJoint) {
        DumpWeldJoint(joint as b2WeldJoint, log);
    } else if (joint.m_type === b2JointType.e_wheelJoint) {
        DumpWheelJoint(joint as b2WheelJoint, log);
    } else {
        log("// Dump is not supported for this joint type.\n");
    }
}