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
    var box2d, testbed, Revolute;
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
            Revolute = class Revolute extends testbed.Test {
                constructor() {
                    super();
                    let ground = null;
                    {
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        //fd.filter.categoryBits = 2;
                        ground.CreateFixture(fd);
                    }
                    {
                        const shape = new box2d.b2CircleShape();
                        shape.m_radius = 0.5;
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        const rjd = new box2d.b2RevoluteJointDef();
                        bd.position.Set(-10.0, 20.0);
                        const body = this.m_world.CreateBody(bd);
                        body.CreateFixture(shape, 5.0);
                        const w = 100.0;
                        body.SetAngularVelocity(w);
                        body.SetLinearVelocity(new box2d.b2Vec2(-8.0 * w, 0.0));
                        rjd.Initialize(ground, body, new box2d.b2Vec2(-10.0, 12.0));
                        rjd.motorSpeed = 1.0 * box2d.b2_pi;
                        rjd.maxMotorTorque = 10000.0;
                        rjd.enableMotor = false;
                        rjd.lowerAngle = -0.25 * box2d.b2_pi;
                        rjd.upperAngle = 0.5 * box2d.b2_pi;
                        rjd.enableLimit = true;
                        rjd.collideConnected = true;
                        this.m_joint = this.m_world.CreateJoint(rjd);
                    }
                    {
                        /*box2d.b2CircleShape*/
                        const circle_shape = new box2d.b2CircleShape();
                        circle_shape.m_radius = 3.0;
                        const circle_bd = new box2d.b2BodyDef();
                        circle_bd.type = 2 /* b2_dynamicBody */;
                        circle_bd.position.Set(5.0, 30.0);
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.density = 5.0;
                        fd.filter.maskBits = 1;
                        fd.shape = circle_shape;
                        this.m_ball = this.m_world.CreateBody(circle_bd);
                        this.m_ball.CreateFixture(fd);
                        /*box2d.b2PolygonShape*/
                        const polygon_shape = new box2d.b2PolygonShape();
                        polygon_shape.SetAsBox(10.0, 0.2, new box2d.b2Vec2(-10.0, 0.0), 0.0);
                        const polygon_bd = new box2d.b2BodyDef();
                        polygon_bd.position.Set(20.0, 10.0);
                        polygon_bd.type = 2 /* b2_dynamicBody */;
                        polygon_bd.bullet = true;
                        /*box2d.b2Body*/
                        const polygon_body = this.m_world.CreateBody(polygon_bd);
                        polygon_body.CreateFixture(polygon_shape, 2.0);
                        const rjd = new box2d.b2RevoluteJointDef();
                        rjd.Initialize(ground, polygon_body, new box2d.b2Vec2(20.0, 10.0));
                        rjd.lowerAngle = -0.25 * box2d.b2_pi;
                        rjd.upperAngle = 0.0 * box2d.b2_pi;
                        rjd.enableLimit = true;
                        this.m_world.CreateJoint(rjd);
                    }
                    // Tests mass computation of a small object far from the origin
                    {
                        const bodyDef = new box2d.b2BodyDef();
                        bodyDef.type = 2 /* b2_dynamicBody */;
                        /*box2d.b2Body*/
                        const body = this.m_world.CreateBody(bodyDef);
                        /*box2d.b2PolygonShape*/
                        const polyShape = new box2d.b2PolygonShape();
                        /*box2d.b2Vec2*/
                        const verts = box2d.b2Vec2.MakeArray(3);
                        verts[0].Set(17.63, 36.31);
                        verts[1].Set(17.52, 36.69);
                        verts[2].Set(17.19, 36.36);
                        polyShape.Set(verts, 3);
                        /*box2d.b2FixtureDef*/
                        const polyFixtureDef = new box2d.b2FixtureDef();
                        polyFixtureDef.shape = polyShape;
                        polyFixtureDef.density = 1;
                        body.CreateFixture(polyFixtureDef); //assertion hits inside here
                    }
                }
                Keyboard(key) {
                    switch (key) {
                        case "l":
                            this.m_joint.EnableLimit(!this.m_joint.IsLimitEnabled());
                            break;
                        case "m":
                            this.m_joint.EnableMotor(!this.m_joint.IsMotorEnabled());
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: (l) limits, (m) motor");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    // if (this.m_stepCount === 360) {
                    //   this.m_ball.SetTransformVec(new box2d.b2Vec2(0.0, 0.5), 0.0);
                    // }
                    // const torque1 = this.m_joint.GetMotorTorque(settings.hz);
                    // testbed.g_debugDraw.DrawString(5, this.m_textLine, `Motor Torque = ${torque1.toFixed(0)}, ${torque2.toFixed(0)} : Motor Force = ${force3.toFixed(0)}`);
                    // this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new Revolute();
                }
            };
            exports_1("Revolute", Revolute);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV2b2x1dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZXZvbHV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBS0YsV0FBQSxNQUFhLFFBQVMsU0FBUSxPQUFPLENBQUMsSUFBSTtnQkFJeEM7b0JBQ0UsS0FBSyxFQUFFLENBQUM7b0JBRVIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUVsQjt3QkFDRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVyQyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUVyRSxzQkFBc0I7d0JBQ3RCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDakIsNkJBQTZCO3dCQUU3QixNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUMxQjtvQkFFRDt3QkFDRSxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFDeEMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7d0JBRXJCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxFQUFFLENBQUMsSUFBSSx5QkFBa0MsQ0FBQzt3QkFFMUMs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