/*
* Copyright (c) 2015 Google, Inc.
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
    var box2d, testbed, ParticleContactDisabler, ParticleCollisionFilter;
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
            // Optionally disables particle / fixture and particle / particle contacts.
            ParticleContactDisabler = class ParticleContactDisabler extends box2d.b2ContactFilter {
                constructor() {
                    super(...arguments);
                    this.m_enableFixtureParticleCollisions = true;
                    this.m_enableParticleParticleCollisions = true;
                }
                // Blindly enable / disable collisions between fixtures and particles.
                ShouldCollideFixtureParticle() {
                    return this.m_enableFixtureParticleCollisions;
                }
                // Blindly enable / disable collisions between particles.
                ShouldCollideParticleParticle() {
                    return this.m_enableParticleParticleCollisions;
                }
            };
            exports_1("ParticleContactDisabler", ParticleContactDisabler);
            ParticleCollisionFilter = class ParticleCollisionFilter extends testbed.Test {
                constructor() {
                    super();
                    this.m_contactDisabler = new ParticleContactDisabler();
                    // must also set b2_particleContactFilterParticle and
                    // b2_fixtureContactFilterParticle flags for particle group
                    this.m_world.SetContactFilter(this.m_contactDisabler);
                    this.m_world.SetGravity(new box2d.b2Vec2(0, 0));
                    // Create the container.
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2ChainShape();
                        const vertices = [
                            new box2d.b2Vec2(-ParticleCollisionFilter.kBoxSize, -ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset),
                            new box2d.b2Vec2(ParticleCollisionFilter.kBoxSize, -ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset),
                            new box2d.b2Vec2(ParticleCollisionFilter.kBoxSize, ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset),
                            new box2d.b2Vec2(-ParticleCollisionFilter.kBoxSize, ParticleCollisionFilter.kBoxSize + ParticleCollisionFilter.kOffset),
                        ];
                        shape.CreateLoop(vertices);
                        const def = new box2d.b2FixtureDef();
                        def.shape = shape;
                        def.density = 0;
                        def.density = 0;
                        def.restitution = 1.0;
                        ground.CreateFixture(def);
                    }
                    // create the particles
                    this.m_particleSystem.SetRadius(0.5);
                    {
                        // b2PolygonShape shape;
                        const shape = new box2d.b2PolygonShape();
                        // shape.SetAsBox(1.5f, 1.5f, b2Vec2(kBoxSizeHalf, kBoxSizeHalf + kOffset), 0.0f);
                        shape.SetAsBox(1.5, 1.5, new box2d.b2Vec2(ParticleCollisionFilter.kBoxSizeHalf, ParticleCollisionFilter.kBoxSizeHalf + ParticleCollisionFilter.kOffset), 0.0);
                        // b2ParticleGroupDef pd;
                        const pd = new box2d.b2ParticleGroupDef();
                        // pd.shape = &shape;
                        pd.shape = shape;
                        // pd.flags = b2_powderParticle
                        // 		| b2_particleContactFilterParticle
                        // 		| b2_fixtureContactFilterParticle;
                        pd.flags = 64 /* b2_powderParticle */
                            | 131072 /* b2_particleContactFilterParticle */
                            | 65536 /* b2_fixtureContactFilterParticle */;
                        // m_particleGroup =
                        // 	m_particleSystem.CreateParticleGroup(pd);
                        this.m_particleGroup = this.m_particleSystem.CreateParticleGroup(pd);
                        // b2Vec2* velocities =
                        // 	m_particleSystem.GetVelocityBuffer() +
                        // 	m_particleGroup.GetBufferIndex();
                        const velocities = this.m_particleSystem.GetVelocityBuffer();
                        const index = this.m_particleGroup.GetBufferIndex();
                        // for (int i = 0; i < m_particleGroup.GetParticleCount(); ++i) {
                        // 	b2Vec2& v = *(velocities + i);
                        // 	v.Set(RandomFloat(), RandomFloat());
                        // 	v.Normalize();
                        // 	v *= kSpeedup;
                        // }
                        for (let i = 0; i < this.m_particleGroup.GetParticleCount(); ++i) {
                            const v = velocities[index + i];
                            v.Set(testbed.RandomFloat(), testbed.RandomFloat());
                            v.SelfNormalize();
                            v.SelfMul(ParticleCollisionFilter.kSpeedup);
                        }
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    // const int32 index = m_particleGroup.GetBufferIndex();
                    const index = this.m_particleGroup.GetBufferIndex();
                    // b2Vec2* const velocities =
                    // 	m_particleSystem.GetVelocityBuffer() + index;
                    const velocities = this.m_particleSystem.GetVelocityBuffer();
                    // for (int32 i = 0; i < m_particleGroup.GetParticleCount(); i++) {
                    // 	// Add energy to particles based upon the temperature.
                    // 	b2Vec2& v = velocities[i];
                    // 	v.Normalize();
                    // 	v *= kSpeedup;
                    // }
                    for (let i = 0; i < this.m_particleGroup.GetParticleCount(); ++i) {
                        const v = velocities[index + i];
                        v.SelfNormalize();
                        v.SelfMul(ParticleCollisionFilter.kSpeedup);
                    }
                    // key help
                    {
                        const k_keys = [
                            "Keys: (a) toggle Fixture collisions",
                            "      (s) toggle particle collisions",
                        ];
                        for (let i = 0; i < k_keys.length; ++i) {
                            testbed.g_debugDraw.DrawString(5, this.m_textLine, k_keys[i]);
                            this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        }
                    }
                }
                Keyboard(key) {
                    switch (key) {
                        case "a":
                            this.ToggleFixtureCollisions();
                            break;
                        case "s":
                            this.ToggleParticleCollisions();
                            break;
                        default:
                            super.Keyboard(key);
                            break;
                    }
                }
                ToggleFixtureCollisions() {
                    this.m_contactDisabler.m_enableFixtureParticleCollisions = !this.m_contactDisabler.m_enableFixtureParticleCollisions;
                }
                ToggleParticleCollisions() {
                    this.m_contactDisabler.m_enableParticleParticleCollisions = !this.m_contactDisabler.m_enableParticleParticleCollisions;
                }
                static Create() {
                    return new ParticleCollisionFilter();
                }
            };
            exports_1("ParticleCollisionFilter", ParticleCollisionFilter);
            ParticleCollisionFilter.kBoxSize = 10.0;
            ParticleCollisionFilter.kBoxSizeHalf = ParticleCollisionFilter.kBoxSize / 2;
            ParticleCollisionFilter.kOffset = 20.0;
            ParticleCollisionFilter.kParticlesContainerSize = ParticleCollisionFilter.kOffset + 0.5;
            ParticleCollisionFilter.kSpeedup = 8.0;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFydGljbGVDb2xsaXNpb25GaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQYXJ0aWNsZUNvbGxpc2lvbkZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCRTs7Ozs7Ozs7Ozs7Ozs7O1lBT0YsMkVBQTJFO1lBQzNFLDBCQUFBLE1BQWEsdUJBQXdCLFNBQVEsS0FBSyxDQUFDLGVBQWU7Z0JBQWxFOztvQkFDUyxzQ0FBaUMsR0FBRyxJQUFJLENBQUM7b0JBQ3pDLHVDQUFrQyxHQUFHLElBQUksQ0FBQztnQkFXbkQsQ0FBQztnQkFUQyxzRUFBc0U7Z0JBQy9ELDRCQUE0QjtvQkFDakMsT0FBTyxJQUFJLENBQUMsaUNBQWlDLENBQUM7Z0JBQ2hELENBQUM7Z0JBRUQseURBQXlEO2dCQUNsRCw2QkFBNkI7b0JBQ2xDLE9BQU8sSUFBSSxDQUFDLGtDQUFrQyxDQUFDO2dCQUNqRCxDQUFDO2FBQ0YsQ0FBQTs7WUFFRCwwQkFBQSxNQUFhLHVCQUF3QixTQUFRLE9BQU8sQ0FBQyxJQUFJO2dCQUN2RDtvQkFDRSxLQUFLLEVBQUUsQ0FBQztvQkE0SEgsc0JBQWlCLEdBQTRCLElBQUksdUJBQXVCLEVBQUUsQ0FBQztvQkExSGhGLHFEQUFxRDtvQkFDckQsMkRBQTJEO29CQUMzRCxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUV0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRWhELHdCQUF3QjtvQkFDeEI7d0JBQ0UsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dC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