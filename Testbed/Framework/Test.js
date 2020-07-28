System.register(["@box2d", "./DebugDraw.js", "./FullscreenUI.js", "./ParticleParameter.js"], function (exports_1, context_1) {
    "use strict";
    var box2d, DebugDraw_js_1, FullscreenUI_js_1, ParticleParameter_js_1, DRAW_STRING_NEW_LINE, Settings, TestEntry, DestructionListener, ContactPoint, QueryCallback2, Test;
    var __moduleName = context_1 && context_1.id;
    function RandomFloat(lo = -1, hi = 1) {
        let r = Math.random();
        r = (hi - lo) * r + lo;
        return r;
    }
    exports_1("RandomFloat", RandomFloat);
    return {
        setters: [
            function (box2d_1) {
                box2d = box2d_1;
            },
            function (DebugDraw_js_1_1) {
                DebugDraw_js_1 = DebugDraw_js_1_1;
            },
            function (FullscreenUI_js_1_1) {
                FullscreenUI_js_1 = FullscreenUI_js_1_1;
            },
            function (ParticleParameter_js_1_1) {
                ParticleParameter_js_1 = ParticleParameter_js_1_1;
            }
        ],
        execute: function () {
            // #endif
            exports_1("DRAW_STRING_NEW_LINE", DRAW_STRING_NEW_LINE = 16);
            Settings = class Settings {
                constructor() {
                    this.hz = 60;
                    this.velocityIterations = 8;
                    this.positionIterations = 3;
                    // #if B2_ENABLE_PARTICLE
                    // Particle iterations are needed for numerical stability in particle
                    // simulations with small particles and relatively high gravity.
                    // b2CalculateParticleIterations helps to determine the number.
                    this.particleIterations = box2d.b2CalculateParticleIterations(10, 0.04, 1 / this.hz);
                    // #endif
                    this.drawShapes = true;
                    // #if B2_ENABLE_PARTICLE
                    this.drawParticles = true;
                    // #endif
                    this.drawJoints = true;
                    this.drawAABBs = false;
                    this.drawContactPoints = false;
                    this.drawContactNormals = false;
                    this.drawContactImpulse = false;
                    this.drawFrictionImpulse = false;
                    this.drawCOMs = false;
                    this.drawControllers = true;
                    this.drawStats = false;
                    this.drawProfile = false;
                    this.enableWarmStarting = true;
                    this.enableContinuous = true;
                    this.enableSubStepping = false;
                    this.enableSleep = true;
                    this.pause = false;
                    this.singleStep = false;
                    // #if B2_ENABLE_PARTICLE
                    this.strictContacts = false;
                    // #endif
                }
            };
            exports_1("Settings", Settings);
            TestEntry = class TestEntry {
                constructor(name, createFcn) {
                    this.name = "unknown";
                    this.name = name;
                    this.createFcn = createFcn;
                }
            };
            exports_1("TestEntry", TestEntry);
            DestructionListener = class DestructionListener extends box2d.b2DestructionListener {
                constructor(test) {
                    super();
                    this.test = test;
                }
                SayGoodbyeJoint(joint) {
                    if (this.test.m_mouseJoint === joint) {
                        this.test.m_mouseJoint = null;
                    }
                    else {
                        this.test.JointDestroyed(joint);
                    }
                }
                SayGoodbyeFixture(fixture) { }
                // #if B2_ENABLE_PARTICLE
                SayGoodbyeParticleGroup(group) {
                    this.test.ParticleGroupDestroyed(group);
                }
            };
            exports_1("DestructionListener", DestructionListener);
            ContactPoint = class ContactPoint {
                constructor() {
                    this.normal = new box2d.b2Vec2();
                    this.position = new box2d.b2Vec2();
                    this.state = 0 /* b2_nullState */;
                    this.normalImpulse = 0;
                    this.tangentImpulse = 0;
                    this.separation = 0;
                }
            };
            exports_1("ContactPoint", ContactPoint);
            // #if B2_ENABLE_PARTICLE
            QueryCallback2 = class QueryCallback2 extends box2d.b2QueryCallback {
                constructor(particleSystem, shape, velocity) {
                    super();
                    this.m_particleSystem = particleSystem;
                    this.m_shape = shape;
                    this.m_velocity = velocity;
                }
                ReportFixture(fixture) {
                    return false;
                }
                ReportParticle(particleSystem, index) {
                    if (particleSystem !== this.m_particleSystem) {
                        return false;
                    }
                    const xf = box2d.b2Transform.IDENTITY;
                    const p = this.m_particleSystem.GetPositionBuffer()[index];
                    if (this.m_shape.TestPoint(xf, p)) {
                        const v = this.m_particleSystem.GetVelocityBuffer()[index];
                        v.Copy(this.m_velocity);
                    }
                    return true;
                }
            };
            // #endif
            Test = class Test extends box2d.b2ContactListener {
                // #endif
                constructor() {
                    super();
                    // #endif
                    this.m_bomb = null;
                    this.m_textLine = 30;
                    this.m_mouseJoint = null;
                    this.m_points = box2d.b2MakeArray(Test.k_maxContactPoints, (i) => new ContactPoint());
                    this.m_pointCount = 0;
                    this.m_bombSpawnPoint = new box2d.b2Vec2();
                    this.m_bombSpawning = false;
                    this.m_mouseWorld = new box2d.b2Vec2();
                    // #if B2_ENABLE_PARTICLE
                    this.m_mouseTracing = false;
                    this.m_mouseTracerPosition = new box2d.b2Vec2();
                    this.m_mouseTracerVelocity = new box2d.b2Vec2();
                    // #endif
                    this.m_stepCount = 0;
                    this.m_maxProfile = new box2d.b2Profile();
                    this.m_totalProfile = new box2d.b2Profile();
                    // #if B2_ENABLE_PARTICLE
                    this.m_particleParameters = null;
                    this.m_particleParameterDef = null;
                    // #if B2_ENABLE_PARTICLE
                    const particleSystemDef = new box2d.b2ParticleSystemDef();
                    // #endif
                    const gravity = new box2d.b2Vec2(0, -10);
                    this.m_world = new box2d.b2World(gravity);
                    // #if B2_ENABLE_PARTICLE
                    this.m_particleSystem = this.m_world.CreateParticleSystem(particleSystemDef);
                    // #endif
                    this.m_bomb = null;
                    this.m_textLine = 30;
                    this.m_mouseJoint = null;
                    this.m_destructionListener = new DestructionListener(this);
                    this.m_world.SetDestructionListener(this.m_destructionListener);
                    this.m_world.SetContactListener(this);
                    this.m_world.SetDebugDraw(DebugDraw_js_1.g_debugDraw);
                    // #if B2_ENABLE_PARTICLE
                    this.m_particleSystem.SetGravityScale(0.4);
                    this.m_particleSystem.SetDensity(1.2);
                    // #endif
                    const bodyDef = new box2d.b2BodyDef();
                    this.m_groundBody = this.m_world.CreateBody(bodyDef);
                }
                JointDestroyed(joint) { }
                // #if B2_ENABLE_PARTICLE
                ParticleGroupDestroyed(group) { }
                // #endif
                BeginContact(contact) { }
                EndContact(contact) { }
                PreSolve(contact, oldManifold) {
                    const manifold = contact.GetManifold();
                    if (manifold.pointCount === 0) {
                        return;
                    }
                    const fixtureA = contact.GetFixtureA();
                    const fixtureB = contact.GetFixtureB();
                    const state1 = Test.PreSolve_s_state1;
                    const state2 = Test.PreSolve_s_state2;
                    box2d.b2GetPointStates(state1, state2, oldManifold, manifold);
                    const worldManifold = Test.PreSolve_s_worldManifold;
                    contact.GetWorldManifold(worldManifold);
                    for (let i = 0; i < manifold.pointCount && this.m_pointCount < Test.k_maxContactPoints; ++i) {
                        const cp = this.m_points[this.m_pointCount];
                        cp.fixtureA = fixtureA;
                        cp.fixtureB = fixtureB;
                        cp.position.Copy(worldManifold.points[i]);
                        cp.normal.Copy(worldManifold.normal);
                        cp.state = state2[i];
                        cp.normalImpulse = manifold.points[i].normalImpulse;
                        cp.tangentImpulse = manifold.points[i].tangentImpulse;
                        cp.separation = worldManifold.separations[i];
                        ++this.m_pointCount;
                    }
                }
                PostSolve(contact, impulse) { }
                Keyboard(key) { }
                KeyboardUp(key) { }
                SetTextLine(line) {
                    this.m_textLine = line;
                }
                DrawTitle(title) {
                    DebugDraw_js_1.g_debugDraw.DrawString(5, DRAW_STRING_NEW_LINE, title);
                    this.m_textLine = 3 * DRAW_STRING_NEW_LINE;
                }
                MouseDown(p) {
                    this.m_mouseWorld.Copy(p);
                    // #if B2_ENABLE_PARTICLE
                    this.m_mouseTracing = true;
                    this.m_mouseTracerPosition.Copy(p);
                    this.m_mouseTracerVelocity.SetZero();
                    // #endif
                    if (this.m_mouseJoint !== null) {
                        this.m_world.DestroyJoint(this.m_mouseJoint);
                        this.m_mouseJoint = null;
                    }
                    let hit_fixture = null; // HACK: tsc doesn't detect calling callbacks
                    // Query the world for overlapping shapes.
                    this.m_world.QueryPointAABB(p, (fixture) => {
                        const body = fixture.GetBody();
                        if (body.GetType() === 2 /* b2_dynamicBody */) {
                            const inside = fixture.TestPoint(p);
                            if (inside) {
                                hit_fixture = fixture;
                                return false; // We are done, terminate the query.
                            }
                        }
                        return true; // Continue the query.
                    });
                    if (hit_fixture) {
                        const body = hit_fixture.GetBody();
                        const md = new box2d.b2MouseJointDef();
                        md.bodyA = this.m_groundBody;
                        md.bodyB = body;
                        md.target.Copy(p);
                        md.maxForce = 1000 * body.GetMass();
                        this.m_mouseJoint = this.m_world.CreateJoint(md);
                        body.SetAwake(true);
                    }
                }
                SpawnBomb(worldPt) {
                    this.m_bombSpawnPoint.Copy(worldPt);
                    this.m_bombSpawning = true;
                }
                CompleteBombSpawn(p) {
                    if (!this.m_bombSpawning) {
                        return;
                    }
                    const multiplier = 30;
                    const vel = box2d.b2Vec2.SubVV(this.m_bombSpawnPoint, p, new box2d.b2Vec2());
                    vel.SelfMul(multiplier);
                    this.LaunchBombAt(this.m_bombSpawnPoint, vel);
                    this.m_bombSpawning = false;
                }
                ShiftMouseDown(p) {
                    this.m_mouseWorld.Copy(p);
                    if (this.m_mouseJoint !== null) {
                        return;
                    }
                    this.SpawnBomb(p);
                }
                MouseUp(p) {
                    // #if B2_ENABLE_PARTICLE
                    this.m_mouseTracing = false;
                    // #endif
                    if (this.m_mouseJoint) {
                        this.m_world.DestroyJoint(this.m_mouseJoint);
                        this.m_mouseJoint = null;
                    }
                    if (this.m_bombSpawning) {
                        this.CompleteBombSpawn(p);
                    }
                }
                MouseMove(p) {
                    this.m_mouseWorld.Copy(p);
                    if (this.m_mouseJoint) {
                        this.m_mouseJoint.SetTarget(p);
                    }
                }
                LaunchBomb() {
                    const p = new box2d.b2Vec2(box2d.b2RandomRange(-15, 15), 30);
                    const v = box2d.b2Vec2.MulSV(-5, p, new box2d.b2Vec2());
                    this.LaunchBombAt(p, v);
                }
                LaunchBombAt(position, velocity) {
                    if (this.m_bomb) {
                        this.m_world.DestroyBody(this.m_bomb);
                        this.m_bomb = null;
                    }
                    const bd = new box2d.b2BodyDef();
                    bd.type = 2 /* b2_dynamicBody */;
                    bd.position.Copy(position);
                    bd.bullet = true;
                    this.m_bomb = this.m_world.CreateBody(bd);
                    this.m_bomb.SetLinearVelocity(velocity);
                    const circle = new box2d.b2CircleShape();
                    circle.m_radius = 0.3;
                    const fd = new box2d.b2FixtureDef();
                    fd.shape = circle;
                    fd.density = 20;
                    fd.restitution = 0;
                    // box2d.b2Vec2 minV = position - box2d.b2Vec2(0.3f,0.3f);
                    // box2d.b2Vec2 maxV = position + box2d.b2Vec2(0.3f,0.3f);
                    // box2d.b2AABB aabb;
                    // aabb.lowerBound = minV;
                    // aabb.upperBound = maxV;
                    this.m_bomb.CreateFixture(fd);
                }
                Step(settings) {
                    let timeStep = settings.hz > 0 ? 1 / settings.hz : 0;
                    if (settings.pause) {
                        if (settings.singleStep) {
                            settings.singleStep = false;
                        }
                        else {
                            timeStep = 0;
                        }
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "****PAUSED****");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                    }
                    let flags = 0 /* e_none */;
                    if (settings.drawShapes) {
                        flags |= 1 /* e_shapeBit */;
                    }
                    // #if B2_ENABLE_PARTICLE
                    if (settings.drawParticles) {
                        flags |= 32 /* e_particleBit */;
                    }
                    // #endif
                    if (settings.drawJoints) {
                        flags |= 2 /* e_jointBit */;
                    }
                    if (settings.drawAABBs) {
                        flags |= 4 /* e_aabbBit */;
                    }
                    if (settings.drawCOMs) {
                        flags |= 16 /* e_centerOfMassBit */;
                    }
                    if (settings.drawControllers) {
                        flags |= 64 /* e_controllerBit */;
                    }
                    DebugDraw_js_1.g_debugDraw.SetFlags(flags);
                    this.m_world.SetAllowSleeping(settings.enableSleep);
                    this.m_world.SetWarmStarting(settings.enableWarmStarting);
                    this.m_world.SetContinuousPhysics(settings.enableContinuous);
                    this.m_world.SetSubStepping(settings.enableSubStepping);
                    // #if B2_ENABLE_PARTICLE
                    this.m_particleSystem.SetStrictContactCheck(settings.strictContacts);
                    // #endif
                    this.m_pointCount = 0;
                    // #if B2_ENABLE_PARTICLE
                    this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations, settings.particleIterations);
                    // #else
                    // this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations);
                    // #endif
                    this.m_world.DrawDebugData();
                    if (timeStep > 0) {
                        ++this.m_stepCount;
                    }
                    if (settings.drawStats) {
                        const bodyCount = this.m_world.GetBodyCount();
                        const contactCount = this.m_world.GetContactCount();
                        const jointCount = this.m_world.GetJointCount();
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "bodies/contacts/joints = " + bodyCount + "/" + contactCount + "/" + jointCount);
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        // #if B2_ENABLE_PARTICLE
                        const particleCount = this.m_particleSystem.GetParticleCount();
                        const groupCount = this.m_particleSystem.GetParticleGroupCount();
                        const pairCount = this.m_particleSystem.GetPairCount();
                        const triadCount = this.m_particleSystem.GetTriadCount();
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "particles/groups/pairs/triads = " + particleCount + "/" + groupCount + "/" + pairCount + "/" + triadCount);
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        // #endif
                        const proxyCount = this.m_world.GetProxyCount();
                        const height = this.m_world.GetTreeHeight();
                        const balance = this.m_world.GetTreeBalance();
                        const quality = this.m_world.GetTreeQuality();
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "proxies/height/balance/quality = " + proxyCount + "/" + height + "/" + balance + "/" + quality.toFixed(2));
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                    }
                    // Track maximum profile times
                    {
                        const p = this.m_world.GetProfile();
                        this.m_maxProfile.step = box2d.b2Max(this.m_maxProfile.step, p.step);
                        this.m_maxProfile.collide = box2d.b2Max(this.m_maxProfile.collide, p.collide);
                        this.m_maxProfile.solve = box2d.b2Max(this.m_maxProfile.solve, p.solve);
                        this.m_maxProfile.solveInit = box2d.b2Max(this.m_maxProfile.solveInit, p.solveInit);
                        this.m_maxProfile.solveVelocity = box2d.b2Max(this.m_maxProfile.solveVelocity, p.solveVelocity);
                        this.m_maxProfile.solvePosition = box2d.b2Max(this.m_maxProfile.solvePosition, p.solvePosition);
                        this.m_maxProfile.solveTOI = box2d.b2Max(this.m_maxProfile.solveTOI, p.solveTOI);
                        this.m_maxProfile.broadphase = box2d.b2Max(this.m_maxProfile.broadphase, p.broadphase);
                        this.m_totalProfile.step += p.step;
                        this.m_totalProfile.collide += p.collide;
                        this.m_totalProfile.solve += p.solve;
                        this.m_totalProfile.solveInit += p.solveInit;
                        this.m_totalProfile.solveVelocity += p.solveVelocity;
                        this.m_totalProfile.solvePosition += p.solvePosition;
                        this.m_totalProfile.solveTOI += p.solveTOI;
                        this.m_totalProfile.broadphase += p.broadphase;
                    }
                    if (settings.drawProfile) {
                        const p = this.m_world.GetProfile();
                        const aveProfile = new box2d.b2Profile();
                        if (this.m_stepCount > 0) {
                            const scale = 1 / this.m_stepCount;
                            aveProfile.step = scale * this.m_totalProfile.step;
                            aveProfile.collide = scale * this.m_totalProfile.collide;
                            aveProfile.solve = scale * this.m_totalProfile.solve;
                            aveProfile.solveInit = scale * this.m_totalProfile.solveInit;
                            aveProfile.solveVelocity = scale * this.m_totalProfile.solveVelocity;
                            aveProfile.solvePosition = scale * this.m_totalProfile.solvePosition;
                            aveProfile.solveTOI = scale * this.m_totalProfile.solveTOI;
                            aveProfile.broadphase = scale * this.m_totalProfile.broadphase;
                        }
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "step [ave] (max) = " + p.step.toFixed(2) + " [" + aveProfile.step.toFixed(2) + "] (" + this.m_maxProfile.step.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "collide [ave] (max) = " + p.collide.toFixed(2) + " [" + aveProfile.collide.toFixed(2) + "] (" + this.m_maxProfile.collide.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "solve [ave] (max) = " + p.solve.toFixed(2) + " [" + aveProfile.solve.toFixed(2) + "] (" + this.m_maxProfile.solve.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "solve init [ave] (max) = " + p.solveInit.toFixed(2) + " [" + aveProfile.solveInit.toFixed(2) + "] (" + this.m_maxProfile.solveInit.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "solve velocity [ave] (max) = " + p.solveVelocity.toFixed(2) + " [" + aveProfile.solveVelocity.toFixed(2) + "] (" + this.m_maxProfile.solveVelocity.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "solve position [ave] (max) = " + p.solvePosition.toFixed(2) + " [" + aveProfile.solvePosition.toFixed(2) + "] (" + this.m_maxProfile.solvePosition.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "solveTOI [ave] (max) = " + p.solveTOI.toFixed(2) + " [" + aveProfile.solveTOI.toFixed(2) + "] (" + this.m_maxProfile.solveTOI.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                        DebugDraw_js_1.g_debugDraw.DrawString(5, this.m_textLine, "broad-phase [ave] (max) = " + p.broadphase.toFixed(2) + " [" + aveProfile.broadphase.toFixed(2) + "] (" + this.m_maxProfile.broadphase.toFixed(2) + ")");
                        this.m_textLine += DRAW_STRING_NEW_LINE;
                    }
                    // #if B2_ENABLE_PARTICLE
                    if (this.m_mouseTracing && !this.m_mouseJoint) {
                        const delay = 0.1;
                        ///b2Vec2 acceleration = 2 / delay * (1 / delay * (m_mouseWorld - m_mouseTracerPosition) - m_mouseTracerVelocity);
                        const acceleration = new box2d.b2Vec2();
                        acceleration.x = 2 / delay * (1 / delay * (this.m_mouseWorld.x - this.m_mouseTracerPosition.x) - this.m_mouseTracerVelocity.x);
                        acceleration.y = 2 / delay * (1 / delay * (this.m_mouseWorld.y - this.m_mouseTracerPosition.y) - this.m_mouseTracerVelocity.y);
                        ///m_mouseTracerVelocity += timeStep * acceleration;
                        this.m_mouseTracerVelocity.SelfMulAdd(timeStep, acceleration);
                        ///m_mouseTracerPosition += timeStep * m_mouseTracerVelocity;
                        this.m_mouseTracerPosition.SelfMulAdd(timeStep, this.m_mouseTracerVelocity);
                        const shape = new box2d.b2CircleShape();
                        shape.m_p.Copy(this.m_mouseTracerPosition);
                        shape.m_radius = 2 * this.GetDefaultViewZoom();
                        ///QueryCallback2 callback(m_particleSystem, &shape, m_mouseTracerVelocity);
                        const callback = new QueryCallback2(this.m_particleSystem, shape, this.m_mouseTracerVelocity);
                        const aabb = new box2d.b2AABB();
                        const xf = new box2d.b2Transform();
                        xf.SetIdentity();
                        shape.ComputeAABB(aabb, xf, 0);
                        this.m_world.QueryAABB(callback, aabb);
                    }
                    // #endif
                    if (this.m_bombSpawning) {
                        const c = new box2d.b2Color(0, 0, 1);
                        DebugDraw_js_1.g_debugDraw.DrawPoint(this.m_bombSpawnPoint, 4, c);
                        c.SetRGB(0.8, 0.8, 0.8);
                        DebugDraw_js_1.g_debugDraw.DrawSegment(this.m_mouseWorld, this.m_bombSpawnPoint, c);
                    }
                    if (settings.drawContactPoints) {
                        const k_impulseScale = 0.1;
                        const k_axisScale = 0.3;
                        for (let i = 0; i < this.m_pointCount; ++i) {
                            const point = this.m_points[i];
                            if (point.state === 1 /* b2_addState */) {
                                // Add
                                DebugDraw_js_1.g_debugDraw.DrawPoint(point.position, 10, new box2d.b2Color(0.3, 0.95, 0.3));
                            }
                            else if (point.state === 2 /* b2_persistState */) {
                                // Persist
                                DebugDraw_js_1.g_debugDraw.DrawPoint(point.position, 5, new box2d.b2Color(0.3, 0.3, 0.95));
                            }
                            if (settings.drawContactNormals) {
                                const p1 = point.position;
                                const p2 = box2d.b2Vec2.AddVV(p1, box2d.b2Vec2.MulSV(k_axisScale, point.normal, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
                                DebugDraw_js_1.g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.9));
                            }
                            else if (settings.drawContactImpulse) {
                                const p1 = point.position;
                                const p2 = box2d.b2Vec2.AddVMulSV(p1, k_impulseScale * point.normalImpulse, point.normal, new box2d.b2Vec2());
                                DebugDraw_js_1.g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
                            }
                            if (settings.drawFrictionImpulse) {
                                const tangent = box2d.b2Vec2.CrossVOne(point.normal, new box2d.b2Vec2());
                                const p1 = point.position;
                                const p2 = box2d.b2Vec2.AddVMulSV(p1, k_impulseScale * point.tangentImpulse, tangent, new box2d.b2Vec2());
                                DebugDraw_js_1.g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
                            }
                        }
                    }
                }
                ShiftOrigin(newOrigin) {
                    this.m_world.ShiftOrigin(newOrigin);
                }
                GetDefaultViewZoom() {
                    return 1.0;
                }
                /**
                 * Apply a preset range of colors to a particle group.
                 *
                 * A different color out of k_ParticleColors is applied to each
                 * particlesPerColor particles in the specified group.
                 *
                 * If particlesPerColor is 0, the particles in the group are
                 * divided into k_ParticleColorsCount equal sets of colored
                 * particles.
                 */
                ColorParticleGroup(group, particlesPerColor) {
                    // DEBUG: box2d.b2Assert(group !== null);
                    const colorBuffer = this.m_particleSystem.GetColorBuffer();
                    const particleCount = group.GetParticleCount();
                    const groupStart = group.GetBufferIndex();
                    const groupEnd = particleCount + groupStart;
                    const colorCount = Test.k_ParticleColors.length;
                    if (!particlesPerColor) {
                        particlesPerColor = Math.floor(particleCount / colorCount);
                        if (!particlesPerColor) {
                            particlesPerColor = 1;
                        }
                    }
                    for (let i = groupStart; i < groupEnd; i++) {
                        ///colorBuffer[i].Copy(box2d.Testbed.Test.k_ParticleColors[Math.floor(i / particlesPerColor) % colorCount]);
                        colorBuffer[i] = Test.k_ParticleColors[Math.floor(i / particlesPerColor) % colorCount].Clone();
                    }
                }
                /**
                 * Remove particle parameters matching "filterMask" from the set
                 * of particle parameters available for this test.
                 */
                InitializeParticleParameters(filterMask) {
                    const defaultNumValues = ParticleParameter_js_1.ParticleParameter.k_defaultDefinition[0].numValues;
                    const defaultValues = ParticleParameter_js_1.ParticleParameter.k_defaultDefinition[0].values;
                    ///  m_particleParameters = new ParticleParameter::Value[defaultNumValues];
                    this.m_particleParameters = [];
                    // Disable selection of wall and barrier particle types.
                    let numValues = 0;
                    for (let i = 0; i < defaultNumValues; i++) {
                        if (defaultValues[i].value & filterMask) {
                            continue;
                        }
                        ///memcpy(&m_particleParameters[numValues], &defaultValues[i], sizeof(defaultValues[0]));
                        this.m_particleParameters[numValues] = new ParticleParameter_js_1.ParticleParameterValue(defaultValues[i]);
                        numValues++;
                    }
                    this.m_particleParameterDef = new ParticleParameter_js_1.ParticleParameterDefinition(this.m_particleParameters, numValues);
                    ///m_particleParameterDef.values = m_particleParameters;
                    ///m_particleParameterDef.numValues = numValues;
                    Test.SetParticleParameters([this.m_particleParameterDef], 1);
                }
                /**
                 * Restore default particle parameters.
                 */
                RestoreParticleParameters() {
                    if (this.m_particleParameters) {
                        Test.SetParticleParameters(ParticleParameter_js_1.ParticleParameter.k_defaultDefinition, 1);
                        ///  delete [] m_particleParameters;
                        this.m_particleParameters = null;
                    }
                }
                /**
                 * Set whether to restart the test on particle parameter
                 * changes. This parameter is re-enabled when the test changes.
                 */
                static SetRestartOnParticleParameterChange(enable) {
                    Test.particleParameter.SetRestartOnChange(enable);
                }
                /**
                 * Set the currently selected particle parameter value.  This
                 * value must match one of the values in
                 * Main::k_particleTypes or one of the values referenced by
                 * particleParameterDef passed to SetParticleParameters().
                 */
                static SetParticleParameterValue(value) {
                    const index = Test.particleParameter.FindIndexByValue(value);
                    // If the particle type isn't found, so fallback to the first entry in the
                    // parameter.
                    Test.particleParameter.Set(index >= 0 ? index : 0);
                    return Test.particleParameter.GetValue();
                }
                /**
                 * Get the currently selected particle parameter value and
                 * enable particle parameter selection arrows on Android.
                 */
                static GetParticleParameterValue() {
                    // Enable display of particle type selection arrows.
                    Test.fullscreenUI.SetParticleParameterSelectionEnabled(true);
                    return Test.particleParameter.GetValue();
                }
                /**
                 * Override the default particle parameters for the test.
                 */
                static SetParticleParameters(particleParameterDef, particleParameterDefCount = particleParameterDef.length) {
                    Test.particleParameter.SetDefinition(particleParameterDef, particleParameterDefCount);
                }
            };
            exports_1("Test", Test);
            // #if B2_ENABLE_PARTICLE
            Test.fullscreenUI = new FullscreenUI_js_1.FullScreenUI();
            Test.particleParameter = new ParticleParameter_js_1.ParticleParameter();
            // #endif
            Test.k_maxContactPoints = 2048;
            Test.PreSolve_s_state1 = [ /*box2d.b2_maxManifoldPoints*/];
            Test.PreSolve_s_state2 = [ /*box2d.b2_maxManifoldPoints*/];
            Test.PreSolve_s_worldManifold = new box2d.b2WorldManifold();
            // #if B2_ENABLE_PARTICLE
            Test.k_ParticleColors = [
                new box2d.b2Color().SetByteRGBA(0xff, 0x00, 0x00, 0xff),
                new box2d.b2Color().SetByteRGBA(0x00, 0xff, 0x00, 0xff),
                new box2d.b2Color().SetByteRGBA(0x00, 0x00, 0xff, 0xff),
                new box2d.b2Color().SetByteRGBA(0xff, 0x8c, 0x00, 0xff),
                new box2d.b2Color().SetByteRGBA(0x00, 0xce, 0xd1, 0xff),
                new box2d.b2Color().SetByteRGBA(0xff, 0x00, 0xff, 0xff),
                new box2d.b2Color().SetByteRGBA(0xff, 0xd7, 0x00, 0xff),
                new box2d.b2Color().SetByteRGBA(0x00, 0xff, 0xff, 0xff),
            ];
            Test.k_ParticleColorsCount = Test.k_ParticleColors.length;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNBLFNBQWdCLFdBQVcsQ0FBQyxLQUFhLENBQUMsQ0FBQyxFQUFFLEtBQWEsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFSRCxTQUFTO1lBRVQsa0NBQWEsb0JBQW9CLEdBQVcsRUFBRSxFQUFDO1lBUS9DLFdBQUEsTUFBYSxRQUFRO2dCQUFyQjtvQkFDUyxPQUFFLEdBQVcsRUFBRSxDQUFDO29CQUNoQix1QkFBa0IsR0FBVyxDQUFDLENBQUM7b0JBQy9CLHVCQUFrQixHQUFXLENBQUMsQ0FBQztvQkFDdEMseUJBQXlCO29CQUN6QixxRUFBcUU7b0JBQ3JFLGdFQUFnRTtvQkFDaEUsK0RBQStEO29CQUN4RCx1QkFBa0IsR0FBVyxLQUFLLENBQUMsNkJBQTZCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMvRixTQUFTO29CQUNGLGVBQVUsR0FBWSxJQUFJLENBQUM7b0JBQ2xDLHlCQUF5QjtvQkFDbEIsa0JBQWEsR0FBWSxJQUFJLENBQUM7b0JBQ3JDLFNBQVM7b0JBQ0YsZUFBVSxHQUFZLElBQUksQ0FBQztvQkFDM0IsY0FBUyxHQUFZLEtBQUssQ0FBQztvQkFDM0Isc0JBQWlCLEdBQVksS0FBSyxDQUFDO29CQUNuQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7b0JBQ3BDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztvQkFDcEMsd0JBQW1CLEdBQVksS0FBSyxDQUFDO29CQUNyQyxhQUFRLEdBQVksS0FBSyxDQUFD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