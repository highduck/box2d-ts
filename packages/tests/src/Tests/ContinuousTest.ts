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

import {
    b2_gjkStats,
    b2_toiStats,
    b2Body,
    b2BodyDef,
    b2BodyType,
    b2EdgeShape,
    b2PolygonShape,
    b2RandomRange,
    b2Vec2
} from "@highduck/box2d";
import {DRAW_STRING_NEW_LINE, g_debugDraw, Settings, Test} from "@highduck/box2d-testbed";

export class ContinuousTest extends Test {
    public m_body: b2Body;
    public m_angularVelocity = 0.0;

    constructor() {
        super();

        {
            const bd = new b2BodyDef();
            bd.position.Set(0.0, 0.0);
            const body = this.m_world.CreateBody(bd);

            const edge = new b2EdgeShape();

            edge.Set(new b2Vec2(-10.0, 0.0), new b2Vec2(10.0, 0.0));
            body.CreateFixture(edge, 0.0);

            const shape = new b2PolygonShape();
            shape.SetAsBox(0.2, 1.0, new b2Vec2(0.5, 1.0), 0.0);
            body.CreateFixture(shape, 0.0);
        }

        {
            const bd = new b2BodyDef();
            bd.type = b2BodyType.b2_dynamicBody;
            bd.position.Set(0.0, 20.0);
            //bd.angle = 0.1;

            const shape = new b2PolygonShape();
            shape.SetAsBox(2.0, 0.1);

            this.m_body = this.m_world.CreateBody(bd);
            this.m_body.CreateFixture(shape, 1.0);

            this.m_angularVelocity = b2RandomRange(-50.0, 50.0);
            //this.m_angularVelocity = 46.661274;
            this.m_body.SetLinearVelocity(new b2Vec2(0.0, -100.0));
            this.m_body.SetAngularVelocity(this.m_angularVelocity);
        }
        /*
        else
        {
          const bd = new b2BodyDef();
          bd.type = b2BodyType.b2_dynamicBody;
          bd.position.Set(0.0, 2.0);
          const body = this.m_world.CreateBody(bd);
          const shape = new b2CircleShape();
          shape.m_p.SetZero();
          shape.m_radius = 0.5;
          body.CreateFixture(shape, 1.0);
          bd.bullet = true;
          bd.position.Set(0.0, 10.0);
          body = this.m_world.CreateBody(bd);
          body.CreateFixture(shape, 1.0);
          body.SetLinearVelocity(new b2Vec2(0.0, -100.0));
        }
        */

        b2_gjkStats.Reset();
        b2_toiStats.Reset();
    }

    public Launch() {
        b2_gjkStats.Reset();
        b2_toiStats.Reset();

        this.m_body.SetTransformVec(new b2Vec2(0.0, 20.0), 0.0);
        this.m_angularVelocity = b2RandomRange(-50.0, 50.0);
        this.m_body.SetLinearVelocity(new b2Vec2(0.0, -100.0));
        this.m_body.SetAngularVelocity(this.m_angularVelocity);
    }

    public Step(settings: Settings): void {
        super.Step(settings);

        if (b2_gjkStats.calls > 0) {
            // g_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
            g_debugDraw.DrawString(5, this.m_textLine, `gjk calls = ${b2_gjkStats.calls.toFixed(0)}, ave gjk iters = ${(b2_gjkStats.iters / b2_gjkStats.calls).toFixed(1)}, max gjk iters = ${b2_gjkStats.maxIters.toFixed(0)}`);
            this.m_textLine += DRAW_STRING_NEW_LINE;
        }

        if (b2_toiStats.calls > 0) {
            // g_debugDraw.DrawString(5, this.m_textLine, "toi [max] calls = %d, ave toi iters = %3.1f [%d]",
            g_debugDraw.DrawString(5, this.m_textLine, `toi [max] calls = ${b2_toiStats.calls}, ave toi iters = ${(b2_toiStats.iters / b2_toiStats.calls).toFixed(1)} [${b2_toiStats.maxRootIters}]`);
            this.m_textLine += DRAW_STRING_NEW_LINE;

            // g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi root iters = %3.1f [%d]",
            g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi root iters = ${(b2_toiStats.rootIters / b2_toiStats.calls).toFixed(1)} [${b2_toiStats.maxRootIters.toFixed(0)}]`);
            this.m_textLine += DRAW_STRING_NEW_LINE;

            // g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi time = %.1f [%.1f] (microseconds)",
            g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi time = ${(1000.0 * b2_toiStats.time / b2_toiStats.calls).toFixed(1)} [${(1000.0 * b2_toiStats.maxTime).toFixed(1)}] (microseconds)`);
            this.m_textLine += DRAW_STRING_NEW_LINE;
        }

        if (this.m_stepCount % 60 === 0) {
            this.Launch();
        }
    }

    public static Create(): Test {
        return new ContinuousTest();
    }
}
