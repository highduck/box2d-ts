/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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
import * as box2d from "@box2d";
// This is a simple example of building and running a simulation
// using Box2D. Here we create a large ground box and a small dynamic
// box.
// There are no graphics for this example. Box2D is meant to be used
// with your rendering engine in your game engine.
export function main() {
    // Define the gravity vector.
    const gravity = new box2d.b2Vec2(0, -10);
    // Construct a world object, which will hold and simulate the rigid bodies.
    const world = new box2d.b2World(gravity);
    // Define the ground body.
    const groundBodyDef = new box2d.b2BodyDef();
    groundBodyDef.position.Set(0, -10);
    // Call the body factory which allocates memory for the ground body
    // from a pool and creates the ground box shape (also from a pool).
    // The body is also added to the world.
    const groundBody = world.CreateBody(groundBodyDef);
    // Define the ground box shape.
    const groundBox = new box2d.b2PolygonShape();
    // The extents are the half-widths of the box.
    groundBox.SetAsBox(50, 10);
    // Add the ground fixture to the ground body.
    groundBody.CreateFixture(groundBox, 0);
    // Define the dynamic body. We set its position and call the body factory.
    const bodyDef = new box2d.b2BodyDef();
    bodyDef.type = 2 /* b2_dynamicBody */;
    bodyDef.position.Set(0, 4);
    const body = world.CreateBody(bodyDef);
    // Define another box shape for our dynamic body.
    const dynamicBox = new box2d.b2PolygonShape();
    dynamicBox.SetAsBox(1, 1);
    // Define the dynamic body fixture.
    const fixtureDef = new box2d.b2FixtureDef();
    fixtureDef.shape = dynamicBox;
    // Set the box density to be non-zero, so it will be dynamic.
    fixtureDef.density = 1;
    // Override the default friction.
    fixtureDef.friction = 0.3;
    // Add the shape to the body.
    const fixture = body.CreateFixture(fixtureDef);
    // Prepare for simulation. Typically we use a time step of 1/60 of a
    // second (60Hz) and 10 iterations. This provides a high quality simulation
    // in most game scenarios.
    const timeStep = 1 / 60;
    const velocityIterations = 6;
    const positionIterations = 2;
    // This is our little game loop.
    for (let i = 0; i < 60; ++i) {
        // Instruct the world to perform a single step of simulation.
        // It is generally best to keep the time step and iterations fixed.
        world.Step(timeStep, velocityIterations, positionIterations);
        // Now print the position and angle of the body.
        const position = body.GetPosition();
        const angle = body.GetAngle();
        console.log(position.x.toFixed(2), position.y.toFixed(2), angle.toFixed(2));
    }
    // When the world destructor is called, all bodies and joints are freed. This can
    // create orphaned pointers, so be careful about your world management.
    body.DestroyFixture(fixture);
    world.DestroyBody(body);
    return 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVsbG9Xb3JsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhlbGxvV29ybGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7QUFFRixPQUFPLEtBQUssS0FBSyxNQUFNLFFBQVEsQ0FBQztBQUVoQyxnRUFBZ0U7QUFDaEUscUVBQXFFO0FBQ3JFLE9BQU87QUFDUCxvRUFBb0U7QUFDcEUsa0RBQWtEO0FBQ2xELE1BQU0sVUFBVSxJQUFJO0lBQ2xCLDZCQUE2QjtJQUM3QixNQUFNLE9BQU8sR0FBaUIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXZELDJFQUEyRTtJQUMzRSxNQUFNLEtBQUssR0FBa0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXhELDBCQUEwQjtJQUMxQixNQUFNLGFBQWEsR0FBb0IsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDN0QsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbkMsbUVBQW1FO0lBQ25FLG1FQUFtRTtJQUNuRSx1Q0FBdUM7SUFDdkMsTUFBTSxVQUFVLEdBQWlCLEtBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFakUsK0JBQStCO0lBQy9CLE1BQU0sU0FBUyxHQUF5QixJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUVuRSw4Q0FBOEM7SUFDOUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0IsNkNBQTZDO0lBQzdDLFVBQVUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXZDLDBFQUEwRTtJQUMxRSxNQUFNLE9BQU8sR0FBb0IsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkQsT0FBTyxDQUFDLElBQUkseUJBQWtDLENBQUM7SUFDL0MsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sSUFBSSxHQUFpQixLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXJELGlEQUFpRDtJQUNqRCxNQUFNLFVBQVUsR0FBeUIsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDcEUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFMUIsbUNBQW1DO0lBQ25DLE1BQU0sVUFBVSxHQUF1QixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoRSxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztJQUU5Qiw2REFBNkQ7SUFDN0QsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFFdkIsaUNBQWlDO0lBQ2pDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBRTFCLDZCQUE2QjtJQUM3QixNQUFNLE9BQU8sR0FBb0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVoRSxvRUFBb0U7SUFDcEUsMkVBQTJFO0lBQzNFLDBCQUEwQjtJQUMxQixNQUFNLFFBQVEsR0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sa0JBQWtCLEdBQVcsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sa0JBQWtCLEdBQVcsQ0FBQyxDQUFDO0lBRXJDLGdDQUFnQztJQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ25DLDZEQUE2RDtRQUM3RCxtRUFBbUU7UUFDbkUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUU3RCxnREFBZ0Q7UUFDaEQsTUFBTSxRQUFRLEdBQWlCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRCxNQUFNLEtBQUssR0FBVyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0U7SUFFRCxpRkFBaUY7SUFDakYsdUVBQXVFO0lBRXZFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFN0IsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV4QixPQUFPLENBQUMsQ0FBQztBQUNYLENBQUMifQ==