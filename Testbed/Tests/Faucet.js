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
    var box2d, testbed, ParticleLifetimeRandomizer, Faucet;
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
            ParticleLifetimeRandomizer = class ParticleLifetimeRandomizer extends testbed.EmittedParticleCallback {
                constructor(minLifetime, maxLifetime) {
                    super();
                    this.m_minLifetime = 0.0;
                    this.m_maxLifetime = 0.0;
                    this.m_minLifetime = minLifetime;
                    this.m_maxLifetime = maxLifetime;
                }
                /**
                 * Called for each created particle.
                 */
                ParticleCreated(system, particleIndex) {
                    system.SetParticleLifetime(particleIndex, Math.random() * (this.m_maxLifetime - this.m_minLifetime) + this.m_minLifetime);
                }
            };
            exports_1("ParticleLifetimeRandomizer", ParticleLifetimeRandomizer);
            /**
             * Faucet test creates a container from boxes and continually
             * spawning particles with finite lifetimes that pour into the
             * box.
             */
            Faucet = class Faucet extends testbed.Test {
                constructor() {
                    super(); // base class constructor
                    /**
                     * Used to cycle through particle colors.
                     */
                    this.m_particleColorOffset = 0.0;
                    this.m_emitter = new testbed.RadialEmitter();
                    this.m_lifetimeRandomizer = new ParticleLifetimeRandomizer(Faucet.k_particleLifetimeMin, Faucet.k_particleLifetimeMax);
                    // Configure particle system parameters.
                    this.m_particleSystem.SetRadius(0.035);
                    this.m_particleSystem.SetMaxParticleCount(Faucet.k_maxParticleCount);
                    this.m_particleSystem.SetDestructionByAge(true);
                    let ground;
                    {
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                    }
                    // Create the container / trough style sink.
                    {
                        const shape = new box2d.b2PolygonShape();
                        const height = Faucet.k_containerHeight + Faucet.k_containerThickness;
                        shape.SetAsBox(Faucet.k_containerWidth - Faucet.k_containerThickness, Faucet.k_containerThickness, new box2d.b2Vec2(0.0, 0.0), 0.0);
                        ground.CreateFixture(shape, 0.0);
                        shape.SetAsBox(Faucet.k_containerThickness, height, new box2d.b2Vec2(-Faucet.k_containerWidth, Faucet.k_containerHeight), 0.0);
                        ground.CreateFixture(shape, 0.0);
                        shape.SetAsBox(Faucet.k_containerThickness, height, new box2d.b2Vec2(Faucet.k_containerWidth, Faucet.k_containerHeight), 0.0);
                        ground.CreateFixture(shape, 0.0);
                    }
                    // Create ground under the container to catch overflow.
                    {
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(Faucet.k_containerWidth * 5.0, Faucet.k_containerThickness, new box2d.b2Vec2(0.0, Faucet.k_containerThickness * -2.0), 0.0);
                        ground.CreateFixture(shape, 0.0);
                    }
                    // Create the faucet spout.
                    {
                        const shape = new box2d.b2PolygonShape();
                        const particleDiameter = this.m_particleSystem.GetRadius() * 2.0;
                        const faucetLength = Faucet.k_faucetLength * particleDiameter;
                        // Dimensions of the faucet in world units.
                        const length = faucetLength * Faucet.k_spoutLength;
                        const width = Faucet.k_containerWidth * Faucet.k_faucetWidth *
                            Faucet.k_spoutWidth;
                        // Height from the bottom of the container.
                        const height = (Faucet.k_containerHeight * Faucet.k_faucetHeight) +
                            (length * 0.5);
                        shape.SetAsBox(particleDiameter, length, new box2d.b2Vec2(-width, height), 0.0);
                        ground.CreateFixture(shape, 0.0);
                        shape.SetAsBox(particleDiameter, length, new box2d.b2Vec2(width, height), 0.0);
                        ground.CreateFixture(shape, 0.0);
                        shape.SetAsBox(width - particleDiameter, particleDiameter, new box2d.b2Vec2(0.0, height + length -
                            particleDiameter), 0.0);
                        ground.CreateFixture(shape, 0.0);
                    }
                    // Initialize the particle emitter.
                    {
                        const faucetLength = this.m_particleSystem.GetRadius() * 2.0 * Faucet.k_faucetLength;
                        this.m_emitter.SetParticleSystem(this.m_particleSystem);
                        this.m_emitter.SetCallback(this.m_lifetimeRandomizer);
                        this.m_emitter.SetPosition(new box2d.b2Vec2(Faucet.k_containerWidth * Faucet.k_faucetWidth, Faucet.k_containerHeight * Faucet.k_faucetHeight + (faucetLength * 0.5)));
                        this.m_emitter.SetVelocity(new box2d.b2Vec2(0.0, 0.0));
                        this.m_emitter.SetSize(new box2d.b2Vec2(0.0, faucetLength));
                        this.m_emitter.SetColor(new box2d.b2Color(1, 1, 1, 1));
                        this.m_emitter.SetEmitRate(120.0);
                        this.m_emitter.SetParticleFlags(testbed.Test.GetParticleParameterValue());
                    }
                    // Don't restart the test when changing particle types.
                    testbed.Test.SetRestartOnParticleParameterChange(false);
                    // Limit the set of particle types.
                    testbed.Test.SetParticleParameters(Faucet.k_paramDef, Faucet.k_paramDefCount);
                }
                Step(settings) {
                    let dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;
                    if (settings.pause && !settings.singleStep) {
                        dt = 0.0;
                    }
                    super.Step(settings);
                    this.m_particleColorOffset += dt;
                    // Keep m_particleColorOffset in the range 0.0f..k_ParticleColorsCount.
                    if (this.m_particleColorOffset >= testbed.Test.k_ParticleColorsCount) {
                        this.m_particleColorOffset -= testbed.Test.k_ParticleColorsCount;
                    }
                    // Propagate the currently selected particle flags.
                    this.m_emitter.SetParticleFlags(testbed.Test.GetParticleParameterValue());
                    // If this is a color mixing particle, add some color.
                    ///  b2Color color(1, 1, 1, 1);
                    if (this.m_emitter.GetParticleFlags() & 256 /* b2_colorMixingParticle */) {
                        // Each second, select a different color.
                        this.m_emitter.SetColor(testbed.Test.k_ParticleColors[Math.floor(this.m_particleColorOffset) % testbed.Test.k_ParticleColorsCount]);
                    }
                    else {
                        this.m_emitter.SetColor(new box2d.b2Color(1, 1, 1, 1));
                    }
                    // Create the particles.
                    this.m_emitter.Step(dt);
                    const k_keys = [
                        "Keys: (w) water, (q) powder",
                        "      (t) tensile, (v) viscous",
                        "      (c) color mixing, (s) static pressure",
                        "      (+) increase flow, (-) decrease flow",
                    ];
                    for (let i = 0; i < k_keys.length; ++i) {
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, k_keys[i]);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                }
                Keyboard(key) {
                    let parameter = 0;
                    switch (key) {
                        case "w":
                            parameter = 0 /* b2_waterParticle */;
                            break;
                        case "q":
                            parameter = 64 /* b2_powderParticle */;
                            break;
                        case "t":
                            parameter = 128 /* b2_tensileParticle */;
                            break;
                        case "v":
                            parameter = 32 /* b2_viscousParticle */;
                            break;
                        case "c":
                            parameter = 256 /* b2_colorMixingParticle */;
                            break;
                        case "s":
                            parameter = 2048 /* b2_staticPressureParticle */;
                            break;
                        case "=":
                            ///if (this.m_shift)
                            {
                                let emitRate = this.m_emitter.GetEmitRate();
                                emitRate *= Faucet.k_emitRateChangeFactor;
                                emitRate = box2d.b2Max(emitRate, Faucet.k_emitRateMin);
                                this.m_emitter.SetEmitRate(emitRate);
                            }
                            break;
                        case "-":
                            ///if (!this.shift)
                            {
                                let emitRate = this.m_emitter.GetEmitRate();
                                emitRate *= 1.0 / Faucet.k_emitRateChangeFactor;
                                emitRate = box2d.b2Min(emitRate, Faucet.k_emitRateMax);
                                this.m_emitter.SetEmitRate(emitRate);
                            }
                            break;
                        default:
                            // Nothing.
                            return;
                    }
                    testbed.Test.SetParticleParameterValue(parameter);
                }
                GetDefaultViewZoom() {
                    return 0.1;
                }
                /**
                 * Create the faucet test.
                 */
                static Create() {
                    return new Faucet();
                }
            };
            exports_1("Faucet", Faucet);
            /**
             * Minimum lifetime of particles in seconds.
             */
            Faucet.k_particleLifetimeMin = 30.0;
            /**
             * Maximum lifetime of particles in seconds.
             */
            Faucet.k_particleLifetimeMax = 50.0;
            /**
             * Height of the container.
             */
            Faucet.k_containerHeight = 0.2;
            /**
             * Width of the container.
             */
            Faucet.k_containerWidth = 1.0;
            /**
             * Thickness of the container's walls and bottom.
             */
            Faucet.k_containerThickness = 0.05;
            /**
             * Width of the faucet relative to the container width.
             */
            Faucet.k_faucetWidth = 0.1;
            /**
             * Height of the faucet relative to the base as a fraction of
             * the container height.
             */
            Faucet.k_faucetHeight = 15.0;
            /**
             * Length of the faucet as a fraction of the particle diameter.
             */
            Faucet.k_faucetLength = 2.0;
            /**
             * Spout height as a fraction of the faucet length.  This should
             * be greater than 1.0f).
             */
            Faucet.k_spoutLength = 2.0;
            /**
             * Spout width as a fraction of the *faucet* width.  This should
             * be greater than 1.0).
             */
            Faucet.k_spoutWidth = 1.1;
            /**
             * Maximum number of particles in the system.
             */
            Faucet.k_maxParticleCount = 1000;
            /**
             * Factor that is used to increase / decrease the emit rate.
             * This should be greater than 1.0.
             */
            Faucet.k_emitRateChangeFactor = 1.05;
            /**
             * Minimum emit rate of the faucet in particles per second.
             */
            Faucet.k_emitRateMin = 1.0;
            /**
             * Maximum emit rate of the faucet in particles per second.
             */
            Faucet.k_emitRateMax = 240.0;
            /**
             * Selection of particle types for this test.
             */
            Faucet.k_paramValues = [
                new testbed.ParticleParameterValue(0 /* b2_waterParticle */, testbed.ParticleParameter.k_DefaultOptions, "water"),
                new testbed.ParticleParameterValue(0 /* b2_waterParticle */, testbed.ParticleParameter.k_DefaultOptions | testbed.ParticleParameterOptions.OptionStrictContacts, "water (strict)"),
                new testbed.ParticleParameterValue(32 /* b2_viscousParticle */, testbed.ParticleParameter.k_DefaultOptions, "viscous"),
                new testbed.ParticleParameterValue(64 /* b2_powderParticle */, testbed.ParticleParameter.k_DefaultOptions, "powder"),
                new testbed.ParticleParameterValue(128 /* b2_tensileParticle */, testbed.ParticleParameter.k_DefaultOptions, "tensile"),
                new testbed.ParticleParameterValue(256 /* b2_colorMixingParticle */, testbed.ParticleParameter.k_DefaultOptions, "color mixing"),
                new testbed.ParticleParameterValue(2048 /* b2_staticPressureParticle */, testbed.ParticleParameter.k_DefaultOptions, "static pressure"),
            ];
            Faucet.k_paramDef = [
                new testbed.ParticleParameterDefinition(Faucet.k_paramValues),
            ];
            Faucet.k_paramDefCount = Faucet.k_paramDef.length;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmF1Y2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmF1Y2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHOzs7Ozs7Ozs7Ozs7Ozs7WUFPSCw2QkFBQSxNQUFhLDBCQUEyQixTQUFRLE9BQU8sQ0FBQyx1QkFBdUI7Z0JBRzdFLFlBQVksV0FBbUIsRUFBRSxXQUFtQjtvQkFDbEQsS0FBSyxFQUFFLENBQUM7b0JBSEgsa0JBQWEsR0FBRyxHQUFHLENBQUM7b0JBQ3BCLGtCQUFhLEdBQUcsR0FBRyxDQUFDO29CQUd6QixJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztvQkFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7Z0JBQ25DLENBQUM7Z0JBQ0Q7O21CQUVHO2dCQUNJLGVBQWUsQ0FBQyxNQUE4QixFQUFFLGFBQXFCO29CQUMxRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUgsQ0FBQzthQUNGLENBQUE7O1lBRUQ7Ozs7ZUFJRztZQUNILFNBQUEsTUFBYSxNQUFPLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBNEZ0QztvQkFDRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLHlCQUF5QjtvQkE1RnBDOzt1QkFFRztvQkFDSSwwQkFBcUIsR0FBRyxHQUFHLENBQUM7b0JBMkZqQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUM3QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBRXZILHdDQUF3QztvQkFDeEMsSUFBSSxDQUFD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