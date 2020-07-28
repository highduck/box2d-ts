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
    var box2d, testbed, Gears;
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
            Gears = class Gears extends testbed.Test {
                constructor() {
                    super();
                    let ground = null;
                    {
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-50.0, 0.0), new box2d.b2Vec2(50.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    {
                        const circle1 = new box2d.b2CircleShape();
                        circle1.m_radius = 1.0;
                        const box = new box2d.b2PolygonShape();
                        box.SetAsBox(0.5, 5.0);
                        const circle2 = new box2d.b2CircleShape();
                        circle2.m_radius = 2.0;
                        const bd1 = new box2d.b2BodyDef();
                        bd1.type = 0 /* b2_staticBody */;
                        bd1.position.Set(10.0, 9.0);
                        const body1 = this.m_world.CreateBody(bd1);
                        body1.CreateFixture(circle1, 5.0);
                        const bd2 = new box2d.b2BodyDef();
                        bd2.type = 2 /* b2_dynamicBody */;
                        bd2.position.Set(10.0, 8.0);
                        const body2 = this.m_world.CreateBody(bd2);
                        body2.CreateFixture(box, 5.0);
                        const bd3 = new box2d.b2BodyDef();
                        bd3.type = 2 /* b2_dynamicBody */;
                        bd3.position.Set(10.0, 6.0);
                        const body3 = this.m_world.CreateBody(bd3);
                        body3.CreateFixture(circle2, 5.0);
                        const jd1 = new box2d.b2RevoluteJointDef();
                        jd1.Initialize(body2, body1, bd1.position);
                        const joint1 = this.m_world.CreateJoint(jd1);
                        const jd2 = new box2d.b2RevoluteJointDef();
                        jd2.Initialize(body2, body3, bd3.position);
                        const joint2 = this.m_world.CreateJoint(jd2);
                        const jd4 = new box2d.b2GearJointDef();
                        jd4.bodyA = body1;
                        jd4.bodyB = body3;
                        jd4.joint1 = joint1;
                        jd4.joint2 = joint2;
                        jd4.ratio = circle2.m_radius / circle1.m_radius;
                        this.m_world.CreateJoint(jd4);
                    }
                    {
                        const circle1 = new box2d.b2CircleShape();
                        circle1.m_radius = 1.0;
                        const circle2 = new box2d.b2CircleShape();
                        circle2.m_radius = 2.0;
                        const box = new box2d.b2PolygonShape();
                        box.SetAsBox(0.5, 5.0);
                        const bd1 = new box2d.b2BodyDef();
                        bd1.type = 2 /* b2_dynamicBody */;
                        bd1.position.Set(-3.0, 12.0);
                        const body1 = this.m_world.CreateBody(bd1);
                        body1.CreateFixture(circle1, 5.0);
                        const jd1 = new box2d.b2RevoluteJointDef();
                        jd1.bodyA = ground;
                        jd1.bodyB = body1;
                        ground.GetLocalPoint(bd1.position, jd1.localAnchorA);
                        body1.GetLocalPoint(bd1.position, jd1.localAnchorB);
                        jd1.referenceAngle = body1.GetAngle() - ground.GetAngle();
                        this.m_joint1 = this.m_world.CreateJoint(jd1);
                        const bd2 = new box2d.b2BodyDef();
                        bd2.type = 2 /* b2_dynamicBody */;
                        bd2.position.Set(0.0, 12.0);
                        const body2 = this.m_world.CreateBody(bd2);
                        body2.CreateFixture(circle2, 5.0);
                        const jd2 = new box2d.b2RevoluteJointDef();
                        jd2.Initialize(ground, body2, bd2.position);
                        this.m_joint2 = this.m_world.CreateJoint(jd2);
                        const bd3 = new box2d.b2BodyDef();
                        bd3.type = 2 /* b2_dynamicBody */;
                        bd3.position.Set(2.5, 12.0);
                        const body3 = this.m_world.CreateBody(bd3);
                        body3.CreateFixture(box, 5.0);
                        const jd3 = new box2d.b2PrismaticJointDef();
                        jd3.Initialize(ground, body3, bd3.position, new box2d.b2Vec2(0.0, 1.0));
                        jd3.lowerTranslation = -5.0;
                        jd3.upperTranslation = 5.0;
                        jd3.enableLimit = true;
                        this.m_joint3 = this.m_world.CreateJoint(jd3);
                        const jd4 = new box2d.b2GearJointDef();
                        jd4.bodyA = body1;
                        jd4.bodyB = body2;
                        jd4.joint1 = this.m_joint1;
                        jd4.joint2 = this.m_joint2;
                        jd4.ratio = circle2.m_radius / circle1.m_radius;
                        this.m_joint4 = this.m_world.CreateJoint(jd4);
                        const jd5 = new box2d.b2GearJointDef();
                        jd5.bodyA = body2;
                        jd5.bodyB = body3;
                        jd5.joint1 = this.m_joint2;
                        jd5.joint2 = this.m_joint3;
                        jd5.ratio = -1.0 / circle2.m_radius;
                        this.m_joint5 = this.m_world.CreateJoint(jd5);
                    }
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new Gears();
                }
            };
            exports_1("Gears", Gears);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHZWFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBS0YsUUFBQSxNQUFhLEtBQU0sU0FBUSxPQUFPLENBQUMsSUFBSTtnQkFPckM7b0JBQ0UsS0FBSyxFQUFFLENBQUM7b0JBRVIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNsQjt3QkFDRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVyQyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNyRSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDbEM7b0JBRUQ7d0JBQ0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO3dCQUV2QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDdkMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXZCLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO3dCQUMxQyxPQUFPLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQzt3QkFFdkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLHdCQUFpQyxDQUFDO3dCQUMxQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUMzQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLHlCQUFrQyxDQUFDO3dCQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUMzQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLHlCQUFrQyxDQUFDO3dCQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUMzQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDM0MsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDM0MsTUFBTSxNQUFNLEdBQTBCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUVwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO3dCQUMzQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMzQyxNQUFNLE1BQU0sR0FBMEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRXBFLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN2QyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDbEIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7d0JBQ2xCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO3dCQUNwQixHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzt3QkFDcEIsR0FBRyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7d0JBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUMvQjtvQkFFRDt3QkFDRSxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFDMUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7d0JBRXZCLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO3dCQUMxQyxPQUFPLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQzt3QkFFdkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3ZDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUV2QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDbEMsR0FBRyxDQUFDLElBQUkseUJBQWtDLENBQUM7d0JBQzNDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDM0MsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRWxDLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQzNDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO3dCQUNuQixHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDbEIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDckQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDcEQsR0FBRyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUMxRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUU5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDbEMsR0FBRyxDQUFDLElBQUkseUJBQWtDLENBQUM7d0JBQzNDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzNDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO3dCQUMzQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUU5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDbEMsR0FBRyxDQUFDLElBQUkseUJBQWtDLENBQUM7d0JBQzNDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzNDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUU5QixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO3dCQUM1QyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3hFLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsQ0FBQzt3QkFDNUIsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQzt3QkFDM0IsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBRXZCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRTlDLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN2QyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDbEIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7d0JBQ2xCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDM0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUMzQixHQUFHLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzt3QkFDaEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFFOUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3ZDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO3dCQUNsQixHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDbEIsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO3dCQUMzQixHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQzNCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzt3QkFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDL0M7Z0JBQ0gsQ0FBQztnQkFFTSxJQUFJLENBQUMsUUFBMEI7b0JBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRU0sTUFBTSxDQUFDLE1BQU07b0JBQ2xCLE9BQU8sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDckIsQ0FBQzthQUNGLENBQUEifQ==