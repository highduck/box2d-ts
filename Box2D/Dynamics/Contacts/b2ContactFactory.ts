// DEBUG: import { b2Assert } from "../../Common/b2Settings.js";
import { b2ShapeType } from "../../Collision/Shapes/b2Shape.js";
import { b2Contact } from "./b2Contact.js";
import { b2Fixture } from "../b2Fixture.js";

export class b2ContactFactory {
  public readonly m_registers: number[] = [];
    pool: b2Contact[] = [];

  constructor() {
    this.InitializeRegisters();
  }

  private createFromPool() {
      return this.pool.pop() ?? new b2Contact();
  }

    private destroyToPool(contact: b2Contact): void {
        this.pool.push(contact);
    }

  private AddType(typeA: b2ShapeType, typeB: b2ShapeType): void {
    this.m_registers[(typeA << 2) | typeB] = 2;
    if (typeA !== typeB) {
      this.m_registers[(typeB << 2) | typeA] = 1;
    }
  }

  private InitializeRegisters(): void {
    for (let i = 0; i < b2ShapeType.e_shapeTypeCount; ++i) {
      for (let j = 0; j < b2ShapeType.e_shapeTypeCount; ++j) {
        this.m_registers[(i << 2) | j] = 0;
      }
    }

    this.AddType(b2ShapeType.e_circleShape,  b2ShapeType.e_circleShape);
    this.AddType(b2ShapeType.e_polygonShape, b2ShapeType.e_circleShape);
    this.AddType(b2ShapeType.e_polygonShape, b2ShapeType.e_polygonShape);
    this.AddType(b2ShapeType.e_edgeShape,    b2ShapeType.e_circleShape);
    this.AddType(b2ShapeType.e_edgeShape,    b2ShapeType.e_polygonShape);
    this.AddType(b2ShapeType.e_chainShape,   b2ShapeType.e_circleShape);
    this.AddType(b2ShapeType.e_chainShape,   b2ShapeType.e_polygonShape);
  }

  public Create(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): b2Contact | null {
    const typeA: b2ShapeType = fixtureA.GetType();
    const typeB: b2ShapeType = fixtureB.GetType();

    // DEBUG: b2Assert(0 <= typeA && typeA < b2ShapeType.e_shapeTypeCount);
    // DEBUG: b2Assert(0 <= typeB && typeB < b2ShapeType.e_shapeTypeCount);

    const reg = this.m_registers[(typeA << 2) | typeB];

    if(reg === 0) {
        return null;
    }
      const c = this.createFromPool();
      if (reg === 2) {
        c.Reset(fixtureA, indexA, fixtureB, indexB);
      } else if(reg === 1) {
        c.Reset(fixtureB, indexB, fixtureA, indexA);
      }

      return c;
  }

  public Destroy(contact: b2Contact): void {
    // const typeA: b2ShapeType = contact.m_fixtureA.GetType();
    // const typeB: b2ShapeType = contact.m_fixtureB.GetType();

    // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);
    // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);

      this.destroyToPool(contact);
  }
}
