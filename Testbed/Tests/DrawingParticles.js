/*
 * Copyright (c) 2013 Google, Inc.
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
    var box2d, testbed, DrawingParticles;
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
            DrawingParticles = class DrawingParticles extends testbed.Test {
                constructor() {
                    super();
                    this.m_drawing = true;
                    this.m_particleFlags = 0;
                    this.m_groupFlags = 0;
                    this.m_colorIndex = 0;
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-4, -2),
                                new box2d.b2Vec2(4, -2),
                                new box2d.b2Vec2(4, 0),
                                new box2d.b2Vec2(-4, 0),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-4, -2),
                                new box2d.b2Vec2(-2, -2),
                                new box2d.b2Vec2(-2, 6),
                                new box2d.b2Vec2(-4, 6),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(2, -2),
                                new box2d.b2Vec2(4, -2),
                                new box2d.b2Vec2(4, 6),
                                new box2d.b2Vec2(2, 6),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                        {
                            const shape = new box2d.b2PolygonShape();
                            const vertices = [
                                new box2d.b2Vec2(-4, 4),
                                new box2d.b2Vec2(4, 4),
                                new box2d.b2Vec2(4, 6),
                                new box2d.b2Vec2(-4, 6),
                            ];
                            shape.Set(vertices, 4);
                            ground.CreateFixture(shape, 0.0);
                        }
                    }
                    this.m_colorIndex = 0;
                    this.m_particleSystem.SetRadius(0.05 * 2);
                    this.m_lastGroup = null;
                    this.m_drawing = true;
                    // DEBUG: box2d.b2Assert((DrawingParticles.k_paramDef[0].CalculateValueMask() & DrawingParticles.Parameters.e_parameterBegin) === 0);
                    testbed.Test.SetParticleParameters(DrawingParticles.k_paramDef, DrawingParticles.k_paramDefCount);
                    testbed.Test.SetRestartOnParticleParameterChange(false);
                    this.m_particleFlags = testbed.Test.GetParticleParameterValue();
                    this.m_groupFlags = 0;
                }
                // Determine the current particle parameter from the drawing state and
                // group flags.
                DetermineParticleParameter() {
                    if (this.m_drawing) {
                        if (this.m_groupFlags === (2 /* b2_rigidParticleGroup */ | 1 /* b2_solidParticleGroup */)) {
                            return DrawingParticles.Parameters.e_parameterRigid;
                        }
                        if (this.m_groupFlags === 2 /* b2_rigidParticleGroup */ && this.m_particleFlags === 1024 /* b2_barrierParticle */) {
                            return DrawingParticles.Parameters.e_parameterRigidBarrier;
                        }
                        if (this.m_particleFlags === (16 /* b2_elasticParticle */ | 1024 /* b2_barrierParticle */)) {
                            return DrawingParticles.Parameters.e_parameterElasticBarrier;
                        }
                        if (this.m_particleFlags === (8 /* b2_springParticle */ | 1024 /* b2_barrierParticle */)) {
                            return DrawingParticles.Parameters.e_parameterSpringBarrier;
                        }
                        if (this.m_particleFlags === (4 /* b2_wallParticle */ | 8192 /* b2_repulsiveParticle */)) {
                            return DrawingParticles.Parameters.e_parameterRepulsive;
                        }
                        return this.m_particleFlags;
                    }
                    return DrawingParticles.Parameters.e_parameterMove;
                }
                Keyboard(key) {
                    this.m_drawing = key !== "x";
                    this.m_particleFlags = 0;
                    this.m_groupFlags = 0;
                    switch (key) {
                        case "e":
                            this.m_particleFlags = 16 /* b2_elasticParticle */;
                            this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                            break;
                        case "p":
                            this.m_particleFlags = 64 /* b2_powderParticle */;
                            break;
                        case "r":
                            this.m_groupFlags = 2 /* b2_rigidParticleGroup */ | 1 /* b2_solidParticleGroup */;
                            break;
                        case "s":
                            this.m_particleFlags = 8 /* b2_springParticle */;
                            this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                            break;
                        case "t":
                            this.m_particleFlags = 128 /* b2_tensileParticle */;
                            break;
                        case "v":
                            this.m_particleFlags = 32 /* b2_viscousParticle */;
                            break;
                        case "w":
                            this.m_particleFlags = 4 /* b2_wallParticle */;
                            this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                            break;
                        case "b":
                            this.m_particleFlags = 1024 /* b2_barrierParticle */ | 4 /* b2_wallParticle */;
                            break;
                        case "h":
                            this.m_particleFlags = 1024 /* b2_barrierParticle */;
                            this.m_groupFlags = 2 /* b2_rigidParticleGroup */;
                            break;
                        case "n":
                            this.m_particleFlags = 1024 /* b2_barrierParticle */ | 16 /* b2_elasticParticle */;
                            this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                            break;
                        case "m":
                            this.m_particleFlags = 1024 /* b2_barrierParticle */ | 8 /* b2_springParticle */;
                            this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                            break;
                        case "f":
                            this.m_particleFlags = 4 /* b2_wallParticle */ | 8192 /* b2_repulsiveParticle */;
                            break;
                        case "c":
                            this.m_particleFlags = 256 /* b2_colorMixingParticle */;
                            break;
                        case "z":
                            this.m_particleFlags = 2 /* b2_zombieParticle */;
                            break;
                        default:
                            break;
                    }
                    testbed.Test.SetParticleParameterValue(this.DetermineParticleParameter());
                }
                MouseMove(p) {
                    super.MouseMove(p);
                    if (this.m_drawing) {
                        const shape = new box2d.b2CircleShape();
                        shape.m_p.Copy(p);
                        shape.m_radius = 0.2;
                        ///  b2Transform xf;
                        ///  xf.SetIdentity();
                        const xf = box2d.b2Transform.IDENTITY;
                        this.m_particleSystem.DestroyParticlesInShape(shape, xf);
                        const joinGroup = this.m_lastGroup && this.m_groupFlags === this.m_lastGroup.GetGroupFlags();
                        if (!joinGroup) {
                            this.m_colorIndex = (this.m_colorIndex + 1) % testbed.Test.k_ParticleColorsCount;
                        }
                        const pd = new box2d.b2ParticleGroupDef();
                        pd.shape = shape;
                        pd.flags = this.m_particleFlags;
                        if ((this.m_particleFlags & (4 /* b2_wallParticle */ | 8 /* b2_springParticle */ | 16 /* b2_elasticParticle */)) ||
                            (this.m_particleFlags === (4 /* b2_wallParticle */ | 1024 /* b2_barrierParticle */))) {
                            pd.flags |= 4096 /* b2_reactiveParticle */;
                        }
                        pd.groupFlags = this.m_groupFlags;
                        pd.color.Copy(testbed.Test.k_ParticleColors[this.m_colorIndex]);
                        pd.group = this.m_lastGroup;
                        this.m_lastGroup = this.m_particleSystem.CreateParticleGroup(pd);
                        this.m_mouseTracing = false;
                    }
                }
                MouseUp(p) {
                    super.MouseUp(p);
                    this.m_lastGroup = null;
                }
                ParticleGroupDestroyed(group) {
                    super.ParticleGroupDestroyed(group);
                    if (group === this.m_lastGroup) {
                        this.m_lastGroup = null;
                    }
                }
                SplitParticleGroups() {
                    for (let group = this.m_particleSystem.GetParticleGroupList(); group; group = group.GetNext()) {
                        if (group !== this.m_lastGroup &&
                            (group.GetGroupFlags() & 2 /* b2_rigidParticleGroup */) &&
                            (group.GetAllParticleFlags() & 2 /* b2_zombieParticle */)) {
                            // Split a rigid particle group which may be disconnected
                            // by destroying particles.
                            this.m_particleSystem.SplitParticleGroup(group);
                        }
                    }
                }
                Step(settings) {
                    const parameterValue = testbed.Test.GetParticleParameterValue();
                    this.m_drawing = (parameterValue & DrawingParticles.Parameters.e_parameterMove) !== DrawingParticles.Parameters.e_parameterMove;
                    if (this.m_drawing) {
                        switch (parameterValue) {
                            case 16 /* b2_elasticParticle */:
                            case 8 /* b2_springParticle */:
                            case 4 /* b2_wallParticle */:
                                this.m_particleFlags = parameterValue;
                                this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                                break;
                            case DrawingParticles.Parameters.e_parameterRigid:
                                // b2_waterParticle is the default particle type in
                                // LiquidFun.
                                this.m_particleFlags = 0 /* b2_waterParticle */;
                                this.m_groupFlags = 2 /* b2_rigidParticleGroup */ | 1 /* b2_solidParticleGroup */;
                                break;
                            case DrawingParticles.Parameters.e_parameterRigidBarrier:
                                this.m_particleFlags = 1024 /* b2_barrierParticle */;
                                this.m_groupFlags = 2 /* b2_rigidParticleGroup */;
                                break;
                            case DrawingParticles.Parameters.e_parameterElasticBarrier:
                                this.m_particleFlags = 1024 /* b2_barrierParticle */ | 16 /* b2_elasticParticle */;
                                this.m_groupFlags = 0;
                                break;
                            case DrawingParticles.Parameters.e_parameterSpringBarrier:
                                this.m_particleFlags = 1024 /* b2_barrierParticle */ | 8 /* b2_springParticle */;
                                this.m_groupFlags = 0;
                                break;
                            case DrawingParticles.Parameters.e_parameterRepulsive:
                                this.m_particleFlags = 8192 /* b2_repulsiveParticle */ | 4 /* b2_wallParticle */;
                                this.m_groupFlags = 1 /* b2_solidParticleGroup */;
                                break;
                            default:
                                this.m_particleFlags = parameterValue;
                                this.m_groupFlags = 0;
                                break;
                        }
                    }
                    if (this.m_particleSystem.GetAllParticleFlags() & 2 /* b2_zombieParticle */) {
                        this.SplitParticleGroups();
                    }
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: (L) liquid, (E) elastic, (S) spring");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "(R) rigid, (W) wall, (V) viscous, (T) tensile");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "(F) repulsive wall, (B) wall barrier");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "(H) rigid barrier, (N) elastic barrier, (M) spring barrier");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "(C) color mixing, (Z) erase, (X) move");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                GetDefaultViewZoom() {
                    return 0.1;
                }
                static Create() {
                    return new DrawingParticles();
                }
            };
            exports_1("DrawingParticles", DrawingParticles);
            /**
             * Set bit 31 to distiguish these values from particle flags.
             */
            DrawingParticles.Parameters = {
                e_parameterBegin: (1 << 31),
                e_parameterMove: (1 << 31) | (1 << 0),
                e_parameterRigid: (1 << 31) | (1 << 1),
                e_parameterRigidBarrier: (1 << 31) | (1 << 2),
                e_parameterElasticBarrier: (1 << 31) | (1 << 3),
                e_parameterSpringBarrier: (1 << 31) | (1 << 4),
                e_parameterRepulsive: (1 << 31) | (1 << 5),
            };
            DrawingParticles.k_paramValues = [
                new testbed.ParticleParameterValue(2 /* b2_zombieParticle */, testbed.ParticleParameter.k_DefaultOptions, "erase"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterMove, testbed.ParticleParameter.k_DefaultOptions, "move"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterRigid, testbed.ParticleParameter.k_DefaultOptions, "rigid"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterRigidBarrier, testbed.ParticleParameter.k_DefaultOptions, "rigid barrier"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterElasticBarrier, testbed.ParticleParameter.k_DefaultOptions, "elastic barrier"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterSpringBarrier, testbed.ParticleParameter.k_DefaultOptions, "spring barrier"),
                new testbed.ParticleParameterValue(DrawingParticles.Parameters.e_parameterRepulsive, testbed.ParticleParameter.k_DefaultOptions, "repulsive wall"),
            ];
            DrawingParticles.k_paramDef = [
                new testbed.ParticleParameterDefinition(testbed.ParticleParameter.k_particleTypes),
                new testbed.ParticleParameterDefinition(DrawingParticles.k_paramValues),
            ];
            DrawingParticles.k_paramDefCount = DrawingParticles.k_paramDef.length;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd2luZ1BhcnRpY2xlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRyYXdpbmdQYXJ0aWNsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7Ozs7Ozs7Ozs7Ozs7OztZQU9ILG1CQUFBLE1BQWEsZ0JBQWlCLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBb0NoRDtvQkFDRSxLQUFLLEVBQUUsQ0FBQztvQkF0QkgsY0FBUyxHQUFHLElBQUksQ0FBQztvQkFDakIsb0JBQWUsR0FBRyxDQUFDLENBQUM7b0JBQ3BCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO29CQUNqQixpQkFBWSxHQUFHLENBQUMsQ0FBQztvQkFxQnRCO3dCQUNFLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFM0M7NEJBQ0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7NEJBQ3pDLE1BQU0sUUFBUSxHQUFHO2dDQUNmLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDeEIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ3RCLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7NkJBQ3hCLENBQUM7NEJBQ0YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZCLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3lCQUNsQzt3QkFFRDs0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