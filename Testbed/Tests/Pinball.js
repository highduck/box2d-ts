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
    var box2d, testbed, Pinball;
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
            /**
             * This tests bullet collision and provides an example of a
             * gameplay scenario. This also uses a loop shape.
             */
            Pinball = class Pinball extends testbed.Test {
                constructor() {
                    super();
                    this.m_button = false;
                    // Ground body
                    /*box2d.b2Body*/
                    let ground = null;
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        /*box2d.b2Vec2*/
                        const vs = box2d.b2Vec2.MakeArray(5);
                        vs[0].Set(0.0, -2.0);
                        vs[1].Set(8.0, 6.0);
                        vs[2].Set(8.0, 20.0);
                        vs[3].Set(-8.0, 20.0);
                        vs[4].Set(-8.0, 6.0);
                        /*box2d.b2ChainShape*/
                        const loop = new box2d.b2ChainShape();
                        loop.CreateLoop(vs, 5);
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = loop;
                        fd.density = 0.0;
                        ground.CreateFixture(fd);
                    }
                    // Flippers
                    {
                        /*box2d.b2Vec2*/
                        const p1 = new box2d.b2Vec2(-2.0, 0.0), p2 = new box2d.b2Vec2(2.0, 0.0);
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.position.Copy(p1);
                        /*box2d.b2Body*/
                        const leftFlipper = this.m_world.CreateBody(bd);
                        bd.position.Copy(p2);
                        /*box2d.b2Body*/
                        const rightFlipper = this.m_world.CreateBody(bd);
                        /*box2d.b2PolygonShape*/
                        const box = new box2d.b2PolygonShape();
                        box.SetAsBox(1.75, 0.1);
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = box;
                        fd.density = 1.0;
                        leftFlipper.CreateFixture(fd);
                        rightFlipper.CreateFixture(fd);
                        /*box2d.b2RevoluteJointDef*/
                        const jd = new box2d.b2RevoluteJointDef();
                        jd.bodyA = ground;
                        jd.localAnchorB.SetZero();
                        jd.enableMotor = true;
                        jd.maxMotorTorque = 1000.0;
                        jd.enableLimit = true;
                        jd.motorSpeed = 0.0;
                        jd.localAnchorA.Copy(p1);
                        jd.bodyB = leftFlipper;
                        jd.lowerAngle = -30.0 * box2d.b2_pi / 180.0;
                        jd.upperAngle = 5.0 * box2d.b2_pi / 180.0;
                        this.m_leftJoint = this.m_world.CreateJoint(jd);
                        jd.motorSpeed = 0.0;
                        jd.localAnchorA.Copy(p2);
                        jd.bodyB = rightFlipper;
                        jd.lowerAngle = -5.0 * box2d.b2_pi / 180.0;
                        jd.upperAngle = 30.0 * box2d.b2_pi / 180.0;
                        this.m_rightJoint = this.m_world.CreateJoint(jd);
                    }
                    // Circle character
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        bd.position.Set(1.0, 15.0);
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.bullet = true;
                        this.m_ball = this.m_world.CreateBody(bd);
                        /*box2d.b2CircleShape*/
                        const shape = new box2d.b2CircleShape();
                        shape.m_radius = 0.2;
                        /*box2d.b2FixtureDef*/
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        fd.density = 1.0;
                        this.m_ball.CreateFixture(fd);
                    }
                    this.m_button = false;
                }
                Keyboard(key) {
                    switch (key) {
                        case "a":
                            this.m_button = true;
                            break;
                    }
                }
                KeyboardUp(key) {
                    switch (key) {
                        case "a":
                            this.m_button = false;
                            break;
                    }
                }
                Step(settings) {
                    if (this.m_button) {
                        this.m_leftJoint.SetMotorSpeed(20.0);
                        this.m_rightJoint.SetMotorSpeed(-20.0);
                    }
                    else {
                        this.m_leftJoint.SetMotorSpeed(-10.0);
                        this.m_rightJoint.SetMotorSpeed(10.0);
                    }
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Press 'a' to control the flippers");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new Pinball();
                }
            };
            exports_1("Pinball", Pinball);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGluYmFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBpbmJhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7Ozs7Ozs7Ozs7Ozs7OztZQUtGOzs7ZUFHRztZQUVILFVBQUEsTUFBYSxPQUFRLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBTXZDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUhILGFBQVEsR0FBWSxLQUFLLENBQUM7b0JBSy9CLGNBQWM7b0JBQ2QsZ0JBQWdCO29CQUNoQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBQ2xCO3dCQUNFLG1CQUFtQjt3QkFDbkIsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFckMsZ0JBQWdCO3dCQUNoQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVyQixzQkFBc0I7d0JBQ3RCLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDdkIsc0JBQXNCO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDcEMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7d0JBQ2hCLEVBQUUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO3dCQUNqQixNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUMxQjtvQkFFRCxXQUFXO29CQUNYO3dCQUNFLGdCQUFnQjt3QkFDaEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUNwQyxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFbEMsbUJBQW1CO3dCQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsRUFBRSxDQUFDLElBQUkseUJBQWtDLENBQUM7d0JBRTFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNyQixnQkFBZ0I7d0JBQ2hCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVoRCxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDckIsZ0JBQWdCO3dCQUNoQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFakQsd0JBQXdCO3dCQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDdkMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXhCLHNCQUFzQjt3QkFDdEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQ3BDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO3dCQUNmLEVBQUUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO3dCQUVqQixXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM5QixZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUUvQiw0QkFBNEI7d0JBQzVCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQzFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO3dCQUNsQixFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUMxQixFQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDdEIsRUFBRSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7d0JBQzNCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO3dCQUV0QixFQUFFLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQzt3QkFDcEIsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3pCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO3dCQUN2QixFQUFFLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO3dCQUM1QyxFQUFFLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFaEQsRUFBRSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7d0JBQ3BCLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN6QixFQUFFLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQzt3QkFDeEIsRUFBRSxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDM0MsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7d0JBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ2xEO29CQUVELG1CQUFtQjtvQkFDbkI7d0JBQ0UsbUJBQW1CO3dCQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUMzQixFQUFFLENBQUMsSUFBSSx5QkFBa0MsQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7d0JBRWpCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRTFDLHVCQUF1Qjt3QkFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQ3hDLEtBQUssQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO3dCQUVyQixzQkFBc0I7d0JBQ3RCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDakIsRUFBRSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUMvQjtvQkFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQztnQkFFTSxRQUFRLENBQUMsR0FBVztvQkFDekIsUUFBUSxHQUFHLEVBQUU7d0JBQ1gsS0FBSyxHQUFHOzRCQUNOLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOzRCQUNyQixNQUFNO3FCQUNUO2dCQUNILENBQUM7Z0JBRU0sVUFBVSxDQUFDLEdBQVc7b0JBQzNCLFFBQVEsR0FBRyxFQUFFO3dCQUNYLEtBQUssR0FBRzs0QkFDTixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs0QkFDdEIsTUFBTTtxQkFDVDtnQkFDSCxDQUFDO2dCQUVNLElBQUksQ0FBQyxRQUEwQjtvQkFDcEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNqQixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDeEM7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3ZDO29CQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRXJCLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLG1DQUFtQyxDQUFDLENBQUM7b0JBQ3hGLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLG9CQUFvQixDQUFDO2dCQUNsRCxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxNQUFNO29CQUNsQixPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRixDQUFBIn0=