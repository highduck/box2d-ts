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
    var box2d, testbed, RopeJoint;
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
            RopeJoint = class RopeJoint extends testbed.Test {
                constructor() {
                    super();
                    this.m_ropeDef = new box2d.b2RopeJointDef();
                    this.m_rope = null;
                    /*box2d.b2Body*/
                    let ground = null;
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        /*box2d.b2EdgeShape*/
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    {
                        /*box2d.b2PolygonShape*/
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(0.5, 0.125);
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        fd.density = 20.0;
                        fd.friction = 0.2;
                        fd.filter.categoryBits = 0x0001;
                        fd.filter.maskBits = 0xFFFF & ~0x0002;
                        /*box2d.b2RevoluteJointDef*/
                        const jd = new box2d.b2RevoluteJointDef();
                        jd.collideConnected = false;
                        /*const int32*/
                        const N = 10;
                        /*const float32*/
                        const y = 15.0;
                        this.m_ropeDef.localAnchorA.Set(0.0, y);
                        /*box2d.b2Body*/
                        let prevBody = ground;
                        for ( /*int32*/let i = 0; i < N; ++i) {
                            /*box2d.b2BodyDef*/
                            const bd = new box2d.b2BodyDef();
                            bd.type = 2 /* b2_dynamicBody */;
                            bd.position.Set(0.5 + 1.0 * i, y);
                            if (i === N - 1) {
                                shape.SetAsBox(1.5, 1.5);
                                fd.density = 100.0;
                                fd.filter.categoryBits = 0x0002;
                                bd.position.Set(1.0 * i, y);
                                bd.angularDamping = 0.4;
                            }
                            /*box2d.b2Body*/
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(fd);
                            /*box2d.b2Vec2*/
                            const anchor = new box2d.b2Vec2(i, y);
                            jd.Initialize(prevBody, body, anchor);
                            this.m_world.CreateJoint(jd);
                            prevBody = body;
                        }
                        this.m_ropeDef.localAnchorB.SetZero();
                        /*float32*/
                        const extraLength = 0.01;
                        this.m_ropeDef.maxLength = N - 1.0 + extraLength;
                        this.m_ropeDef.bodyB = prevBody;
                    }
                    {
                        this.m_ropeDef.bodyA = ground;
                        this.m_rope = this.m_world.CreateJoint(this.m_ropeDef);
                    }
                }
                Keyboard(key) {
                    switch (key) {
                        case "j":
                            if (this.m_rope) {
                                this.m_world.DestroyJoint(this.m_rope);
                                this.m_rope = null;
                            }
                            else {
                                this.m_rope = this.m_world.CreateJoint(this.m_ropeDef);
                            }
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Press (j) to toggle the rope joint.");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    if (this.m_rope) {
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, "Rope ON");
                    }
                    else {
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, "Rope OFF");
                    }
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new RopeJoint();
                }
            };
            exports_1("RopeJoint", RopeJoint);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9wZUpvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUm9wZUpvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7Ozs7Ozs7Ozs7WUFLRixZQUFBLE1BQWEsU0FBVSxTQUFRLE9BQU8sQ0FBQyxJQUFJO2dCQUl6QztvQkFDRSxLQUFLLEVBQUUsQ0FBQztvQkFKSCxjQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3ZDLFdBQU0sR0FBNkIsSUFBSSxDQUFDO29CQUs3QyxnQkFBZ0I7b0JBQ2hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDbEI7d0JBQ0UsbUJBQW1CO3dCQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVyQyxxQkFBcUI7d0JBQ3JCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3JFLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUNsQztvQkFFRDt3QkFDRSx3QkFBd0I7d0JBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN6QyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFFM0Isc0JBQXNCO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxZ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