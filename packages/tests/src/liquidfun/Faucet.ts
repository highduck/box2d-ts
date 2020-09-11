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

// #if B2_ENABLE_PARTICLE

import {
  b2Body,
  b2BodyDef,
  b2Color,
  b2Max,
  b2Min,
  b2ParticleFlag,
  b2ParticleSystem,
  b2PolygonShape,
  b2Vec2,
} from '@highduck/box2d';
import {
  DRAW_STRING_NEW_LINE,
  EmittedParticleCallback,
  g_debugDraw,
  ParticleParameter,
  ParticleParameterDefinition,
  ParticleParameterOptions,
  ParticleParameterValue,
  RadialEmitter,
  Settings,
  Test,
} from '@highduck/box2d-testbed';

export class ParticleLifetimeRandomizer extends EmittedParticleCallback {
  public m_minLifetime = 0.0;
  public m_maxLifetime = 0.0;
  constructor(minLifetime: number, maxLifetime: number) {
    super();
    this.m_minLifetime = minLifetime;
    this.m_maxLifetime = maxLifetime;
  }
  /**
   * Called for each created particle.
   */
  public ParticleCreated(system: b2ParticleSystem, particleIndex: number): void {
    system.SetParticleLifetime(
      particleIndex,
      Math.random() * (this.m_maxLifetime - this.m_minLifetime) + this.m_minLifetime,
    );
  }
}

/**
 * Faucet test creates a container from boxes and continually
 * spawning particles with finite lifetimes that pour into the
 * box.
 */
export class Faucet extends Test {
  /**
   * Used to cycle through particle colors.
   */
  public m_particleColorOffset = 0.0;
  /**
   * Particle emitter.
   */
  public m_emitter: RadialEmitter;
  /**
   * Callback which sets the lifetime of emitted particles.
   */
  public m_lifetimeRandomizer: ParticleLifetimeRandomizer;

  /**
   * Minimum lifetime of particles in seconds.
   */
  public static readonly k_particleLifetimeMin = 30.0;
  /**
   * Maximum lifetime of particles in seconds.
   */
  public static readonly k_particleLifetimeMax = 50.0;
  /**
   * Height of the container.
   */
  public static readonly k_containerHeight = 0.2;
  /**
   * Width of the container.
   */
  public static readonly k_containerWidth = 1.0;
  /**
   * Thickness of the container's walls and bottom.
   */
  public static readonly k_containerThickness = 0.05;
  /**
   * Width of the faucet relative to the container width.
   */
  public static readonly k_faucetWidth = 0.1;
  /**
   * Height of the faucet relative to the base as a fraction of
   * the container height.
   */
  public static readonly k_faucetHeight = 15.0;
  /**
   * Length of the faucet as a fraction of the particle diameter.
   */
  public static readonly k_faucetLength = 2.0;
  /**
   * Spout height as a fraction of the faucet length.  This should
   * be greater than 1.0f).
   */
  public static readonly k_spoutLength = 2.0;
  /**
   * Spout width as a fraction of the *faucet* width.  This should
   * be greater than 1.0).
   */
  public static readonly k_spoutWidth = 1.1;
  /**
   * Maximum number of particles in the system.
   */
  public static readonly k_maxParticleCount = 1000;
  /**
   * Factor that is used to increase / decrease the emit rate.
   * This should be greater than 1.0.
   */
  public static readonly k_emitRateChangeFactor = 1.05;
  /**
   * Minimum emit rate of the faucet in particles per second.
   */
  public static readonly k_emitRateMin = 1.0;
  /**
   * Maximum emit rate of the faucet in particles per second.
   */
  public static readonly k_emitRateMax = 240.0;

  /**
   * Selection of particle types for this test.
   */
  public static readonly k_paramValues: ParticleParameterValue[] = [
    new ParticleParameterValue(
      b2ParticleFlag.b2_waterParticle,
      ParticleParameter.k_DefaultOptions,
      'water',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_waterParticle,
      ParticleParameter.k_DefaultOptions | ParticleParameterOptions.OptionStrictContacts,
      'water (strict)',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_viscousParticle,
      ParticleParameter.k_DefaultOptions,
      'viscous',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_powderParticle,
      ParticleParameter.k_DefaultOptions,
      'powder',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_tensileParticle,
      ParticleParameter.k_DefaultOptions,
      'tensile',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_colorMixingParticle,
      ParticleParameter.k_DefaultOptions,
      'color mixing',
    ),
    new ParticleParameterValue(
      b2ParticleFlag.b2_staticPressureParticle,
      ParticleParameter.k_DefaultOptions,
      'static pressure',
    ),
  ];
  public static readonly k_paramDef: ParticleParameterDefinition[] = [
    new ParticleParameterDefinition(Faucet.k_paramValues),
  ];
  public static readonly k_paramDefCount = Faucet.k_paramDef.length;

  constructor() {
    super(); // base class constructor

    this.m_emitter = new RadialEmitter();
    this.m_lifetimeRandomizer = new ParticleLifetimeRandomizer(
      Faucet.k_particleLifetimeMin,
      Faucet.k_particleLifetimeMax,
    );

    // Configure particle system parameters.
    this.m_particleSystem.SetRadius(0.035);
    this.m_particleSystem.SetMaxParticleCount(Faucet.k_maxParticleCount);
    this.m_particleSystem.SetDestructionByAge(true);

    let ground: b2Body;
    {
      const bd = new b2BodyDef();
      ground = this.m_world.CreateBody(bd);
    }

    // Create the container / trough style sink.
    {
      const shape = new b2PolygonShape();
      const height = Faucet.k_containerHeight + Faucet.k_containerThickness;
      shape.SetAsBox(
        Faucet.k_containerWidth - Faucet.k_containerThickness,
        Faucet.k_containerThickness,
        new b2Vec2(0.0, 0.0),
        0.0,
      );
      ground.CreateFixture(shape, 0.0);
      shape.SetAsBox(
        Faucet.k_containerThickness,
        height,
        new b2Vec2(-Faucet.k_containerWidth, Faucet.k_containerHeight),
        0.0,
      );
      ground.CreateFixture(shape, 0.0);
      shape.SetAsBox(
        Faucet.k_containerThickness,
        height,
        new b2Vec2(Faucet.k_containerWidth, Faucet.k_containerHeight),
        0.0,
      );
      ground.CreateFixture(shape, 0.0);
    }

    // Create ground under the container to catch overflow.
    {
      const shape = new b2PolygonShape();
      shape.SetAsBox(
        Faucet.k_containerWidth * 5.0,
        Faucet.k_containerThickness,
        new b2Vec2(0.0, Faucet.k_containerThickness * -2.0),
        0.0,
      );
      ground.CreateFixture(shape, 0.0);
    }

    // Create the faucet spout.
    {
      const shape = new b2PolygonShape();
      const particleDiameter = this.m_particleSystem.GetRadius() * 2.0;
      const faucetLength = Faucet.k_faucetLength * particleDiameter;
      // Dimensions of the faucet in world units.
      const length = faucetLength * Faucet.k_spoutLength;
      const width = Faucet.k_containerWidth * Faucet.k_faucetWidth * Faucet.k_spoutWidth;
      // Height from the bottom of the container.
      const height = Faucet.k_containerHeight * Faucet.k_faucetHeight + length * 0.5;

      shape.SetAsBox(particleDiameter, length, new b2Vec2(-width, height), 0.0);
      ground.CreateFixture(shape, 0.0);
      shape.SetAsBox(particleDiameter, length, new b2Vec2(width, height), 0.0);
      ground.CreateFixture(shape, 0.0);
      shape.SetAsBox(
        width - particleDiameter,
        particleDiameter,
        new b2Vec2(0.0, height + length - particleDiameter),
        0.0,
      );
      ground.CreateFixture(shape, 0.0);
    }

    // Initialize the particle emitter.
    {
      const faucetLength = this.m_particleSystem.GetRadius() * 2.0 * Faucet.k_faucetLength;
      this.m_emitter.SetParticleSystem(this.m_particleSystem);
      this.m_emitter.SetCallback(this.m_lifetimeRandomizer);
      this.m_emitter.SetPosition(
        new b2Vec2(
          Faucet.k_containerWidth * Faucet.k_faucetWidth,
          Faucet.k_containerHeight * Faucet.k_faucetHeight + faucetLength * 0.5,
        ),
      );
      this.m_emitter.SetVelocity(new b2Vec2(0.0, 0.0));
      this.m_emitter.SetSize(new b2Vec2(0.0, faucetLength));
      this.m_emitter.SetColor(new b2Color(1, 1, 1, 1));
      this.m_emitter.SetEmitRate(120.0);
      this.m_emitter.SetParticleFlags(Test.GetParticleParameterValue());
    }

    // Don't restart the test when changing particle types.
    Test.SetRestartOnParticleParameterChange(false);
    // Limit the set of particle types.
    Test.SetParticleParameters(Faucet.k_paramDef, Faucet.k_paramDefCount);
  }

  public Step(settings: Settings): void {
    let dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;

    if (settings.pause && !settings.singleStep) {
      dt = 0.0;
    }

    super.Step(settings);
    this.m_particleColorOffset += dt;
    // Keep m_particleColorOffset in the range 0.0f..k_ParticleColorsCount.
    if (this.m_particleColorOffset >= Test.k_ParticleColorsCount) {
      this.m_particleColorOffset -= Test.k_ParticleColorsCount;
    }

    // Propagate the currently selected particle flags.
    this.m_emitter.SetParticleFlags(Test.GetParticleParameterValue());

    // If this is a color mixing particle, add some color.
    ///  b2Color color(1, 1, 1, 1);
    if (this.m_emitter.GetParticleFlags() & b2ParticleFlag.b2_colorMixingParticle) {
      // Each second, select a different color.
      this.m_emitter.SetColor(
        Test.k_ParticleColors[Math.floor(this.m_particleColorOffset) % Test.k_ParticleColorsCount],
      );
    } else {
      this.m_emitter.SetColor(new b2Color(1, 1, 1, 1));
    }

    // Create the particles.
    this.m_emitter.Step(dt);

    const k_keys = [
      'Keys: (w) water, (q) powder',
      '      (t) tensile, (v) viscous',
      '      (c) color mixing, (s) static pressure',
      '      (+) increase flow, (-) decrease flow',
    ];
    for (let i = 0; i < k_keys.length; ++i) {
      g_debugDraw.DrawString(5, this.m_textLine, k_keys[i]);
      this.m_textLine += DRAW_STRING_NEW_LINE;
    }
  }

  public Keyboard(key: string): void {
    let parameter = 0;
    switch (key) {
      case 'w':
        parameter = b2ParticleFlag.b2_waterParticle;
        break;
      case 'q':
        parameter = b2ParticleFlag.b2_powderParticle;
        break;
      case 't':
        parameter = b2ParticleFlag.b2_tensileParticle;
        break;
      case 'v':
        parameter = b2ParticleFlag.b2_viscousParticle;
        break;
      case 'c':
        parameter = b2ParticleFlag.b2_colorMixingParticle;
        break;
      case 's':
        parameter = b2ParticleFlag.b2_staticPressureParticle;
        break;
      case '=':
        ///if (this.m_shift)
        {
          let emitRate = this.m_emitter.GetEmitRate();
          emitRate *= Faucet.k_emitRateChangeFactor;
          emitRate = b2Max(emitRate, Faucet.k_emitRateMin);
          this.m_emitter.SetEmitRate(emitRate);
        }
        break;
      case '-':
        ///if (!this.shift)
        {
          let emitRate = this.m_emitter.GetEmitRate();
          emitRate *= 1.0 / Faucet.k_emitRateChangeFactor;
          emitRate = b2Min(emitRate, Faucet.k_emitRateMax);
          this.m_emitter.SetEmitRate(emitRate);
        }
        break;
      default:
        // Nothing.
        return;
    }
    Test.SetParticleParameterValue(parameter);
  }

  public GetDefaultViewZoom(): number {
    return 0.1;
  }

  /**
   * Create the faucet test.
   */
  public static Create(): Faucet {
    return new Faucet();
  }
}

// #endif
