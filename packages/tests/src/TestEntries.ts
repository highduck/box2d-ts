/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
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

import { TestEntry } from '@highduck/box2d-testbed';

import { AddPair } from './Tests/AddPair.js';
import { ApplyForce } from './Tests/ApplyForce.js';
import { BasicSliderCrank } from './Tests/BasicSliderCrank.js';
import { BodyTypes } from './Tests/BodyTypes.js';
import { Breakable } from './Tests/Breakable.js';
import { Bridge } from './Tests/Bridge.js';
import { BulletTest } from './Tests/BulletTest.js';
import { Cantilever } from './Tests/Cantilever.js';
import { Car } from './Tests/Car.js';
import { ContinuousTest } from './Tests/ContinuousTest.js';
import { Chain } from './Tests/Chain.js';
import { CharacterCollision } from './Tests/CharacterCollision.js';
import { CollisionFiltering } from './Tests/CollisionFiltering.js';
import { CollisionProcessing } from './Tests/CollisionProcessing.js';
import { CompoundShapes } from './Tests/CompoundShapes.js';
import { Confined } from './Tests/Confined.js';
import { ConvexHull } from './Tests/ConvexHull.js';
import { ConveyorBelt } from './Tests/ConveyorBelt.js';
import { DistanceTest } from './Tests/DistanceTest.js';
import { Dominos } from './Tests/Dominos.js';
import { DumpShell } from './Tests/DumpShell.js';
import { DynamicTreeTest } from './Tests/DynamicTreeTest.js';
import { EdgeShapes } from './Tests/EdgeShapes.js';
import { EdgeTest } from './Tests/EdgeTest.js';
import { Gears } from './Tests/Gears.js';
import { HeavyOnLight } from './Tests/HeavyOnLight.js';
import { HeavyOnLightTwo } from './Tests/HeavyOnLightTwo.js';
import { Mobile } from './Tests/Mobile.js';
import { MobileBalanced } from './Tests/MobileBalanced.js';
import { MotorJoint } from './Tests/MotorJoint.js';
import { OneSidedPlatform } from './Tests/OneSidedPlatform.js';
import { Pinball } from './Tests/Pinball.js';
import { PolyCollision } from './Tests/PolyCollision.js';
import { PolyShapes } from './Tests/PolyShapes.js';
import { Prismatic } from './Tests/Prismatic.js';
import { Pulleys } from './Tests/Pulleys.js';
import { Pyramid } from './Tests/Pyramid.js';
import { RayCast } from './Tests/RayCast.js';
import { Revolute } from './Tests/Revolute.js';
import { RopeJoint } from './Tests/RopeJoint.js';
import { SensorTest } from './Tests/SensorTest.js';
import { ShapeCast } from './Tests/ShapeCast.js';
import { ShapeEditing } from './Tests/ShapeEditing.js';
import { Skier } from './Tests/Skier.js';
import { SliderCrank } from './Tests/SliderCrank.js';
import { SphereStack } from './Tests/SphereStack.js';
import { TheoJansen } from './Tests/TheoJansen.js';
import { Tiles } from './Tests/Tiles.js';
import { TimeOfImpact } from './Tests/TimeOfImpact.js';
import { Tumbler } from './Tests/Tumbler.js';
import { VaryingFriction } from './Tests/VaryingFriction.js';
import { VaryingRestitution } from './Tests/VaryingRestitution.js';
import { VerticalStack } from './Tests/VerticalStack.js';
import { Web } from './Tests/Web.js';

import { Rope } from './Tests/Rope.js';

import { MotorJoint2 } from './Tests/MotorJoint2.js';
import { BlobTest } from './Tests/BlobTest.js';
import { TestCCD } from './Tests/TestCCD.js';
import { TestRagdoll } from './Tests/TestRagdoll.js';
import { TestStack } from './Tests/TestStack.js';
import { PyramidTopple } from './Tests/PyramidTopple.js';
import { DominoTower } from './Tests/DominoTower.js';
import { TopdownCar } from './Tests/TopdownCar.js';

// #if B2_ENABLE_CONTROLLER
import { BuoyancyTest } from './Tests/BuoyancyTest.js';
// #endif

// #if B2_ENABLE_PARTICLE
import { Sandbox } from './Tests/Sandbox.js';
import { Sparky } from './Tests/Sparky.js';
import { DamBreak } from './Tests/DamBreak.js';
import { LiquidTimer } from './Tests/LiquidTimer.js';
import { WaveMachine } from './Tests/WaveMachine.js';
import { Particles } from './Tests/Particles.js';
import { Faucet } from './Tests/Faucet.js';
import { DrawingParticles } from './Tests/DrawingParticles.js';
import { Soup } from './Tests/Soup.js';
import { ParticlesSurfaceTension } from './Tests/ParticlesSurfaceTension.js';
import { ElasticParticles } from './Tests/ElasticParticles.js';
import { RigidParticles } from './Tests/RigidParticles.js';
import { MultipleParticleSystems } from './Tests/MultipleParticleSystems.js';
import { Impulse } from './Tests/Impulse.js';
import { SoupStirrer } from './Tests/SoupStirrer.js';
import { Fracker } from './Tests/Fracker.js';
import { Maxwell } from './Tests/Maxwell.js';
import { Ramp } from './Tests/Ramp.js';
import { Pointy } from './Tests/Pointy.js';
import { AntiPointy } from './Tests/AntiPointy.js';
import { CornerCase } from './Tests/CornerCase.js';
import { ParticleCollisionFilter } from './Tests/ParticleCollisionFilter.js';
import { EyeCandy } from './Tests/EyeCandy.js';
// #endif

import { Segway } from './Tests/Segway.js';

export const g_testEntries: TestEntry[] = [
  // #if B2_ENABLE_PARTICLE
  new TestEntry('Sparky', Sparky.Create),
  // #endif

  new TestEntry('Shape Cast', ShapeCast.Create),
  new TestEntry('Time of Impact', TimeOfImpact.Create),
  new TestEntry('Character Collision', CharacterCollision.Create),
  new TestEntry('Tiles', Tiles.Create),
  new TestEntry('Heavy on Light', HeavyOnLight.Create),
  new TestEntry('Heavy on Light Two', HeavyOnLightTwo.Create),
  new TestEntry('Vertical Stack', VerticalStack.Create),
  new TestEntry('Basic Slider Crank', BasicSliderCrank.Create),
  new TestEntry('Slider Crank', SliderCrank.Create),
  new TestEntry('Sphere Stack', SphereStack.Create),
  new TestEntry('Convex Hull', ConvexHull.Create),
  new TestEntry('Tumbler', Tumbler.Create),
  new TestEntry('Ray-Cast', RayCast.Create),
  new TestEntry('Dump Shell', DumpShell.Create),
  new TestEntry('Apply Force', ApplyForce.Create),
  new TestEntry('Continuous Test', ContinuousTest.Create),
  new TestEntry('Motor Joint', MotorJoint.Create),
  new TestEntry('One-Sided Platform', OneSidedPlatform.Create),
  new TestEntry('Mobile', Mobile.Create),
  new TestEntry('MobileBalanced', MobileBalanced.Create),
  new TestEntry('Conveyor Belt', ConveyorBelt.Create),
  new TestEntry('Gears', Gears.Create),
  new TestEntry('Varying Restitution', VaryingRestitution.Create),
  new TestEntry('Cantilever', Cantilever.Create),
  new TestEntry('Edge Test', EdgeTest.Create),
  new TestEntry('Body Types', BodyTypes.Create),
  new TestEntry('Shape Editing', ShapeEditing.Create),
  new TestEntry('Car', Car.Create),
  new TestEntry('Prismatic', Prismatic.Create),
  new TestEntry('Revolute', Revolute.Create),
  new TestEntry('Pulleys', Pulleys.Create),
  new TestEntry('Polygon Shapes', PolyShapes.Create),
  new TestEntry('Web', Web.Create),
  new TestEntry('RopeJoint', RopeJoint.Create),
  new TestEntry('Pinball', Pinball.Create),
  new TestEntry('Bullet Test', BulletTest.Create),
  new TestEntry('Confined', Confined.Create),
  new TestEntry('Pyramid', Pyramid.Create),
  new TestEntry("Theo Jansen's Walker", TheoJansen.Create),
  new TestEntry('Edge Shapes', EdgeShapes.Create),
  new TestEntry('PolyCollision', PolyCollision.Create),
  new TestEntry('Bridge', Bridge.Create),
  new TestEntry('Breakable', Breakable.Create),
  new TestEntry('Chain', Chain.Create),
  new TestEntry('Collision Filtering', CollisionFiltering.Create),
  new TestEntry('Collision Processing', CollisionProcessing.Create),
  new TestEntry('Compound Shapes', CompoundShapes.Create),
  new TestEntry('Distance Test', DistanceTest.Create),
  new TestEntry('Dominos', Dominos.Create),
  new TestEntry('Dynamic Tree', DynamicTreeTest.Create),
  new TestEntry('Sensor Test', SensorTest.Create),
  new TestEntry('Varying Friction', VaryingFriction.Create),
  new TestEntry('Add Pair Stress Test', AddPair.Create),
  new TestEntry('Skier', Skier.Create),

  new TestEntry('Rope', Rope.Create),

  new TestEntry('Motor Joint (Bug #487)', MotorJoint2.Create),
  new TestEntry('Blob Test', BlobTest.Create),
  new TestEntry('Continuous Collision', TestCCD.Create),
  new TestEntry('Ragdolls', TestRagdoll.Create),
  new TestEntry('Stacked Boxes', TestStack.Create),
  new TestEntry('Pyramid Topple', PyramidTopple.Create),
  new TestEntry('Domino Tower', DominoTower.Create),
  new TestEntry('TopDown Car', TopdownCar.Create),

  // #if B2_ENABLE_CONTROLLER
  new TestEntry('Buoyancy Test', BuoyancyTest.Create),
  // #endif

  // #if B2_ENABLE_PARTICLE
  new TestEntry('Sandbox', Sandbox.Create),
  // new TestEntry("Sparky", Sparky.Create),
  new TestEntry('DamBreak', DamBreak.Create),
  new TestEntry('Liquid Timer', LiquidTimer.Create),
  new TestEntry('Wave Machine', WaveMachine.Create),
  new TestEntry('Particles', Particles.Create),
  new TestEntry('Faucet', Faucet.Create),
  new TestEntry('Particle Drawing', DrawingParticles.Create),
  new TestEntry('Soup', Soup.Create),
  new TestEntry('Surface Tension', ParticlesSurfaceTension.Create),
  new TestEntry('Elastic Particles', ElasticParticles.Create),
  new TestEntry('Rigid Particles', RigidParticles.Create),
  new TestEntry('Multiple Systems', MultipleParticleSystems.Create),
  new TestEntry('Impulse', Impulse.Create),
  new TestEntry('Soup Stirrer', SoupStirrer.Create),
  new TestEntry('Fracker', Fracker.Create),
  new TestEntry('Maxwell', Maxwell.Create),
  new TestEntry('Ramp', Ramp.Create),
  new TestEntry('Pointy', Pointy.Create),
  new TestEntry('AntiPointy', AntiPointy.Create),
  new TestEntry('Corner Case', CornerCase.Create),
  new TestEntry('Particle Collisions', ParticleCollisionFilter.Create),
  new TestEntry('Eye Candy', EyeCandy.Create),
  // #endif

  new TestEntry('Segway', Segway.Create),
];
