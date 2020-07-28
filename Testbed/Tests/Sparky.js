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
    var box2d, testbed, ParticleVFX, Sparky;
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
            ParticleVFX = class ParticleVFX {
                constructor(particleSystem, origin, size, speed, lifetime, particleFlags) {
                    this.m_initialLifetime = 0.0;
                    this.m_remainingLifetime = 0.0;
                    this.m_halfLifetime = 0.0;
                    this.m_origColor = new box2d.b2Color();
                    // Create a circle to house the particles of size size
                    const shape = new box2d.b2CircleShape();
                    shape.m_p.Copy(origin);
                    shape.m_radius = size;
                    // Create particle def of random color.
                    const pd = new box2d.b2ParticleGroupDef();
                    pd.flags = particleFlags;
                    pd.shape = shape;
                    // this.m_origColor.Set(
                    //   Math.random(),
                    //   Math.random(),
                    //   Math.random(),
                    //   1.0);
                    function hue2rgb(p, q, t) {
                        if (t < 0) {
                            t += 1;
                        }
                        if (t > 1) {
                            t -= 1;
                        }
                        if (t < 1 / 6) {
                            return p + (q - p) * 6 * t;
                        }
                        if (t < 1 / 2) {
                            return q;
                        }
                        if (t < 2 / 3) {
                            return p + (q - p) * (2 / 3 - t) * 6;
                        }
                        return p;
                    }
                    function hslToRgb(h, s, l, a = 1) {
                        let r, g, b;
                        if (s === 0) {
                            r = g = b = l; // achromatic
                        }
                        else {
                            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                            const p = 2 * l - q;
                            r = hue2rgb(p, q, h + 1 / 3);
                            g = hue2rgb(p, q, h);
                            b = hue2rgb(p, q, h - 1 / 3);
                        }
                        return { r, g, b, a };
                    }
                    this.m_origColor.Copy(hslToRgb(Math.random(), 1, 0.5));
                    pd.color.Copy(this.m_origColor);
                    this.m_particleSystem = particleSystem;
                    // Create a circle full of particles
                    this.m_pg = this.m_particleSystem.CreateParticleGroup(pd);
                    this.m_initialLifetime = this.m_remainingLifetime = lifetime;
                    this.m_halfLifetime = this.m_initialLifetime * 0.5;
                    // Set particle initial velocity based on how far away it is from
                    // origin, exploding outwards.
                    const bufferIndex = this.m_pg.GetBufferIndex();
                    const pos = this.m_particleSystem.GetPositionBuffer();
                    const vel = this.m_particleSystem.GetVelocityBuffer();
                    for (let i = bufferIndex; i < bufferIndex + this.m_pg.GetParticleCount(); i++) {
                        ///  vel[i] = pos[i] - origin;
                        box2d.b2Vec2.SubVV(pos[i], origin, vel[i]);
                        ///  vel[i] *= speed;
                        box2d.b2Vec2.MulVS(vel[i], speed, vel[i]);
                    }
                }
                Drop() {
                    this.m_pg.DestroyParticles(false);
                    // this.m_pg = null;
                }
                ColorCoeff() {
                    if (this.m_remainingLifetime >= this.m_halfLifetime) {
                        return 1.0;
                    }
                    return 1.0 - ((this.m_halfLifetime - this.m_remainingLifetime) / this.m_halfLifetime);
                }
                Step(dt) {
                    if (dt > 0 && this.m_remainingLifetime > 0.0) {
                        this.m_remainingLifetime = Math.max(this.m_remainingLifetime - dt, 0.0);
                        const coeff = this.ColorCoeff();
                        const colors = this.m_particleSystem.GetColorBuffer();
                        const bufferIndex = this.m_pg.GetBufferIndex();
                        // Set particle colors all at once.
                        for (let i = bufferIndex; i < bufferIndex + this.m_pg.GetParticleCount(); i++) {
                            const c = colors[i];
                            // c *= coeff;
                            // c.SelfMul(coeff);
                            // c.a = this.m_origColor.a;
                            c.a *= coeff;
                        }
                    }
                }
                IsDone() {
                    return this.m_remainingLifetime <= 0.0;
                }
            };
            Sparky = class Sparky extends testbed.Test {
                constructor() {
                    super();
                    this.m_VFXIndex = 0;
                    this.m_VFX = [];
                    this.m_contact = false;
                    this.m_contactPoint = new box2d.b2Vec2();
                    // Set up array of sparks trackers.
                    this.m_VFXIndex = 0;
                    for (let i = 0; i < Sparky.c_maxVFX; i++) {
                        this.m_VFX[i] = null;
                    }
                    this.CreateWalls();
                    this.m_particleSystem.SetRadius(0.25 * 2); // HACK: increase particle radius
                    // Create a list of circles that will spark.
                    for (let i = 0; i < Sparky.c_maxCircles; i++) {
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        const body = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2CircleShape();
                        shape.m_p.Set(3.0 * testbed.RandomFloat(), Sparky.SHAPE_HEIGHT_OFFSET + Sparky.SHAPE_OFFSET * i);
                        shape.m_radius = 2;
                        const f = body.CreateFixture(shape, 0.5);
                        // Tag this as a sparkable body.
                        f.SetUserData({
                            spark: true,
                        });
                    }
                    testbed.Test.SetRestartOnParticleParameterChange(false);
                    testbed.Test.SetParticleParameterValue(64 /* b2_powderParticle */);
                }
                BeginContact(contact) {
                    super.BeginContact(contact);
                    // Check to see if these are two circles hitting one another.
                    const userA = contact.GetFixtureA().GetUserData();
                    const userB = contact.GetFixtureB().GetUserData();
                    if ((userA && userA.spark) ||
                        (userB && userB.spark)) {
                        const worldManifold = new box2d.b2WorldManifold();
                        contact.GetWorldManifold(worldManifold);
                        // Note that we overwrite any contact; if there are two collisions
                        // on the same frame, only the last one showers sparks.
                        // Two collisions are rare, and this also guarantees we will not
                        // run out of places to store ParticleVFX explosions.
                        this.m_contactPoint.Copy(worldManifold.points[0]);
                        this.m_contact = true;
                    }
                }
                Step(settings) {
                    const particleFlags = testbed.Test.GetParticleParameterValue();
                    let dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;
                    if (settings.pause && !settings.singleStep) {
                        dt = 0.0;
                    }
                    super.Step(settings);
                    // If there was a contacts...
                    if (this.m_contact) {
                        // ...explode!
                        this.AddVFX(this.m_contactPoint, particleFlags);
                        this.m_contact = false;
                    }
                    // Step particle explosions.
                    for (let i = 0; i < Sparky.c_maxVFX; i++) {
                        const vfx = this.m_VFX[i];
                        if (vfx === null) {
                            continue;
                        }
                        vfx.Step(dt);
                        if (vfx.IsDone()) {
                            /// delete vfx;
                            vfx.Drop();
                            this.m_VFX[i] = null;
                        }
                    }
                }
                AddVFX(p, particleFlags) {
                    const vfx = this.m_VFX[this.m_VFXIndex];
                    if (vfx !== null) {
                        /// delete vfx;
                        vfx.Drop();
                        this.m_VFX[this.m_VFXIndex] = null;
                    }
                    this.m_VFX[this.m_VFXIndex] = new ParticleVFX(this.m_particleSystem, p, testbed.RandomFloat(1.0, 2.0), testbed.RandomFloat(10.0, 20.0), testbed.RandomFloat(0.5, 1.0), particleFlags);
                    if (++this.m_VFXIndex >= Sparky.c_maxVFX) {
                        this.m_VFXIndex = 0;
                    }
                }
                CreateWalls() {
                    // Create the walls of the world.
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-40, -10),
                                new box2d.b2Vec2(40, -10),
                                new box2d.b2Vec2(40, 0),
                                new box2d.b2Vec2(-40, 0),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-40, 40),
                                new box2d.b2Vec2(40, 40),
                                new box2d.b2Vec2(40, 50),
                                new box2d.b2Vec2(-40, 50),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-40, -10),
                                new box2d.b2Vec2(-20, -10),
                                new box2d.b2Vec2(-20, 50),
                                new box2d.b2Vec2(-40, 50),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(20, -10),
                                new box2d.b2Vec2(40, -10),
                                new box2d.b2Vec2(40, 50),
                                new box2d.b2Vec2(20, 50),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                    }
                }
                static Create() {
                    return new Sparky();
                }
            };
            exports_1("Sparky", Sparky);
            Sparky.c_maxCircles = 3; ///6;
            Sparky.c_maxVFX = 20; ///50;
            Sparky.SHAPE_HEIGHT_OFFSET = 7;
            Sparky.SHAPE_OFFSET = 4.5;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Bhcmt5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3Bhcmt5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7Ozs7Ozs7Ozs7WUFPRixjQUFBLE1BQU0sV0FBVztnQkFPZixZQUFZLGNBQXNDLEVBQUUsTUFBb0IsRUFBRSxJQUFZLEVBQUUsS0FBYSxFQUFFLFFBQWdCLEVBQUUsYUFBbUM7b0JBTnBKLHNCQUFpQixHQUFHLEdBQUcsQ0FBQztvQkFDeEIsd0JBQW1CLEdBQUcsR0FBRyxDQUFDO29CQUMxQixtQkFBYyxHQUFHLEdBQUcsQ0FBQztvQkFHckIsZ0JBQVcsR0FBa0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBRXZELHNEQUFzRDtvQkFDdEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3hDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN2QixLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFFdEIsdUNBQXVDO29CQUN2QyxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUMxQyxFQUFFLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQztvQkFDekIsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQ2pCLHdCQUF3QjtvQkFDeEIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLG1CQUFtQjtvQkFDbkIsVUFBVTtvQkFDVixTQUFTLE9BQU8sQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7d0JBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUFFO3dCQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7NEJBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFBRTt3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