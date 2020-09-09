/*
 * Copyright (c) 2006-2012 Erin Catto http://www.org
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
  b2BodyDef,
  b2BodyType,
  b2CircleShape,
  b2ParticleFlag,
  b2ParticleGroupDef,
  b2PolygonShape,
  b2Vec2,
} from '@highduck/box2d';
import { Test } from '@highduck/box2d-testbed';

export class ParticlesSurfaceTension extends Test {
  constructor() {
    super(); // base class constructor

    {
      const bd = new b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-4, -1),
          new b2Vec2(4, -1),
          new b2Vec2(4, 0),
          new b2Vec2(-4, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-4, -0.1),
          new b2Vec2(-2, -0.1),
          new b2Vec2(-2, 2),
          new b2Vec2(-4, 2),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(2, -0.1),
          new b2Vec2(4, -0.1),
          new b2Vec2(4, 2),
          new b2Vec2(2, 2),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }

    this.m_particleSystem.SetRadius(0.035 * 2); // HACK: increase particle radius

    {
      const shape = new b2CircleShape();
      shape.m_p.Set(0, 2);
      shape.m_radius = 0.5;
      const pd = new b2ParticleGroupDef();
      pd.flags = b2ParticleFlag.b2_tensileParticle | b2ParticleFlag.b2_colorMixingParticle;
      pd.shape = shape;
      pd.color.Set(1, 0, 0, 1);
      this.m_particleSystem.CreateParticleGroup(pd);
    }

    {
      const shape = new b2CircleShape();
      shape.m_p.Set(-1, 2);
      shape.m_radius = 0.5;
      const pd = new b2ParticleGroupDef();
      pd.flags = b2ParticleFlag.b2_tensileParticle | b2ParticleFlag.b2_colorMixingParticle;
      pd.shape = shape;
      pd.color.Set(0, 1, 0, 1);
      this.m_particleSystem.CreateParticleGroup(pd);
    }

    {
      const shape = new b2PolygonShape();
      const vertices = [new b2Vec2(0, 3), new b2Vec2(2, 3), new b2Vec2(2, 3.5), new b2Vec2(0, 3.5)];
      shape.Set(vertices, 4);
      const pd = new b2ParticleGroupDef();
      pd.flags = b2ParticleFlag.b2_tensileParticle | b2ParticleFlag.b2_colorMixingParticle;
      pd.shape = shape;
      pd.color.Set(0, 0, 1, 1);
      this.m_particleSystem.CreateParticleGroup(pd);
    }

    {
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      const body = this.m_world.CreateBody(bd);
      const shape = new b2CircleShape();
      shape.m_p.Set(0, 8);
      shape.m_radius = 0.5;
      body.CreateFixture(shape, 0.5);
    }
  }

  public GetDefaultViewZoom() {
    return 0.1;
  }

  public static Create() {
    return new ParticlesSurfaceTension();
  }
}

// #endif
