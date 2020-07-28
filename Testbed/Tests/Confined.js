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
    var box2d, testbed, Confined;
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
            Confined = class Confined extends testbed.Test {
                constructor() {
                    super();
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2EdgeShape();
                        // Floor
                        shape.Set(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(10.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                        // Left wall
                        shape.Set(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(-10.0, 20.0));
                        ground.CreateFixture(shape, 0.0);
                        // Right wall
                        shape.Set(new box2d.b2Vec2(10.0, 0.0), new box2d.b2Vec2(10.0, 20.0));
                        ground.CreateFixture(shape, 0.0);
                        // Roof
                        shape.Set(new box2d.b2Vec2(-10.0, 20.0), new box2d.b2Vec2(10.0, 20.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    const radius = 0.5;
                    const shape = new box2d.b2CircleShape();
                    shape.m_p.SetZero();
                    shape.m_radius = radius;
                    const fd = new box2d.b2FixtureDef();
                    fd.shape = shape;
                    fd.density = 1.0;
                    fd.friction = 0.1;
                    for (let j = 0; j < Confined.e_columnCount; ++j) {
                        for (let i = 0; i < Confined.e_rowCount; ++i) {
                            const bd = new box2d.b2BodyDef();
                            bd.type = 2 /* b2_dynamicBody */;
                            bd.position.Set(-10.0 + (2.1 * j + 1.0 + 0.01 * i) * radius, (2.0 * i + 1.0) * radius);
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(fd);
                        }
                    }
                    this.m_world.SetGravity(new box2d.b2Vec2(0.0, 0.0));
                }
                CreateCircle() {
                    const radius = 2.0;
                    const shape = new box2d.b2CircleShape();
                    shape.m_p.SetZero();
                    shape.m_radius = radius;
                    const fd = new box2d.b2FixtureDef();
                    fd.shape = shape;
                    fd.density = 1.0;
                    fd.friction = 0.0;
                    const p = new box2d.b2Vec2(box2d.b2Random(), 3.0 + box2d.b2Random());
                    const bd = new box2d.b2BodyDef();
                    bd.type = 2 /* b2_dynamicBody */;
                    bd.position.Copy(p);
                    //bd.allowSleep = false;
                    const body = this.m_world.CreateBody(bd);
                    body.CreateFixture(fd);
                }
                Keyboard(key) {
                    switch (key) {
                        case "c":
                            this.CreateCircle();
                            break;
                    }
                }
                Step(settings) {
                    let sleeping = true;
                    for (let b = this.m_world.GetBodyList(); b; b = b.m_next) {
                        if (b.GetType() !== 2 /* b2_dynamicBody */) {
                            continue;
                        }
                        if (b.IsAwake()) {
                            sleeping = false;
                        }
                    }
                    if (this.m_stepCount === 180) {
                        this.m_stepCount += 0;
                    }
                    if (sleeping) {
                        // this.CreateCircle();
                    }
                    super.Step(settings);
                    for (let b = this.m_world.GetBodyList(); b; b = b.m_next) {
                        if (b.GetType() !== 2 /* b2_dynamicBody */) {
                            continue;
                        }
                        // const p = b.GetPosition();
                        // if (p.x <= -10.0 || 10.0 <= p.x || p.y <= 0.0 || 20.0 <= p.y) {
                        //   p.x += 0.0;
                        // }
                    }
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Press 'c' to create a circle.");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new Confined();
                }
            };
            exports_1("Confined", Confined);
            Confined.e_columnCount = 0;
            Confined.e_rowCount = 0;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmluZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb25maW5lZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBS0YsV0FBQSxNQUFhLFFBQVMsU0FBUSxPQUFPLENBQUMsSUFBSTtnQkFJeEM7b0JBQ0UsS0FBSyxFQUFFLENBQUM7b0JBRVI7d0JBQ0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUUzQyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFFdEMsUUFBUTt3QkFDUixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3JFLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVqQyxZQUFZO3dCQUNaLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUN2RSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFakMsYUFBYTt3QkFDYixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFD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