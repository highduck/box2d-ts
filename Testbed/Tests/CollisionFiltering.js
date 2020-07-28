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
    var box2d, testbed, CollisionFiltering;
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
            CollisionFiltering = class CollisionFiltering extends testbed.Test {
                constructor() {
                    super();
                    // Ground body
                    {
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
                        const sd = new box2d.b2FixtureDef();
                        sd.shape = shape;
                        sd.friction = 0.3;
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        ground.CreateFixture(sd);
                    }
                    // Small triangle
                    const vertices = new Array();
                    vertices[0] = new box2d.b2Vec2(-1.0, 0.0);
                    vertices[1] = new box2d.b2Vec2(1.0, 0.0);
                    vertices[2] = new box2d.b2Vec2(0.0, 2.0);
                    const polygon = new box2d.b2PolygonShape();
                    polygon.Set(vertices, 3);
                    const triangleShapeDef = new box2d.b2FixtureDef();
                    triangleShapeDef.shape = polygon;
                    triangleShapeDef.density = 1.0;
                    triangleShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
                    triangleShapeDef.filter.categoryBits = CollisionFiltering.k_triangleCategory;
                    triangleShapeDef.filter.maskBits = CollisionFiltering.k_triangleMask;
                    const triangleBodyDef = new box2d.b2BodyDef();
                    triangleBodyDef.type = 2 /* b2_dynamicBody */;
                    triangleBodyDef.position.Set(-5.0, 2.0);
                    const body1 = this.m_world.CreateBody(triangleBodyDef);
                    body1.CreateFixture(triangleShapeDef);
                    // Large triangle (recycle definitions)
                    vertices[0].SelfMul(2.0);
                    vertices[1].SelfMul(2.0);
                    vertices[2].SelfMul(2.0);
                    polygon.Set(vertices, 3);
                    triangleShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
                    triangleBodyDef.position.Set(-5.0, 6.0);
                    triangleBodyDef.fixedRotation = true; // look at me!
                    const body2 = this.m_world.CreateBody(triangleBodyDef);
                    body2.CreateFixture(triangleShapeDef);
                    {
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.position.Set(-5.0, 10.0);
                        const body = this.m_world.CreateBody(bd);
                        const p = new box2d.b2PolygonShape();
                        p.SetAsBox(0.5, 1.0);
                        body.CreateFixture(p, 1.0);
                        const jd = new box2d.b2PrismaticJointDef();
                        jd.bodyA = body2;
                        jd.bodyB = body;
                        jd.enableLimit = true;
                        jd.localAnchorA.Set(0.0, 4.0);
                        jd.localAnchorB.SetZero();
                        jd.localAxisA.Set(0.0, 1.0);
                        jd.lowerTranslation = -1.0;
                        jd.upperTranslation = 1.0;
                        this.m_world.CreateJoint(jd);
                    }
                    // Small box
                    polygon.SetAsBox(1.0, 0.5);
                    const boxShapeDef = new box2d.b2FixtureDef();
                    boxShapeDef.shape = polygon;
                    boxShapeDef.density = 1.0;
                    boxShapeDef.restitution = 0.1;
                    boxShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
                    boxShapeDef.filter.categoryBits = CollisionFiltering.k_boxCategory;
                    boxShapeDef.filter.maskBits = CollisionFiltering.k_boxMask;
                    const boxBodyDef = new box2d.b2BodyDef();
                    boxBodyDef.type = 2 /* b2_dynamicBody */;
                    boxBodyDef.position.Set(0.0, 2.0);
                    const body3 = this.m_world.CreateBody(boxBodyDef);
                    body3.CreateFixture(boxShapeDef);
                    // Large box (recycle definitions)
                    polygon.SetAsBox(2.0, 1.0);
                    boxShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
                    boxBodyDef.position.Set(0.0, 6.0);
                    const body4 = this.m_world.CreateBody(boxBodyDef);
                    body4.CreateFixture(boxShapeDef);
                    // Small circle
                    const circle = new box2d.b2CircleShape();
                    circle.m_radius = 1.0;
                    const circleShapeDef = new box2d.b2FixtureDef();
                    circleShapeDef.shape = circle;
                    circleShapeDef.density = 1.0;
                    circleShapeDef.filter.groupIndex = CollisionFiltering.k_smallGroup;
                    circleShapeDef.filter.categoryBits = CollisionFiltering.k_circleCategory;
                    circleShapeDef.filter.maskBits = CollisionFiltering.k_circleMask;
                    const circleBodyDef = new box2d.b2BodyDef();
                    circleBodyDef.type = 2 /* b2_dynamicBody */;
                    circleBodyDef.position.Set(5.0, 2.0);
                    const body5 = this.m_world.CreateBody(circleBodyDef);
                    body5.CreateFixture(circleShapeDef);
                    // Large circle
                    circle.m_radius *= 2.0;
                    circleShapeDef.filter.groupIndex = CollisionFiltering.k_largeGroup;
                    circleBodyDef.position.Set(5.0, 6.0);
                    const body6 = this.m_world.CreateBody(circleBodyDef);
                    body6.CreateFixture(circleShapeDef);
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new CollisionFiltering();
                }
            };
            exports_1("CollisionFiltering", CollisionFiltering);
            CollisionFiltering.k_smallGroup = 1;
            CollisionFiltering.k_largeGroup = -1;
            CollisionFiltering.k_defaultCategory = 0x0001;
            CollisionFiltering.k_triangleCategory = 0x0002;
            CollisionFiltering.k_boxCategory = 0x0004;
            CollisionFiltering.k_circleCategory = 0x0008;
            CollisionFiltering.k_triangleMask = 0xFFFF;
            CollisionFiltering.k_boxMask = 0xFFFF ^ CollisionFiltering.k_triangleCategory;
            CollisionFiltering.k_circleMask = 0xFFFF;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sbGlzaW9uRmlsdGVyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29sbGlzaW9uRmlsdGVyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7Ozs7Ozs7Ozs7WUFLRixxQkFBQSxNQUFhLGtCQUFtQixTQUFRLE9BQU8sQ0FBQyxJQUFJO2dCQVdsRDtvQkFDRSxLQUFLLEVBQUUsQ0FBQztvQkFFUixjQUFjO29CQUNkO3dCQUNFLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBRXJFLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDakIsRUFBRSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7d0JBRWxCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDM0MsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDMUI7b0JBRUQsaUJBQWlCO29CQUNqQixNQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUM3QixRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdB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