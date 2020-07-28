/*
 * Copyright (c) 2014 Google, Inc
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
    var box2d, testbed, EmitterTracker, ParticleGroupTracker, FrackerSettings, Fracker, Fracker_Material, Fracker_DestructionListener;
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
             * Tracks instances of RadialEmitter and destroys them after a
             * specified period of time.
             */
            EmitterTracker = class EmitterTracker {
                constructor() {
                    this.m_emitterLifetime = [];
                }
                /**
                 * Delete all emitters.
                 */
                __dtor__() {
                    ///  for (std.map<RadialEmitter*, float32>.const_iterator it = m_emitterLifetime.begin(); it !== m_emitterLifetime.end(); ++it)
                    for (let it = 0; it < this.m_emitterLifetime.length; ++it) {
                        ///  delete it.first;
                        this.m_emitterLifetime[it].emitter.__dtor__();
                    }
                }
                /**
                 * Add an emitter to the tracker.
                 * This assumes emitter was allocated using "new" and ownership
                 * of the object is handed to this class.
                 */
                Add(emitter, lifetime) {
                    ///  m_emitterLifetime[emitter] = lifetime;
                    this.m_emitterLifetime.push({ emitter, lifetime });
                }
                /**
                 * Update all emitters destroying those who are too old.
                 */
                Step(dt) {
                    ///  std.vector<RadialEmitter*> emittersToDestroy;
                    const emittersToDestroy = [];
                    ///  for (std.map<RadialEmitter*, float32>.const_iterator it = m_emitterLifetime.begin(); it !== m_emitterLifetime.end(); ++it)
                    for (let it = 0; it < this.m_emitterLifetime.length; ++it) {
                        ///  RadialEmitter * const emitter = it.first;
                        const emitter = this.m_emitterLifetime[it].emitter;
                        ///  const float32 lifetime = it.second - dt;
                        const lifetime = this.m_emitterLifetime[it].lifetime - dt;
                        if (lifetime <= 0.0) {
                            emittersToDestroy.push(emitter);
                        }
                        ///  m_emitterLifetime[emitter] = lifetime;
                        this.m_emitterLifetime[it].lifetime = lifetime;
                        emitter.Step(dt);
                    }
                    ///  for (std.vector<RadialEmitter*>.const_iterator it = emittersToDestroy.begin(); it !== emittersToDestroy.end(); ++it)
                    for (let it = 0; it < emittersToDestroy.length; ++it) {
                        ///  RadialEmitter *emitter = *it;
                        const emitter = emittersToDestroy[it];
                        /// delete emitter;
                        emitter.__dtor__();
                        ///  m_emitterLifetime.erase(m_emitterLifetime.find(emitter));
                        this.m_emitterLifetime = this.m_emitterLifetime.filter((value) => {
                            return value.emitter !== emitter;
                        });
                    }
                }
            };
            exports_1("EmitterTracker", EmitterTracker);
            /**
             * Keep track of particle groups in a set, removing them when
             * they're destroyed.
             */
            ParticleGroupTracker = class ParticleGroupTracker extends box2d.b2DestructionListener {
                constructor() {
                    super(...arguments);
                    this.m_particleGroups = [];
                }
                /**
                 * Called when any particle group is about to be destroyed.
                 */
                SayGoodbyeParticleGroup(group) {
                    this.RemoveParticleGroup(group);
                }
                /**
                 * Add a particle group to the tracker.
                 */
                AddParticleGroup(group) {
                    this.m_particleGroups.push(group);
                }
                /**
                 * Remove a particle group from the tracker.
                 */
                RemoveParticleGroup(group) {
                    this.m_particleGroups.splice(this.m_particleGroups.indexOf(group), 1);
                }
                GetParticleGroups() {
                    return this.m_particleGroups;
                }
            };
            exports_1("ParticleGroupTracker", ParticleGroupTracker);
            FrackerSettings = class FrackerSettings {
            };
            exports_1("FrackerSettings", FrackerSettings);
            /**
             * Width and height of the world in tiles.
             */
            FrackerSettings.k_worldWidthTiles = 24;
            FrackerSettings.k_worldHeightTiles = 16;
            /**
             * Total number of tiles.
             */
            FrackerSettings.k_worldTiles = FrackerSettings.k_worldWidthTiles * FrackerSettings.k_worldHeightTiles;
            /**
             * Center of the world in world coordinates.
             */
            FrackerSettings.k_worldCenterX = 0.0;
            FrackerSettings.k_worldCenterY = 2.0;
            /**
             * Size of each tile in world units.
             */
            FrackerSettings.k_tileWidth = 0.2;
            FrackerSettings.k_tileHeight = 0.2;
            /**
             * Half width and height of tiles in world units.
             */
            FrackerSettings.k_tileHalfWidth = FrackerSettings.k_tileWidth * 0.5;
            FrackerSettings.k_tileHalfHeight = FrackerSettings.k_tileHeight * 0.5;
            /**
             * Half width and height of the world in world coordinates.
             */
            FrackerSettings.k_worldHalfWidth = (FrackerSettings.k_worldWidthTiles * FrackerSettings.k_tileWidth) * 0.5;
            FrackerSettings.k_worldHalfHeight = (FrackerSettings.k_worldHeightTiles * FrackerSettings.k_tileHeight) * 0.5;
            /**
             * Colors of tiles.
             */
            FrackerSettings.k_playerColor = new box2d.b2Color(1.0, 1.0, 1.0);
            FrackerSettings.k_playerFrackColor = new box2d.b2Color(1.0, 0.5, 0.5);
            FrackerSettings.k_wellColor = new box2d.b2Color(0.5, 0.5, 0.5);
            FrackerSettings.k_oilColor = new box2d.b2Color(1.0, 0.0, 0.0);
            FrackerSettings.k_waterColor = new box2d.b2Color(0.0, 0.2, 1.0);
            FrackerSettings.k_frackingFluidColor = new box2d.b2Color(0.8, 0.4, 0.0);
            /**
             * Default density of each body.
             */
            FrackerSettings.k_density = 0.1;
            /**
             * Radius of oil / water / fracking fluid particles.
             */
            FrackerSettings.k_particleRadius = ((FrackerSettings.k_tileWidth + FrackerSettings.k_tileHeight) * 0.5) * 0.2;
            /**
             * Probability (0..100%) of generating each tile (must sum to
             * 1.0).
             */
            FrackerSettings.k_dirtProbability = 80;
            FrackerSettings.k_emptyProbability = 10;
            FrackerSettings.k_oilProbability = 7;
            FrackerSettings.k_waterProbability = 3;
            /**
             * Lifetime of a fracking fluid emitter in seconds.
             */
            FrackerSettings.k_frackingFluidEmitterLifetime = 5.0;
            /**
             * Speed particles are sucked up the well.
             */
            FrackerSettings.k_wellSuckSpeedInside = FrackerSettings.k_tileHeight * 5.0;
            /**
             * Speed particle are sucket towards the well bottom.
             */
            FrackerSettings.k_wellSuckSpeedOutside = FrackerSettings.k_tileWidth * 1.0;
            /**
             * Time mouse button must be held before emitting fracking
             * fluid.
             */
            FrackerSettings.k_frackingFluidChargeTime = 1.0;
            /**
             * Scores.
             */
            FrackerSettings.k_scorePerOilParticle = 1;
            FrackerSettings.k_scorePerWaterParticle = -1;
            FrackerSettings.k_scorePerFrackingParticle = 0;
            FrackerSettings.k_scorePerFrackingDeployment = -10;
            /**
             * Oil Fracking simulator.
             *
             * Dig down to move the oil (red) to the well (gray). Try not to
             * contaminate the ground water (blue). To deploy fracking fluid
             * press 'space'.  Fracking fluid can be used to push other
             * fluids to the well head and ultimately score points.
             */
            Fracker = class Fracker extends testbed.Test {
                constructor() {
                    super();
                    this.m_wellX = FrackerSettings.k_worldWidthTiles - (FrackerSettings.k_worldWidthTiles / 4);
                    this.m_wellTop = FrackerSettings.k_worldHeightTiles - 1;
                    this.m_wellBottom = FrackerSettings.k_worldHeightTiles / 8;
                    this.m_tracker = new EmitterTracker();
                    this.m_allowInput = false;
                    this.m_frackingFluidChargeTime = -1.0;
                    this.m_material = [];
                    this.m_bodies = [];
                    /**
                     * Set of particle groups the well has influence over.
                     */
                    this.m_listener = new Fracker_DestructionListener(this.m_world);
                    this.m_particleSystem.SetRadius(FrackerSettings.k_particleRadius);
                    this.InitializeLayout();
                    // Create the boundaries of the play area.
                    this.CreateGround();
                    // Create the well.
                    this.CreateWell();
                    // Create the geography / features (tiles of the world).
                    this.CreateGeo();
                    // Create the player.
                    this.CreatePlayer();
                }
                __dtor__() {
                    this.m_listener.__dtor__();
                }
                /**
                 * Initialize the data structures used to track the material in
                 * each tile and the bodies associated with each tile.
                 */
                InitializeLayout() {
                    for (let i = 0; i < FrackerSettings.k_worldTiles; ++i) {
                        this.m_material[i] = Fracker_Material.EMPTY;
                        this.m_bodies[i] = null;
                    }
                }
                /**
                 * Get the material of the tile at the specified tile position.
                 */
                GetMaterial(x, y) {
                    ///  return *const_cast<Fracker*>(this).GetMaterialStorage(x, y);
                    return this.m_material[Fracker.TileToArrayOffset(x, y)];
                }
                /**
                 * Set the material of the tile at the specified tile position.
                 */
                SetMaterial(x, y, material) {
                    ///  *GetMaterialStorage(x, y) = material;
                    this.m_material[Fracker.TileToArrayOffset(x, y)] = material;
                }
                /**
                 * Get the body associated with the specified tile position.
                 */
                GetBody(x, y) {
                    ///  return *const_cast<Fracker*>(this).GetBodyStorage(x, y);
                    return this.m_bodies[Fracker.TileToArrayOffset(x, y)];
                }
                /**
                 * Set the body associated with the specified tile position.
                 */
                SetBody(x, y, body) {
                    ///  b2Body** const currentBody = GetBodyStorage(x, y);
                    const currentBody = this.m_bodies[Fracker.TileToArrayOffset(x, y)];
                    if (currentBody) {
                        this.m_world.DestroyBody(currentBody);
                    }
                    this.m_bodies[Fracker.TileToArrayOffset(x, y)] = body;
                }
                /**
                 * Create the player.
                 */
                CreatePlayer() {
                    const bd = new box2d.b2BodyDef();
                    bd.type = 1 /* b2_kinematicBody */;
                    this.m_player = this.m_world.CreateBody(bd);
                    const shape = new box2d.b2PolygonShape();
                    shape.SetAsBox(FrackerSettings.k_tileHalfWidth, FrackerSettings.k_tileHalfHeight, new box2d.b2Vec2(FrackerSettings.k_tileHalfWidth, FrackerSettings.k_tileHalfHeight), 0);
                    this.m_player.CreateFixture(shape, FrackerSettings.k_density);
                    this.m_player.SetTransformVec(Fracker.TileToWorld(FrackerSettings.k_worldWidthTiles / 2, FrackerSettings.k_worldHeightTiles / 2), 0);
                }
                /**
                 * Create the geography / features of the world.
                 */
                CreateGeo() {
                    // DEBUG: box2d.b2Assert(FrackerSettings.k_dirtProbability +
                    // DEBUG:   FrackerSettings.k_emptyProbability +
                    // DEBUG:   FrackerSettings.k_oilProbability +
                    // DEBUG:   FrackerSettings.k_waterProbability === 100);
                    for (let x = 0; x < FrackerSettings.k_worldWidthTiles; x++) {
                        for (let y = 0; y < FrackerSettings.k_worldHeightTiles; y++) {
                            if (this.GetMaterial(x, y) !== Fracker_Material.EMPTY) {
                                continue;
                            }
                            // Choose a tile at random.
                            const chance = Math.random() * 100.0;
                            // Create dirt if this is the bottom row or chance dictates it.
                            if (chance < FrackerSettings.k_dirtProbability || y === 0) {
                                this.CreateDirtBlock(x, y);
                            }
                            else if (chance < FrackerSettings.k_dirtProbability +
                                FrackerSettings.k_emptyProbability) {
                                this.SetMaterial(x, y, Fracker_Material.EMPTY);
                            }
                            else if (chance < FrackerSettings.k_dirtProbability +
                                FrackerSettings.k_emptyProbability +
                                FrackerSettings.k_oilProbability) {
                                this.CreateReservoirBlock(x, y, Fracker_Material.OIL);
                            }
                            else {
                                this.CreateReservoirBlock(x, y, Fracker_Material.WATER);
                            }
                        }
                    }
                }
                /**
                 * Create the boundary of the world.
                 */
                CreateGround() {
                    const bd = new box2d.b2BodyDef();
                    const ground = this.m_world.CreateBody(bd);
                    const shape = new box2d.b2ChainShape();
                    const bottomLeft = new box2d.b2Vec2(), topRight = new box2d.b2Vec2();
                    Fracker.GetExtents(bottomLeft, topRight);
                    const vertices = [
                        new box2d.b2Vec2(bottomLeft.x, bottomLeft.y),
                        new box2d.b2Vec2(topRight.x, bottomLeft.y),
                        new box2d.b2Vec2(topRight.x, topRight.y),
                        new box2d.b2Vec2(bottomLeft.x, topRight.y),
                    ];
                    shape.CreateLoop(vertices, 4);
                    ground.CreateFixture(shape, 0.0);
                }
                /**
                 * Create a dirt block at the specified world position.
                 */
                CreateDirtBlock(x, y) {
                    const position = Fracker.TileToWorld(x, y);
                    const bd = new box2d.b2BodyDef();
                    const body = this.m_world.CreateBody(bd);
                    const shape = new box2d.b2PolygonShape();
                    shape.SetAsBox(FrackerSettings.k_tileHalfWidth, FrackerSettings.k_tileHalfHeight, Fracker.CenteredPosition(position), 0);
                    body.CreateFixture(shape, FrackerSettings.k_density);
                    this.SetBody(x, y, body);
                    this.SetMaterial(x, y, Fracker_Material.DIRT);
                }
                /**
                 * Create particles in a tile with resources.
                 */
                CreateReservoirBlock(x, y, material) {
                    const position = Fracker.TileToWorld(x, y);
                    const shape = new box2d.b2PolygonShape();
                    this.SetMaterial(x, y, material);
                    shape.SetAsBox(FrackerSettings.k_tileHalfWidth, FrackerSettings.k_tileHalfHeight, Fracker.CenteredPosition(position), 0);
                    const pd = new box2d.b2ParticleGroupDef();
                    pd.flags = 128 /* b2_tensileParticle */ | 32 /* b2_viscousParticle */ | 512 /* b2_destructionListenerParticle */;
                    pd.shape = shape;
                    pd.color.Copy(material === Fracker_Material.OIL ?
                        FrackerSettings.k_oilColor : FrackerSettings.k_waterColor);
                    const group = this.m_particleSystem.CreateParticleGroup(pd);
                    this.m_listener.AddParticleGroup(group);
                    // Tag each particle with its type.
                    const particleCount = group.GetParticleCount();
                    ///  void** const userDataBuffer = m_particleSystem.GetUserDataBuffer() + group.GetBufferIndex();;
                    const userDataBuffer = this.m_particleSystem.GetUserDataBuffer();
                    const index = group.GetBufferIndex();
                    for (let i = 0; i < particleCount; ++i) {
                        ///  userDataBuffer[i] = GetMaterialStorage(x, y);
                        userDataBuffer[index + i] = this.m_material[Fracker.TileToArrayOffset(x, y)];
                    }
                    // Keep track of the total available oil.
                    if (material === Fracker_Material.OIL) {
                        this.m_listener.AddOil(particleCount);
                    }
                }
                /**
                 * Create a well and the region which applies negative pressure
                 * to suck out fluid.
                 */
                CreateWell() {
                    for (let y = this.m_wellBottom; y <= this.m_wellTop; y++) {
                        this.SetMaterial(this.m_wellX, y, Fracker_Material.WELL);
                    }
                }
                /**
                 * Create a fracking fluid emitter.
                 */
                CreateFrackingFluidEmitter(position) {
                    const groupDef = new box2d.b2ParticleGroupDef();
                    const group = this.m_particleSystem.CreateParticleGroup(groupDef);
                    this.m_listener.AddParticleGroup(group);
                    const emitter = new testbed.RadialEmitter();
                    emitter.SetGroup(group);
                    emitter.SetParticleSystem(this.m_particleSystem);
                    emitter.SetPosition(Fracker.CenteredPosition(position));
                    emitter.SetVelocity(new box2d.b2Vec2(0.0, -FrackerSettings.k_tileHalfHeight));
                    emitter.SetSpeed(FrackerSettings.k_tileHalfWidth * 0.1);
                    emitter.SetSize(new box2d.b2Vec2(FrackerSettings.k_tileHalfWidth, FrackerSettings.k_tileHalfHeight));
                    emitter.SetEmitRate(20.0);
                    emitter.SetColor(FrackerSettings.k_frackingFluidColor);
                    emitter.SetParticleFlags(128 /* b2_tensileParticle */ | 32 /* b2_viscousParticle */);
                    this.m_tracker.Add(emitter, FrackerSettings.k_frackingFluidEmitterLifetime);
                    this.m_listener.AddScore(FrackerSettings.k_scorePerFrackingDeployment);
                }
                /**
                 * Update the player's position.
                 */
                SetPlayerPosition(playerX, playerY) {
                    const playerPosition = this.m_player.GetTransform().p;
                    const currentPlayerX = [0];
                    const currentPlayerY = [0];
                    Fracker.WorldToTile(playerPosition, currentPlayerX, currentPlayerY);
                    playerX = box2d.b2Clamp(playerX, 0, FrackerSettings.k_worldWidthTiles - 1);
                    playerY = box2d.b2Clamp(playerY, 0, FrackerSettings.k_worldHeightTiles - 1);
                    // Only update if the player has moved and isn't attempting to
                    // move through the well.
                    if (this.GetMaterial(playerX, playerY) !== Fracker_Material.WELL &&
                        (currentPlayerX[0] !== playerX ||
                            currentPlayerY[0] !== playerY)) {
                        // Try to deploy any fracking fluid that was charging.
                        this.DeployFrackingFluid();
                        // Move the player.
                        this.m_player.SetTransformVec(Fracker.TileToWorld(playerX, playerY), 0);
                    }
                }
                /**
                 * Try to deploy fracking fluid at the player's position,
                 * returning true if successful.
                 */
                DeployFrackingFluid() {
                    let deployed = false;
                    const playerPosition = this.m_player.GetTransform().p;
                    if (this.m_frackingFluidChargeTime > FrackerSettings.k_frackingFluidChargeTime) {
                        this.CreateFrackingFluidEmitter(playerPosition);
                        deployed = true;
                    }
                    this.m_frackingFluidChargeTime = -1.0;
                    return deployed;
                }
                /**
                 * Destroy all particles in the box specified by a set of tile
                 * coordinates.
                 */
                DestroyParticlesInTiles(startX, startY, endX, endY) {
                    const shape = new box2d.b2PolygonShape();
                    const width = endX - startX + 1;
                    const height = endY - startY + 1;
                    const centerX = startX + width / 2;
                    const centerY = startY + height / 2;
                    shape.SetAsBox(FrackerSettings.k_tileHalfWidth * width, FrackerSettings.k_tileHalfHeight * height);
                    const killLocation = new box2d.b2Transform();
                    killLocation.SetPositionAngle(Fracker.CenteredPosition(Fracker.TileToWorld(centerX, centerY)), 0);
                    this.m_particleSystem.DestroyParticlesInShape(shape, killLocation);
                }
                JointDestroyed(joint) {
                    super.JointDestroyed(joint);
                }
                ParticleGroupDestroyed(group) {
                    super.ParticleGroupDestroyed(group);
                }
                BeginContact(contact) {
                    super.BeginContact(contact);
                }
                EndContact(contact) {
                    super.EndContact(contact);
                }
                PreSolve(contact, oldManifold) {
                    super.PreSolve(contact, oldManifold);
                }
                PostSolve(contact, impulse) {
                    super.PostSolve(contact, impulse);
                }
                /**
                 * a = left, d = right, a = up, s = down, e = deploy fracking
                 * fluid.
                 */
                Keyboard(key) {
                    // Only allow 1 move per simulation step.
                    if (!this.m_allowInput) {
                        return;
                    }
                    const playerPosition = this.m_player.GetTransform().p;
                    const playerX = [0];
                    const playerY = [0];
                    Fracker.WorldToTile(playerPosition, playerX, playerY);
                    switch (key) {
                        case "a":
                            playerX[0]--;
                            break;
                        case "s":
                            playerY[0]--;
                            break;
                        case "d":
                            playerX[0]++;
                            break;
                        case "w":
                            playerY[0]++;
                            break;
                        case "e":
                            // Start charging the fracking fluid.
                            if (this.m_frackingFluidChargeTime < 0.0) {
                                this.m_frackingFluidChargeTime = 0.0;
                            }
                            else {
                                // KeyboardUp() in freeglut (at least on OSX) is called
                                // repeatedly while a key is held.  This means there isn't
                                // a way for fracking fluid to be deployed when the user
                                // releases 'e'.  This works around the issue by attempting
                                // to deploy the fluid when 'e' is pressed again.
                                this.DeployFrackingFluid();
                            }
                            break;
                        default:
                            super.Keyboard(key);
                            break;
                    }
                    this.SetPlayerPosition(playerX[0], playerY[0]);
                    this.m_allowInput = false;
                }
                KeyboardUp(key) {
                    super.KeyboardUp(key);
                }
                MouseDown(p) {
                    super.MouseDown(p);
                    this.m_frackingFluidChargeTime = 0.0;
                }
                /**
                 * Try to deploy the fracking fluid or move the player.
                 */
                MouseUp(p) {
                    super.MouseUp(p);
                    if (!this.m_allowInput) {
                        return;
                    }
                    // If fracking fluid isn't being released, move the player.
                    if (!this.DeployFrackingFluid()) {
                        const playerPosition = this.m_player.GetTransform().p;
                        const playerX = [0];
                        const playerY = [0];
                        Fracker.WorldToTile(playerPosition, playerX, playerY);
                        // Move the player towards the mouse position, preferring to move
                        // along the axis with the maximal distance from the cursor.
                        const distance = box2d.b2Vec2.SubVV(p, Fracker.CenteredPosition(playerPosition), new box2d.b2Vec2());
                        const absDistX = Math.abs(distance.x);
                        const absDistY = Math.abs(distance.y);
                        if (absDistX > absDistY &&
                            absDistX >= FrackerSettings.k_tileHalfWidth) {
                            playerX[0] += distance.x > 0.0 ? 1 : -1;
                        }
                        else if (absDistY >= FrackerSettings.k_tileHalfWidth) {
                            playerY[0] += distance.y > 0.0 ? 1 : -1;
                        }
                        this.SetPlayerPosition(playerX[0], playerY[0]);
                    }
                    this.m_allowInput = false;
                }
                MouseMove(p) {
                    super.MouseMove(p);
                }
                Step(settings) {
                    let dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;
                    if (settings.pause && !settings.singleStep) {
                        dt = 0.0;
                    }
                    super.Step(settings);
                    this.m_tracker.Step(dt);
                    // Allow the user to move again.
                    this.m_allowInput = true;
                    // Charge up fracking fluid.
                    if (this.m_frackingFluidChargeTime >= 0.0) {
                        this.m_frackingFluidChargeTime += dt;
                    }
                    const playerPosition = this.m_player.GetTransform().p;
                    const playerX = [0];
                    const playerY = [0];
                    Fracker.WorldToTile(playerPosition, playerX, playerY);
                    // If the player is moved to a square with dirt, remove it.
                    if (this.GetMaterial(playerX[0], playerY[0]) === Fracker_Material.DIRT) {
                        this.SetMaterial(playerX[0], playerY[0], Fracker_Material.EMPTY);
                        this.SetBody(playerX[0], playerY[0], null);
                    }
                    // Destroy particles at the top of the well.
                    this.DestroyParticlesInTiles(this.m_wellX, this.m_wellTop, this.m_wellX, this.m_wellTop);
                    // Only move particles in the groups being tracked.
                    ///  const std.set<b2ParticleGroup*> &particleGroups = m_listener.GetParticleGroups();
                    const particleGroups = this.m_listener.GetParticleGroups();
                    ///  for (std.set<b2ParticleGroup*>.const_iterator it = particleGroups.begin(); it !== particleGroups.end(); ++it)
                    for (let it = 0; it < particleGroups.length; ++it) {
                        ///  b2ParticleGroup * const particleGroup = *it;
                        const particleGroup = particleGroups[it];
                        const index = particleGroup.GetBufferIndex();
                        ///  const b2Vec2* const positionBuffer = m_particleSystem.GetPositionBuffer() + index;
                        const positionBuffer = this.m_particleSystem.GetPositionBuffer();
                        ///  b2Vec2* const velocityBuffer = m_particleSystem.GetVelocityBuffer() + index;
                        const velocityBuffer = this.m_particleSystem.GetVelocityBuffer();
                        const particleCount = particleGroup.GetParticleCount();
                        for (let i = 0; i < particleCount; ++i) {
                            // Apply velocity to particles near the bottom or in the well
                            // sucking them up to the top.
                            const wellEnd = Fracker.CenteredPosition(Fracker.TileToWorld(this.m_wellX, this.m_wellBottom - 2));
                            const particlePosition = positionBuffer[index + i];
                            // Distance from the well's bottom.
                            ///  const b2Vec2 distance = particlePosition - wellEnd;
                            const distance = box2d.b2Vec2.SubVV(particlePosition, wellEnd, new box2d.b2Vec2());
                            // Distance from either well side wall.
                            const absDistX = Math.abs(distance.x);
                            if (absDistX < FrackerSettings.k_tileWidth &&
                                // If the particles are just below the well bottom.
                                distance.y > FrackerSettings.k_tileWidth * -2.0 &&
                                distance.y < 0.0) {
                                // Suck the particles towards the end of the well.
                                ///  b2Vec2 velocity = wellEnd - particlePosition;
                                const velocity = box2d.b2Vec2.SubVV(wellEnd, particlePosition, new box2d.b2Vec2());
                                velocity.Normalize();
                                ///  velocityBuffer[i] = velocity * FrackerSettings.k_wellSuckSpeedOutside;
                                velocityBuffer[index + i].Copy(velocity.SelfMul(FrackerSettings.k_wellSuckSpeedOutside));
                            }
                            else if (absDistX <= FrackerSettings.k_tileHalfWidth && distance.y > 0.0) {
                                // Suck the particles up the well with a random
                                // x component moving them side to side in the well.
                                const randomX = (Math.random() * FrackerSettings.k_tileHalfWidth) - distance.x;
                                const velocity = new box2d.b2Vec2(randomX, FrackerSettings.k_tileHeight);
                                velocity.Normalize();
                                ///  velocityBuffer[i] = velocity * FrackerSettings.k_wellSuckSpeedInside;
                                velocityBuffer[index + i].Copy(velocity.SelfMul(FrackerSettings.k_wellSuckSpeedInside));
                            }
                        }
                    }
                    // Draw everything.
                    this.DrawPlayer();
                    this.DrawWell();
                    this.DrawScore();
                }
                /**
                 * Render the well.
                 */
                DrawWell() {
                    for (let y = this.m_wellBottom; y <= this.m_wellTop; ++y) {
                        this.DrawQuad(Fracker.TileToWorld(this.m_wellX, y), FrackerSettings.k_wellColor);
                    }
                }
                /**
                 * Render the player / fracker.
                 */
                DrawPlayer() {
                    this.DrawQuad(this.m_player.GetTransform().p, Fracker.LerpColor(FrackerSettings.k_playerColor, FrackerSettings.k_playerFrackColor, box2d.b2Max(this.m_frackingFluidChargeTime /
                        FrackerSettings.k_frackingFluidChargeTime, 0.0)), true);
                }
                /**
                 * Render the score and the instructions / keys.
                 */
                DrawScore() {
                    ///  char score[512];
                    ///  sprintf(score, "Score: %d, Remaining Oil %d",
                    ///          m_listener.GetScore(), m_listener.GetOil());
                    ///  const char *lines[] = { score,  "Move: a,s,d,w   Fracking Fluid: e" };
                    ///  for (uint32 i = 0; i < B2_ARRAY_SIZE(lines); ++i)
                    ///  {
                    ///    m_debugDraw.DrawString(5, m_textLine, lines[i]);
                    ///    m_textLine += DRAW_STRING_NEW_LINE;
                    ///  }
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, `Score: ${this.m_listener.GetScore()}, Remaining Oil ${this.m_listener.GetOil()}`);
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Move: a,s,d,w   Fracking Fluid: e");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                /**
                 * Draw a quad at position of color that is either just an
                 * outline (fill = false) or solid (fill = true).
                 */
                DrawQuad(position, color, fill = false) {
                    ///  b2Vec2 verts[4];
                    const verts = box2d.b2Vec2.MakeArray(4);
                    const maxX = position.x + FrackerSettings.k_tileWidth;
                    const maxY = position.y + FrackerSettings.k_tileHeight;
                    verts[0].Set(position.x, maxY);
                    verts[1].Set(position.x, position.y);
                    verts[2].Set(maxX, position.y);
                    verts[3].Set(maxX, maxY);
                    if (fill) {
                        testbed.g_debugDraw.DrawPolygon(verts, 4, color);
                    }
                    else {
                        testbed.g_debugDraw.DrawSolidPolygon(verts, 4, color);
                    }
                }
                ///  // Get a pointer to the material of the tile at the specified position.
                ///  Material* GetMaterialStorage(const int32 x, const int32 y)
                ///  {
                ///    return &m_material[Fracker.TileToArrayOffset(x, y)];
                ///  }
                ///  // A pointer to the body storage associated with the specified tile
                ///  // position.
                ///  b2Body** GetBodyStorage(const int32 x, const int32 y)
                ///  {
                ///    return &m_bodies[Fracker.TileToArrayOffset(x, y)];
                ///  }
                GetDefaultViewZoom() {
                    return 0.1;
                }
                static Create() {
                    return new Fracker();
                }
                /**
                 * Get the bottom left position of the world in world units.
                 */
                static GetBottomLeft(bottomLeft) {
                    bottomLeft.Set(FrackerSettings.k_worldCenterX -
                        FrackerSettings.k_worldHalfWidth, FrackerSettings.k_worldCenterY -
                        FrackerSettings.k_worldHalfHeight);
                }
                /**
                 * Get the extents of the world in world units.
                 */
                static GetExtents(bottomLeft, topRight) {
                    Fracker.GetBottomLeft(bottomLeft);
                    topRight.Set(FrackerSettings.k_worldCenterX +
                        FrackerSettings.k_worldHalfWidth, FrackerSettings.k_worldCenterY +
                        FrackerSettings.k_worldHalfHeight);
                }
                // Convert a point in world coordintes to a tile location
                static WorldToTile(position, x, y) {
                    // Translate relative to the world center and scale based upon the
                    // tile size.
                    const bottomLeft = new box2d.b2Vec2();
                    Fracker.GetBottomLeft(bottomLeft);
                    x[0] = Math.floor(((position.x - bottomLeft.x) /
                        FrackerSettings.k_tileWidth) +
                        FrackerSettings.k_tileHalfWidth);
                    y[0] = Math.floor(((position.y - bottomLeft.y) /
                        FrackerSettings.k_tileHeight) +
                        FrackerSettings.k_tileHalfHeight);
                }
                /**
                 * Convert a tile position to a point  in world coordinates.
                 */
                static TileToWorld(x, y, out = new box2d.b2Vec2()) {
                    // Scale based upon the tile size and translate relative to the world
                    // center.
                    const bottomLeft = new box2d.b2Vec2();
                    Fracker.GetBottomLeft(bottomLeft);
                    return out.Set((x * FrackerSettings.k_tileWidth) + bottomLeft.x, (y * FrackerSettings.k_tileHeight) + bottomLeft.y);
                }
                /**
                 * Calculate the offset within an array of all world tiles using
                 * the specified tile coordinates.
                 */
                static TileToArrayOffset(x, y) {
                    // DEBUG: box2d.b2Assert(x >= 0);
                    // DEBUG: box2d.b2Assert(x < FrackerSettings.k_worldWidthTiles);
                    // DEBUG: box2d.b2Assert(y >= 0);
                    // DEBUG: box2d.b2Assert(y < FrackerSettings.k_worldHeightTiles);
                    return x + (y * FrackerSettings.k_worldWidthTiles);
                }
                /**
                 * Calculate the center of a tile position in world units.
                 */
                static CenteredPosition(position, out = new box2d.b2Vec2()) {
                    return out.Set(position.x + FrackerSettings.k_tileHalfWidth, position.y + FrackerSettings.k_tileHalfHeight);
                }
                /**
                 * Interpolate between color a and b using t.
                 */
                static LerpColor(a, b, t) {
                    return new box2d.b2Color(Fracker.Lerp(a.r, b.r, t), Fracker.Lerp(a.g, b.g, t), Fracker.Lerp(a.b, b.b, t));
                }
                /**
                 * Interpolate between a and b using t.
                 */
                static Lerp(a, b, t) {
                    return a * (1.0 - t) + b * t;
                }
            };
            exports_1("Fracker", Fracker);
            /**
             * Type of material in a tile.
             */
            (function (Fracker_Material) {
                Fracker_Material[Fracker_Material["EMPTY"] = 0] = "EMPTY";
                Fracker_Material[Fracker_Material["DIRT"] = 1] = "DIRT";
                Fracker_Material[Fracker_Material["ROCK"] = 2] = "ROCK";
                Fracker_Material[Fracker_Material["OIL"] = 3] = "OIL";
                Fracker_Material[Fracker_Material["WATER"] = 4] = "WATER";
                Fracker_Material[Fracker_Material["WELL"] = 5] = "WELL";
                Fracker_Material[Fracker_Material["PUMP"] = 6] = "PUMP";
            })(Fracker_Material || (Fracker_Material = {}));
            exports_1("Fracker_Material", Fracker_Material);
            /**
             * Keep track of particle groups which are drawn up the well and
             * tracks the score of the game.
             */
            Fracker_DestructionListener = class Fracker_DestructionListener extends ParticleGroupTracker {
                /**
                 * Initialize the particle system and world, setting this class
                 * as a destruction listener for the world.
                 */
                constructor(world) {
                    super();
                    this.m_score = 0;
                    this.m_oil = 0;
                    this.m_previousListener = null;
                    // DEBUG: box2d.b2Assert(world !== null);
                    this.m_world = world;
                    this.m_previousListener = world.m_destructionListener;
                    this.m_world.SetDestructionListener(this);
                }
                /**
                 * Initialize the score.
                 */
                __ctor__() { }
                __dtor__() {
                    if (this.m_world) {
                        this.m_world.SetDestructionListener(this.m_previousListener);
                    }
                }
                /**
                 * Add to the current score.
                 */
                AddScore(score) {
                    this.m_score += score;
                }
                /**
                 * Get the current score.
                 */
                GetScore() {
                    return this.m_score;
                }
                /**
                 * Add to the remaining oil.
                 */
                AddOil(oil) {
                    this.m_oil += oil;
                }
                /**
                 * Get the total oil.
                 */
                GetOil() {
                    return this.m_oil;
                }
                /**
                 * Update the score when certain particles are destroyed.
                 */
                SayGoodbyeParticle(particleSystem, index) {
                    // DEBUG: box2d.b2Assert(particleSystem !== null);
                    ///  const void * const userData = particleSystem.GetUserDataBuffer()[index];
                    const userData = particleSystem.GetUserDataBuffer()[index];
                    if (userData) {
                        ///  const Material material = *((Material*)userData);
                        const material = userData;
                        switch (material) {
                            case Fracker_Material.OIL:
                                this.AddScore(FrackerSettings.k_scorePerOilParticle);
                                this.AddOil(-1);
                                break;
                            case Fracker_Material.WATER:
                                this.AddScore(FrackerSettings.k_scorePerWaterParticle);
                                break;
                            default:
                                break;
                        }
                    }
                }
            };
            exports_1("Fracker_DestructionListener", Fracker_DestructionListener);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7Ozs7Ozs7Ozs7Ozs7OztZQU9IOzs7ZUFHRztZQUNILGlCQUFBLE1BQWEsY0FBYztnQkFBM0I7b0JBQ1Msc0JBQWlCLEdBQWdFLEVBQUUsQ0FBQztnQkF1RDdGLENBQUM7Z0JBckRDOzttQkFFRztnQkFDSSxRQUFRO29CQUNiLCtIQUErSDtvQkFDL0gsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUU7d0JBQ3pELHFCQUFxQjt3QkFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDL0M7Z0JBQ0gsQ0FBQztnQkFFRDs7OzttQkFJRztnQkFDSSxHQUFHLENBQUMsT0FBOEIsRUFBRSxRQUFnQjtvQkFDekQsMkNBQTJDO29CQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBRUQ7O21CQUVHO2dCQUNJLElBQUksQ0FBQyxFQUFVO29CQUNwQixrREFBa0Q7b0JBQ2xELE1BQU0saUJBQWlCLEdBQTRCLEVBQUUsQ0FBQztvQkFDdEQsK0hBQStIO29CQUMvSCxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTt3QkFDekQsOENBQThDO3dCQUM5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO3dCQUNuRCw2Q0FBNkM7d0JBQzdDLE1BQU0s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