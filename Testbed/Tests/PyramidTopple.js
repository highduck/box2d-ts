System.register(["@box2d", "../Testbed.js"], function (exports_1, context_1) {
    "use strict";
    var box2d, testbed, PyramidTopple;
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
            PyramidTopple = class PyramidTopple extends testbed.Test {
                constructor() {
                    super();
                    const WIDTH = 4;
                    const HEIGHT = 30;
                    const add_domino = (world, pos, flipped) => {
                        const mass = 1;
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        bd.position.Copy(pos);
                        const body = world.CreateBody(bd);
                        const shape = new box2d.b2PolygonShape();
                        if (flipped) {
                            shape.SetAsBox(0.5 * HEIGHT, 0.5 * WIDTH);
                        }
                        else {
                            shape.SetAsBox(0.5 * WIDTH, 0.5 * HEIGHT);
                        }
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        fd.density = mass / (WIDTH * HEIGHT);
                        fd.friction = 0.6;
                        fd.restitution = 0.0;
                        body.CreateFixture(fd);
                    };
                    const world = this.m_world;
                    ///settings.positionIterations = 30; // cpSpaceSetIterations(space, 30);
                    ///world.SetGravity(new box2d.b2Vec2(0, -300)); // cpSpaceSetGravity(space, cpv(0, -300));
                    ///box2d.b2_timeToSleep = 0.5; // cpSpaceSetSleepTimeThreshold(space, 0.5f);
                    ///box2d.b2_linearSlop = 0.5; // cpSpaceSetCollisionSlop(space, 0.5f);
                    // Add a floor.
                    const bd = new box2d.b2BodyDef();
                    const body = world.CreateBody(bd);
                    const shape = new box2d.b2EdgeShape();
                    shape.Set(new box2d.b2Vec2(-600, -240), new box2d.b2Vec2(600, -240));
                    const fd = new box2d.b2FixtureDef();
                    fd.shape = shape;
                    fd.friction = 1.0;
                    fd.restitution = 1.0;
                    body.CreateFixture(fd);
                    // Add the dominoes.
                    const n = 12;
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < (n - i); j++) {
                            const offset = new box2d.b2Vec2((j - (n - 1 - i) * 0.5) * 1.5 * HEIGHT, (i + 0.5) * (HEIGHT + 2 * WIDTH) - WIDTH - 240);
                            add_domino(world, offset, false);
                            add_domino(world, box2d.b2Vec2.AddVV(offset, new box2d.b2Vec2(0, (HEIGHT + WIDTH) / 2), new box2d.b2Vec2()), true);
                            if (j === 0) {
                                add_domino(world, box2d.b2Vec2.AddVV(offset, new box2d.b2Vec2(0.5 * (WIDTH - HEIGHT), HEIGHT + WIDTH), new box2d.b2Vec2()), false);
                            }
                            if (j !== n - i - 1) {
                                add_domino(world, box2d.b2Vec2.AddVV(offset, new box2d.b2Vec2(HEIGHT * 0.75, (HEIGHT + 3 * WIDTH) / 2), new box2d.b2Vec2()), true);
                            }
                            else {
                                add_domino(world, box2d.b2Vec2.AddVV(offset, new box2d.b2Vec2(0.5 * (HEIGHT - WIDTH), HEIGHT + WIDTH), new box2d.b2Vec2()), false);
                            }
                        }
                    }
                }
                GetDefaultViewZoom() {
                    return 10.0;
                }
                static Create() {
                    return new PyramidTopple();
                }
            };
            exports_1("PyramidTopple", PyramidTopple);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHlyYW1pZFRvcHBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlB5cmFtaWRUb3BwbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7WUFHQSxnQkFBQSxNQUFhLGFBQWMsU0FBUSxPQUFPLENBQUMsSUFBSTtnQkFDN0M7b0JBQ0UsS0FBSyxFQUFFLENBQUM7b0JBRVIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7b0JBRWxCLE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBb0IsRUFBRSxHQUFpQixFQUFFLE9BQWdCLEVBQUUsRUFBRTt3QkFDL0UsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dCQUVmLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxFQUFFLENBQUMsSUFBSSx5QkFBa0MsQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3RCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRWxDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLE9BQU8sRUFBRTs0QkFDWCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO3lCQUMzQzs2QkFBTTs0QkFDTCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDO3lCQUMzQzt3QkFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDcEMsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7d0JBQ2pCLEVBQUUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDO3dCQUNyQyxFQUFFLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQzt3QkFDbEIsRUFBRSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7d0JBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLENBQUMsQ0FBQztvQkFFRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO29CQUMzQix3RUFBd0U7b0JBQ3hFLDBGQUEwRjtvQkFDMUYsNEVBQTRFO29CQUM1RSxzRUFBc0U7b0JBRXRFLGVBQWU7b0JBQ2YsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2pDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQ2pCLEVBQUUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO29CQUNsQixFQUFFLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztvQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFdkIsb0JBQW9CO29CQUNwQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQzs0QkFDeEgsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQ2pDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFFbkgsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dDQUNYLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7NkJBQ3BJOzRCQUVELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dDQUNuQixVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs2QkFDcEk7aUNBQU07Z0NBQ0wsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs2QkFDcEk7eUJBQ0Y7cUJBQ0Y7Z0JBQ0gsQ0FBQztnQkFFTSxrQkFBa0I7b0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRU0sTUFBTSxDQUFDLE1BQU07b0JBQ2xCLE9BQU8sSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQzthQUNGLENBQUEifQ==