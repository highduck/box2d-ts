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
    var box2d, testbed, ContinuousTest;
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
            ContinuousTest = class ContinuousTest extends testbed.Test {
                constructor() {
                    super();
                    this.m_angularVelocity = 0.0;
                    {
                        const bd = new box2d.b2BodyDef();
                        bd.position.Set(0.0, 0.0);
                        const body = this.m_world.CreateBody(bd);
                        const edge = new box2d.b2EdgeShape();
                        edge.Set(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(10.0, 0.0));
                        body.CreateFixture(edge, 0.0);
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(0.2, 1.0, new box2d.b2Vec2(0.5, 1.0), 0.0);
                        body.CreateFixture(shape, 0.0);
                    }
                    {
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.position.Set(0.0, 20.0);
                        //bd.angle = 0.1;
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(2.0, 0.1);
                        this.m_body = this.m_world.CreateBody(bd);
                        this.m_body.CreateFixture(shape, 1.0);
                        this.m_angularVelocity = box2d.b2RandomRange(-50.0, 50.0);
                        //this.m_angularVelocity = 46.661274;
                        this.m_body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
                        this.m_body.SetAngularVelocity(this.m_angularVelocity);
                    }
                    /*
                    else
                    {
                      const bd = new box2d.b2BodyDef();
                      bd.type = box2d.b2BodyType.b2_dynamicBody;
                      bd.position.Set(0.0, 2.0);
                      const body = this.m_world.CreateBody(bd);
                      const shape = new box2d.b2CircleShape();
                      shape.m_p.SetZero();
                      shape.m_radius = 0.5;
                      body.CreateFixture(shape, 1.0);
                      bd.bullet = true;
                      bd.position.Set(0.0, 10.0);
                      body = this.m_world.CreateBody(bd);
                      body.CreateFixture(shape, 1.0);
                      body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
                    }
                    */
                    // box2d.b2_gjkCalls = 0;
                    // box2d.b2_gjkIters = 0;
                    // box2d.b2_gjkMaxIters = 0;
                    box2d.b2_gjk_reset();
                    // box2d.b2_toiCalls = 0;
                    // box2d.b2_toiIters = 0;
                    // box2d.b2_toiRootIters = 0;
                    // box2d.b2_toiMaxRootIters = 0;
                    // box2d.b2_toiTime = 0.0;
                    // box2d.b2_toiMaxTime = 0.0;
                    box2d.b2_toi_reset();
                }
                Launch() {
                    // box2d.b2_gjkCalls = 0;
                    // box2d.b2_gjkIters = 0;
                    // box2d.b2_gjkMaxIters = 0;
                    box2d.b2_gjk_reset();
                    // box2d.b2_toiCalls = 0;
                    // box2d.b2_toiIters = 0;
                    // box2d.b2_toiRootIters = 0;
                    // box2d.b2_toiMaxRootIters = 0;
                    // box2d.b2_toiTime = 0.0;
                    // box2d.b2_toiMaxTime = 0.0;
                    box2d.b2_toi_reset();
                    this.m_body.SetTransformVec(new box2d.b2Vec2(0.0, 20.0), 0.0);
                    this.m_angularVelocity = box2d.b2RandomRange(-50.0, 50.0);
                    this.m_body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
                    this.m_body.SetAngularVelocity(this.m_angularVelocity);
                }
                Step(settings) {
                    super.Step(settings);
                    if (box2d.b2_gjkCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `gjk calls = ${box2d.b2_gjkCalls.toFixed(0)}, ave gjk iters = ${(box2d.b2_gjkIters / box2d.b2_gjkCalls).toFixed(1)}, max gjk iters = ${box2d.b2_gjkMaxIters.toFixed(0)}`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (box2d.b2_toiCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "toi [max] calls = %d, ave toi iters = %3.1f [%d]",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `toi [max] calls = ${box2d.b2_toiCalls}, ave toi iters = ${(box2d.b2_toiIters / box2d.b2_toiCalls).toFixed(1)} [${box2d.b2_toiMaxRootIters}]`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi root iters = %3.1f [%d]",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi root iters = ${(box2d.b2_toiRootIters / box2d.b2_toiCalls).toFixed(1)} [${box2d.b2_toiMaxRootIters.toFixed(0)}]`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi time = %.1f [%.1f] (microseconds)",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi time = ${(1000.0 * box2d.b2_toiTime / box2d.b2_toiCalls).toFixed(1)} [${(1000.0 * box2d.b2_toiMaxTime).toFixed(1)}] (microseconds)`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (this.m_stepCount % 60 === 0) {
                        this.Launch();
                    }
                }
                static Create() {
                    return new ContinuousTest();
                }
            };
            exports_1("ContinuousTest", ContinuousTest);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGludW91c1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb250aW51b3VzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBS0YsaUJBQUEsTUFBYSxjQUFlLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBSTlDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUhILHNCQUFpQixHQUFHLEdBQUcsQ0FBQztvQkFLN0I7d0JBQ0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDMUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRXpDLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUVyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3BFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUU5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDekMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzFELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUNoQztv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