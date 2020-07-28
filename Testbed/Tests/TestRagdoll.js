/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
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
System.register(["@box2d", "../Testbed.js"], function (exports_1, context_1) {
    "use strict";
    var box2d, testbed, TestRagdoll;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (box2d_1) {
                box2d = box2d_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            }
        ],
        execute: function () {
            TestRagdoll = class TestRagdoll extends testbed.Test {
                constructor() {
                    super();
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        const vertices = [];
                        vertices[0] = new box2d.b2Vec2(-30.0, 0.0);
                        vertices[1] = new box2d.b2Vec2(30.0, 0.0);
                        vertices[2] = new box2d.b2Vec2(30.0, 40.0);
                        vertices[3] = new box2d.b2Vec2(-30.0, 40.0);
                        const shape = new box2d.b2ChainShape();
                        shape.CreateLoop(vertices);
                        ground.CreateFixture(shape, 0.0);
                    }
                    const bd = new box2d.b2BodyDef();
                    const fd = new box2d.b2FixtureDef();
                    const jd = new box2d.b2RevoluteJointDef();
                    // Add 2 ragdolls along the top
                    for (let i = 0; i < 2; ++i) {
                        const startX = -20.0 + Math.random() * 2.0 + 40.0 * i;
                        const startY = 30.0 + Math.random() * 5.0;
                        // BODIES
                        // Set these to dynamic bodies
                        bd.type = 2 /* b2_dynamicBody */;
                        // Head
                        fd.shape = new box2d.b2CircleShape(1.25);
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.3;
                        bd.position.Set(startX, startY);
                        const head = this.m_world.CreateBody(bd);
                        head.CreateFixture(fd);
                        //if (i === 0)
                        //{
                        head.ApplyLinearImpulse(new box2d.b2Vec2(Math.random() * 1000.0 - 500.0, Math.random() * 1000.0 - 500.0), head.GetWorldCenter());
                        //}
                        // Torso1
                        const shape = new box2d.b2PolygonShape();
                        fd.shape = shape;
                        shape.SetAsBox(1.5, 1.0);
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.1;
                        bd.position.Set(startX, (startY - 2.8));
                        const torso1 = this.m_world.CreateBody(bd);
                        torso1.CreateFixture(fd);
                        // Torso2
                        shape.SetAsBox(1.5, 1.0);
                        bd.position.Set(startX, (startY - 4.3));
                        const torso2 = this.m_world.CreateBody(bd);
                        torso2.CreateFixture(fd);
                        // Torso3
                        shape.SetAsBox(1.5, 1.0);
                        bd.position.Set(startX, (startY - 5.8));
                        const torso3 = this.m_world.CreateBody(bd);
                        torso3.CreateFixture(fd);
                        // UpperArm
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.1;
                        // L
                        shape.SetAsBox(1.8, 0.65);
                        bd.position.Set((startX - 3.0), (startY - 2.0));
                        const upperArmL = this.m_world.CreateBody(bd);
                        upperArmL.CreateFixture(fd);
                        // R
                        shape.SetAsBox(1.8, 0.65);
                        bd.position.Set((startX + 3.0), (startY - 2.0));
                        const upperArmR = this.m_world.CreateBody(bd);
                        upperArmR.CreateFixture(fd);
                        // LowerArm
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.1;
                        // L
                        shape.SetAsBox(1.7, 0.6);
                        bd.position.Set((startX - 5.7), (startY - 2.0));
                        const lowerArmL = this.m_world.CreateBody(bd);
                        lowerArmL.CreateFixture(fd);
                        // R
                        shape.SetAsBox(1.7, 0.6);
                        bd.position.Set((startX + 5.7), (startY - 2.0));
                        const lowerArmR = this.m_world.CreateBody(bd);
                        lowerArmR.CreateFixture(fd);
                        // UpperLeg
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.1;
                        // L
                        shape.SetAsBox(0.75, 2.2);
                        bd.position.Set((startX - 0.8), (startY - 8.5));
                        const upperLegL = this.m_world.CreateBody(bd);
                        upperLegL.CreateFixture(fd);
                        // R
                        shape.SetAsBox(0.75, 2.2);
                        bd.position.Set((startX + 0.8), (startY - 8.5));
                        const upperLegR = this.m_world.CreateBody(bd);
                        upperLegR.CreateFixture(fd);
                        // LowerLeg
                        fd.density = 1.0;
                        fd.friction = 0.4;
                        fd.restitution = 0.1;
                        // L
                        shape.SetAsBox(0.6, 2.0);
                        bd.position.Set((startX - 0.8), (startY - 12.0));
                        const lowerLegL = this.m_world.CreateBody(bd);
                        lowerLegL.CreateFixture(fd);
                        // R
                        shape.SetAsBox(0.6, 2.0);
                        bd.position.Set((startX + 0.8), (startY - 12.0));
                        const lowerLegR = this.m_world.CreateBody(bd);
                        lowerLegR.CreateFixture(fd);
                        // JOINTS
                        jd.enableLimit = true;
                        // Head to shoulders
                        jd.lowerAngle = box2d.b2DegToRad(-40.0);
                        jd.upperAngle = box2d.b2DegToRad(40.0);
                        jd.Initialize(torso1, head, new box2d.b2Vec2(startX, (startY - 1.5)));
                        this.m_world.CreateJoint(jd);
                        // Upper arm to shoulders
                        // L
                        jd.lowerAngle = box2d.b2DegToRad(-85.0);
                        jd.upperAngle = box2d.b2DegToRad(130.0);
                        jd.Initialize(torso1, upperArmL, new box2d.b2Vec2((startX - 1.8), (startY - 2.0)));
                        this.m_world.CreateJoint(jd);
                        // R
                        jd.lowerAngle = box2d.b2DegToRad(-130.0);
                        jd.upperAngle = box2d.b2DegToRad(85.0);
                        jd.Initialize(torso1, upperArmR, new box2d.b2Vec2((startX + 1.8), (startY - 2.0)));
                        this.m_world.CreateJoint(jd);
                        // Lower arm to upper arm
                        // L
                        jd.lowerAngle = box2d.b2DegToRad(-130.0);
                        jd.upperAngle = box2d.b2DegToRad(10.0);
                        jd.Initialize(upperArmL, lowerArmL, new box2d.b2Vec2((startX - 4.5), (startY - 2.0)));
                        this.m_world.CreateJoint(jd);
                        // R
                        jd.lowerAngle = box2d.b2DegToRad(-10.0);
                        jd.upperAngle = box2d.b2DegToRad(130.0);
                        jd.Initialize(upperArmR, lowerArmR, new box2d.b2Vec2((startX + 4.5), (startY - 2.0)));
                        this.m_world.CreateJoint(jd);
                        // Shoulders/stomach
                        jd.lowerAngle = box2d.b2DegToRad(-15.0);
                        jd.upperAngle = box2d.b2DegToRad(15.0);
                        jd.Initialize(torso1, torso2, new box2d.b2Vec2(startX, (startY - 3.5)));
                        this.m_world.CreateJoint(jd);
                        // Stomach/hips
                        jd.Initialize(torso2, torso3, new box2d.b2Vec2(startX, (startY - 5.0)));
                        this.m_world.CreateJoint(jd);
                        // Torso to upper leg
                        // L
                        jd.lowerAngle = box2d.b2DegToRad(-25.0);
                        jd.upperAngle = box2d.b2DegToRad(45.0);
                        jd.Initialize(torso3, upperLegL, new box2d.b2Vec2((startX - 0.8), (startY - 7.2)));
                        this.m_world.CreateJoint(jd);
                        // R
                        jd.lowerAngle = box2d.b2DegToRad(-45.0);
                        jd.upperAngle = box2d.b2DegToRad(25.0);
                        jd.Initialize(torso3, upperLegR, new box2d.b2Vec2((startX + 0.8), (startY - 7.2)));
                        this.m_world.CreateJoint(jd);
                        // Upper leg to lower leg
                        // L
                        jd.lowerAngle = box2d.b2DegToRad(-25.0);
                        jd.upperAngle = box2d.b2DegToRad(115.0);
                        jd.Initialize(upperLegL, lowerLegL, new box2d.b2Vec2((startX - 0.8), (startY - 10.5)));
                        this.m_world.CreateJoint(jd);
                        // R
                        jd.lowerAngle = box2d.b2DegToRad(-115.0);
                        jd.upperAngle = box2d.b2DegToRad(25.0);
                        jd.Initialize(upperLegR, lowerLegR, new box2d.b2Vec2((startX + 0.8), (startY - 10.5)));
                        this.m_world.CreateJoint(jd);
                    }
                    // these are static bodies so set the type accordingly
                    bd.type = 0 /* b2_staticBody */;
                    const shape = new box2d.b2PolygonShape();
                    fd.shape = shape;
                    fd.density = 0.0;
                    fd.friction = 0.4;
                    fd.restitution = 0.3;
                    // Add stairs on the left
                    for (let j = 1; j <= 10; ++j) {
                        shape.SetAsBox((1.0 * j), 1.0);
                        bd.position.Set((1.0 * j - 30.0), (21.0 - 2.0 * j));
                        this.m_world.CreateBody(bd).CreateFixture(fd);
                    }
                    // Add stairs on the right
                    for (let k = 1; k <= 10; ++k) {
                        shape.SetAsBox((1.0 * k), 1.0);
                        bd.position.Set((30.0 - 1.0 * k), (21.0 - 2.0 * k));
                        this.m_world.CreateBody(bd).CreateFixture(fd);
                    }
                    shape.SetAsBox(3.0, 4.0);
                    bd.position.Set(0.0, 4.0);
                    this.m_world.CreateBody(bd).CreateFixture(fd);
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new TestRagdoll();
                }
            };
            exports_1("TestRagdoll", TestRagdoll);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJhZ2RvbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUZXN0UmFnZG9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBS0YsY0FBQSxNQUFhLFdBQVksU0FBUSxPQUFPLENBQUMsSUFBSTtnQkFDM0M7b0JBQ0UsS0FBSyxFQUFFLENBQUM7b0JBRVI7d0JBQ0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUUzQyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBQ3BCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzNDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDM0MsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQ3ZDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzNCLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQztvQkFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFT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