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
    var box2d, testbed, BulletTest;
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
            BulletTest = class BulletTest extends testbed.Test {
                constructor() {
                    super();
                    this.m_x = 0;
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        bd.position.Set(0.0, 0.0);
                        /*box2d.b2Body*/
                        const body = this.m_world.CreateBody(bd);
                        /*box2d.b2EdgeShape*/
                        const edge = new box2d.b2EdgeShape();
                        edge.Set(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(10.0, 0.0));
                        body.CreateFixture(edge, 0.0);
                        /*box2d.b2PolygonShape*/
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(0.2, 1.0, new box2d.b2Vec2(0.5, 1.0), 0.0);
                        body.CreateFixture(shape, 0.0);
                    }
                    {
                        /*box2d.b2BodyDef*/
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.position.Set(0.0, 4.0);
                        /*box2d.b2PolygonShape*/
                        const box = new box2d.b2PolygonShape();
                        box.SetAsBox(2.0, 0.1);
                        this.m_body = this.m_world.CreateBody(bd);
                        this.m_body.CreateFixture(box, 1.0);
                        box.SetAsBox(0.25, 0.25);
                        //this.m_x = box2d.b2RandomRange(-1.0, 1.0);
                        this.m_x = 0.20352793;
                        bd.position.Set(this.m_x, 10.0);
                        bd.bullet = true;
                        this.m_bullet = this.m_world.CreateBody(bd);
                        this.m_bullet.CreateFixture(box, 100.0);
                        this.m_bullet.SetLinearVelocity(new box2d.b2Vec2(0.0, -50.0));
                    }
                }
                Launch() {
                    this.m_body.SetTransformVec(new box2d.b2Vec2(0.0, 4.0), 0.0);
                    this.m_body.SetLinearVelocity(box2d.b2Vec2_zero);
                    this.m_body.SetAngularVelocity(0.0);
                    this.m_x = box2d.b2RandomRange(-1.0, 1.0);
                    this.m_bullet.SetTransformVec(new box2d.b2Vec2(this.m_x, 10.0), 0.0);
                    this.m_bullet.SetLinearVelocity(new box2d.b2Vec2(0.0, -50.0));
                    this.m_bullet.SetAngularVelocity(0.0);
                    //  extern int32 box2d.b2_gjkCalls, box2d.b2_gjkIters, box2d.b2_gjkMaxIters;
                    //  extern int32 box2d.b2_toiCalls, box2d.b2_toiIters, box2d.b2_toiMaxIters;
                    //  extern int32 box2d.b2_toiRootIters, box2d.b2_toiMaxRootIters;
                    // box2d.b2_gjkCalls = 0;
                    // box2d.b2_gjkIters = 0;
                    // box2d.b2_gjkMaxIters = 0;
                    box2d.b2_gjk_reset();
                    // box2d.b2_toiCalls = 0;
                    // box2d.b2_toiIters = 0;
                    // box2d.b2_toiMaxIters = 0;
                    // box2d.b2_toiRootIters = 0;
                    // box2d.b2_toiMaxRootIters = 0;
                    box2d.b2_toi_reset();
                }
                Step(settings) {
                    super.Step(settings);
                    if (box2d.b2_gjkCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `gjk calls = ${box2d.b2_gjkCalls.toFixed(0)}, ave gjk iters = ${(box2d.b2_gjkIters / box2d.b2_gjkCalls).toFixed(1)}, max gjk iters = ${box2d.b2_gjkMaxIters.toFixed(0)}`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (box2d.b2_toiCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "toi calls = %d, ave toi iters = %3.1f, max toi iters = %d",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `toi calls = ${box2d.b2_toiCalls}, ave toi iters = ${(box2d.b2_toiIters / box2d.b2_toiCalls).toFixed(1)}, max toi iters = ${box2d.b2_toiMaxRootIters}`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "ave toi root iters = %3.1f, max toi root iters = %d",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `ave toi root iters = ${(box2d.b2_toiRootIters / box2d.b2_toiCalls).toFixed(1)}, max toi root iters = ${box2d.b2_toiMaxRootIters}`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (this.m_stepCount % 60 === 0) {
                        this.Launch();
                    }
                }
                static Create() {
                    return new BulletTest();
                }
            };
            exports_1("BulletTest", BulletTest);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVsbGV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJ1bGxldFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7Ozs7Ozs7Ozs7Ozs7OztZQUtGLGFBQUEsTUFBYSxVQUFXLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBSzFDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUhILFFBQUcsR0FBVyxDQUFDLENBQUM7b0JBS3JCO3dCQUNFLG1CQUFtQjt3QkFDbkIsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDMUIsZ0JBQWdCO3dCQUNoQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFekMscUJBQXFCO3dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFFckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNwRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFOUIsd0JBQXdCO3dCQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDekMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzFELElBQUksQ0FB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