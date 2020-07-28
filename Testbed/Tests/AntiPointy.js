/*
 * Copyright (c) 2014 Google, Inc.
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
    var box2d, testbed, AntiPointy;
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
             * Test the behavior of particles falling onto a concave
             * ambiguous Body contact fixture junction.
             */
            AntiPointy = class AntiPointy extends testbed.Test {
                constructor() {
                    super();
                    this.m_particlesToCreate = 300;
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        // Construct a valley out of many polygons to ensure there's no
                        // issue with particles falling directly on an ambiguous set of
                        // fixture corners.
                        const step = 1.0;
                        for (let i = -10.0; i < 10.0; i += step) {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(i, -10.0),
                                new box2d.b2Vec2(i + step, -10.0),
                                new box2d.b2Vec2(0.0, 15.0),
                            ];
                            shape.Set(vertices, 3);
                            ground.CreateFixture(shape, 0.0);
                        }
                        for (let i = -10.0; i < 35.0; i += step) {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-10.0, i),
                                new box2d.b2Vec2(-10.0, i + step),
                                new box2d.b2Vec2(0.0, 15.0),
                            ];
                            shape.Set(vertices, 3);
                            ground.CreateFixture(shape, 0.0);
                            const vertices2 = [
                                new box2d.b2Vec2(10.0, i),
                                new box2d.b2Vec2(10.0, i + step),
                                new box2d.b2Vec2(0.0, 15.0),
                            ];
                            shape.Set(vertices2, 3);
                            ground.CreateFixture(shape, 0.0);
                        }
                    }
                    // Cap the number of generated particles or we'll fill forever
                    this.m_particlesToCreate = 300;
                    this.m_particleSystem.SetRadius(0.25 * 2); // HACK: increase particle radius
                    const particleType = testbed.Test.GetParticleParameterValue();
                    if (particleType === 0 /* b2_waterParticle */) {
                        this.m_particleSystem.SetDamping(0.2);
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    if (this.m_particlesToCreate <= 0) {
                        return;
                    }
                    --this.m_particlesToCreate;
                    const flags = testbed.Test.GetParticleParameterValue();
                    const pd = new box2d.b2ParticleDef();
                    pd.position.Set(0.0, 40.0);
                    pd.velocity.Set(0.0, -1.0);
                    pd.flags = flags;
                    if (flags & (8 /* b2_springParticle */ | 16 /* b2_elasticParticle */)) {
                        const count = this.m_particleSystem.GetParticleCount();
                        pd.velocity.Set(count & 1 ? -1.0 : 1.0, -5.0);
                        pd.flags |= 4096 /* b2_reactiveParticle */;
                    }
                    this.m_particleSystem.CreateParticle(pd);
                }
                static Create() {
                    return new AntiPointy();
                }
            };
            exports_1("AntiPointy", AntiPointy);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW50aVBvaW50eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFudGlQb2ludHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7Ozs7Ozs7Ozs7Ozs7OztZQU9IOzs7ZUFHRztZQUVILGFBQUEsTUFBYSxVQUFXLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBRzFDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUhILHdCQUFtQixHQUFHLEdBQUcsQ0FBQztvQkFLL0I7d0JBQ0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUUzQywrREFBK0Q7d0JBQy9ELCtEQUErRDt3QkFDL0QsbUJBQW1CO3dCQUVuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7d0JBRWpCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFOzRCQUN2QyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDekMsTUFBTSxRQUFRLEdBQUc7Z0NBQ2YsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztnQ0FDMUIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0NBQ2pDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDOzZCQUM1QixDQUFDOzRCQUNGLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUN2QixNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzt5QkFD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