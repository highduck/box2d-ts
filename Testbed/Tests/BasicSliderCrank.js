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
System.register(["@box2d", "../Testbed.js"], function (exports_1, context_1) {
    "use strict";
    var box2d, testbed, BasicSliderCrank;
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
            BasicSliderCrank = class BasicSliderCrank extends testbed.Test {
                constructor() {
                    super();
                    /*box2d.b2Body*/
                    let ground = null;
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        bd.position.Set(0.0, 17.0);
                        ground = this.m_world.CreateBody(bd);
                    }
                    {
                        /*box2d.b2Body*/
                        let prevBody = ground;
                        // Define crank.
                        {
                            /*box2d.b2PolygonShape*/
                            const shape = new box2d.b2PolygonShape();
                            shape.SetAsBox(4.0, 1.0);
                            /*box2d.b2BodyDef*/
                            const bd = new box2d.b2BodyDef();
                            bd.type = 2 /* b2_dynamicBody */;
                            bd.position.Set(-8.0, 20.0);
                            /*box2d.b2Body*/
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(shape, 2.0);
                            /*box2d.b2RevoluteJointDef*/
                            const rjd = new box2d.b2RevoluteJointDef();
                            rjd.Initialize(prevBody, body, new box2d.b2Vec2(-12.0, 20.0));
                            this.m_world.CreateJoint(rjd);
                            prevBody = body;
                        }
                        // Define connecting rod
                        {
                            /*box2d.b2PolygonShape*/
                            const shape = new box2d.b2PolygonShape();
                            shape.SetAsBox(8.0, 1.0);
                            /*box2d.b2BodyDef*/
                            const bd = new box2d.b2BodyDef();
                            bd.type = 2 /* b2_dynamicBody */;
                            bd.position.Set(4.0, 20.0);
                            /*box2d.b2Body*/
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(shape, 2.0);
                            /*box2d.b2RevoluteJointDef*/
                            const rjd = new box2d.b2RevoluteJointDef();
                            rjd.Initialize(prevBody, body, new box2d.b2Vec2(-4.0, 20.0));
                            this.m_world.CreateJoint(rjd);
                            prevBody = body;
                        }
                        // Define piston
                        {
                            /*box2d.b2PolygonShape*/
                            const shape = new box2d.b2PolygonShape();
                            shape.SetAsBox(3.0, 3.0);
                            /*box2d.b2BodyDef*/
                            const bd = new box2d.b2BodyDef();
                            bd.type = 2 /* b2_dynamicBody */;
                            bd.fixedRotation = true;
                            bd.position.Set(12.0, 20.0);
                            /*box2d.b2Body*/
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(shape, 2.0);
                            /*box2d.b2RevoluteJointDef*/
                            const rjd = new box2d.b2RevoluteJointDef();
                            rjd.Initialize(prevBody, body, new box2d.b2Vec2(12.0, 20.0));
                            this.m_world.CreateJoint(rjd);
                            /*box2d.b2PrismaticJointDef*/
                            const pjd = new box2d.b2PrismaticJointDef();
                            pjd.Initialize(ground, body, new box2d.b2Vec2(12.0, 17.0), new box2d.b2Vec2(1.0, 0.0));
                            this.m_world.CreateJoint(pjd);
                        }
                    }
                }
                static Create() {
                    return new BasicSliderCrank();
                }
            };
            exports_1("BasicSliderCrank", BasicSliderCrank);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzaWNTbGlkZXJDcmFuay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJhc2ljU2xpZGVyQ3JhbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7Ozs7Ozs7Ozs7Ozs7OztZQUtILG1CQUFBLE1BQWEsZ0JBQWlCLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBQ2hEO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUVSLGdCQUFnQjtvQkFDaEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNsQjt3QkFDRSxtQkFBbUI7d0JBQ25CLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzNCLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDdEM7b0JBRUQ7d0JBQ0UsZ0JBQWdCO3dCQUNoQixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUM7d0JBRXRCLGdCQUFnQjt3QkFDaEI7NEJBQ0Usd0JBQXdCOzRCQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDekMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBRXpCLG1CQUFtQjs0QkFDbkIsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7NEJBQ2pDLEVBQUUsQ0FBQyxJQUFJLHlCQUFrQyxDQUFDOzRCQUMxQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDNUIsZ0JBQWdCOzRCQUNoQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBRS9CLDRCQUE0Qjs0QkFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs0QkFDM0MsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFFOUIsUUFBUSxHQUFHLElBQUksQ0FBQzt5QkFDakI7d0JBRUQsd0JBQXdCO3dCQUN4Qjs0QkFDRSx3QkFBd0I7NEJBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDOzRCQUN6QyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFFekIsbUJBQW1COzRCQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzs0QkFDakMsRUFBRSxDQUFDLElBQUkseUJBQWtDLENBQUM7NEJBQzFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDM0IsZ0JBQWdCOzRCQUNoQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBRS9CLDRCQUE0Qjs0QkFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs0QkFDM0MsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFFOUIsUUFBUSxHQUFHLElBQUksQ0FBQzt5QkFDakI7d0JBRUQsZ0JBQWdCO3dCQUNoQjs0QkFDRSx3QkFBd0I7NEJBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDOzRCQUN6QyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFFekIsbUJBQW1COzRCQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzs0QkFDakMsRUFBRSxDQUFDLElBQUkseUJBQWtDLENBQUM7NEJBQzFDLEVBQUUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDOzRCQUN4QixFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQzVCLGdCQUFnQjs0QkFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUUvQiw0QkFBNEI7NEJBQzVCLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7NEJBQzNDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUU5Qiw2QkFBNkI7NEJBQzdCLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUM7NEJBQzVDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDdkYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQy9CO3FCQUNGO2dCQUNILENBQUM7Z0JBRU0sTUFBTSxDQUFDLE1BQU07b0JBQ2xCLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNoQyxDQUFDO2FBQ0YsQ0FBQSJ9