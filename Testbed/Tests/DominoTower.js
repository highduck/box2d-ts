System.register(["@box2d", "../Testbed.js"], function (exports_1, context_1) {
    "use strict";
    var box2d, testbed, DominoTower;
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
            DominoTower = class DominoTower extends testbed.Test {
                constructor() {
                    super();
                    const DOMINO_WIDTH = .2;
                    const DOMINO_FRICTION = 0.1;
                    const DOMINO_HEIGHT = 1.0;
                    const BASE_COUNT = 25;
                    /**
                     * The density of the dominos under construction. Varies for
                     * different parts of the tower.
                     */
                    let dominoDensity;
                    function makeDomino(x, y, horizontal) {
                        const sd = new box2d.b2PolygonShape();
                        sd.SetAsBox(0.5 * DOMINO_WIDTH, 0.5 * DOMINO_HEIGHT);
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = sd;
                        fd.density = dominoDensity;
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        fd.friction = DOMINO_FRICTION;
                        fd.restitution = 0.65;
                        bd.position.Set(x, y);
                        bd.angle = horizontal ? (Math.PI / 2.0) : 0;
                        const myBody = world.CreateBody(bd);
                        myBody.CreateFixture(fd);
                    }
                    const gravity = new box2d.b2Vec2(0, -10);
                    //world = new box2d.b2World(gravity);
                    const world = this.m_world;
                    world.SetGravity(gravity);
                    // Create the floor
                    {
                        const sd = new box2d.b2PolygonShape();
                        sd.SetAsBox(50, 10);
                        const bd = new box2d.b2BodyDef();
                        bd.position.Set(0, -10);
                        const body = world.CreateBody(bd);
                        body.CreateFixture(sd, 0);
                    }
                    {
                        dominoDensity = 10;
                        // Make bullet
                        const sd = new box2d.b2PolygonShape();
                        sd.SetAsBox(.7, .7);
                        const fd = new box2d.b2FixtureDef();
                        fd.density = 35.0;
                        const bd = new box2d.b2BodyDef();
                        bd.type = 2 /* b2_dynamicBody */;
                        fd.shape = sd;
                        fd.friction = 0.0;
                        fd.restitution = 0.85;
                        bd.bullet = true;
                        bd.position.Set(30.0, 5.00);
                        let b = world.CreateBody(bd);
                        b.CreateFixture(fd);
                        b.SetLinearVelocity(new box2d.b2Vec2(-25.0, -25.0));
                        b.SetAngularVelocity(6.7);
                        fd.density = 25.0;
                        bd.position.Set(-30.0, 25.0);
                        b = world.CreateBody(bd);
                        b.CreateFixture(fd);
                        b.SetLinearVelocity(new box2d.b2Vec2(35.0, -10.0));
                        b.SetAngularVelocity(-8.3);
                    }
                    {
                        let currX;
                        // Make base
                        for (let i = 0; i < BASE_COUNT; ++i) {
                            currX = i * 1.5 * DOMINO_HEIGHT - (1.5 * DOMINO_HEIGHT * BASE_COUNT / 2);
                            makeDomino(currX, DOMINO_HEIGHT / 2.0, false);
                            makeDomino(currX, DOMINO_HEIGHT + DOMINO_WIDTH / 2.0, true);
                        }
                        currX = BASE_COUNT * 1.5 * DOMINO_HEIGHT - (1.5 * DOMINO_HEIGHT * BASE_COUNT / 2);
                        // Make 'I's
                        for (let j = 1; j < BASE_COUNT; ++j) {
                            if (j > 3) {
                                dominoDensity *= .8;
                            }
                            // The y at the center of the I structure.
                            const currY = DOMINO_HEIGHT * 0.5 + (DOMINO_HEIGHT + 2 * DOMINO_WIDTH) * .99 * j;
                            for (let i = 0; i < BASE_COUNT - j; ++i) {
                                currX = i * 1.5 * DOMINO_HEIGHT - (1.5 * DOMINO_HEIGHT * (BASE_COUNT - j) / 2);
                                dominoDensity *= 2.5;
                                if (i === 0) {
                                    makeDomino(currX - (1.25 * DOMINO_HEIGHT) + .5 * DOMINO_WIDTH, currY - DOMINO_WIDTH, false);
                                }
                                if (i === BASE_COUNT - j - 1) {
                                    makeDomino(currX + (1.25 * DOMINO_HEIGHT) - .5 * DOMINO_WIDTH, currY - DOMINO_WIDTH, false);
                                }
                                dominoDensity /= 2.5;
                                makeDomino(currX, currY, false);
                                makeDomino(currX, currY + .5 * (DOMINO_WIDTH + DOMINO_HEIGHT), true);
                                makeDomino(currX, currY - .5 * (DOMINO_WIDTH + DOMINO_HEIGHT), true);
                            }
                        }
                    }
                }
                static Create() {
                    return new DominoTower();
                }
            };
            exports_1("DominoTower", DominoTower);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9taW5vVG93ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEb21pbm9Ub3dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztZQUdBLGNBQUEsTUFBYSxXQUFZLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBQzNDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUVSLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztvQkFDeEIsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDO29CQUM1QixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7b0JBQzFCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztvQkFFdEI7Ozt1QkFHRztvQkFDSCxJQUFJLGFBQXFCLENBQUM7b0JBRTFCLFNBQVMsVUFBVSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsVUFBbUI7d0JBQzNELE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN0QyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxZQUFZLEVBQUUsR0FBRyxHQUFHLGFBQWEsQ0FBQyxDQUFDO3dCQUNyRCxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDcEMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ2QsRUFBRSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7d0JBQzNCLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxFQUFFLENBQUMsSUFBSSx5QkFBa0MsQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUM7d0JBQzlCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO3dCQUN0QixFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsVUFB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