import { Vector } from "./Vector"
export interface IPosition{
    x: number
    y: number
}
export class Position implements IPosition{

    constructor(private _x: number =0, private _y: number =0){}

    get x():number{
        return this._x
    }
    get y():number{
        return this._y
    }

    set x(xx: number){
        this._x = xx
    }
    set y(yy:number){
        this._y = yy
    }

    get info(): string{
        return `(x: ${this.x}, y: ${this.y})`
    }

    static centerTo(p1: Position, p2: Position): Position{
        const dx = (p2.x - p1.x)
        const dy = (p2.y - p1.y)
        return new Position(p1.x+dx/2, p1.y+dy/2) 
    }

    distanceTo(other: Position): number{
        const dx = other.x - this.x
        const dy = other.y - this.y
        return Math.sqrt(dx*dx + dy*dy)
    }

    copy(): Position{
        return new Position(this.x, this.y)
    }

    equal(other:Position):boolean{
        return this._x === other._x && this._y === other._y
    }
    
    
    public moveTo(position: Position):void{
        this.x = position.x
        this.y = position.y
    }

    public moveToPos(position: IPosition):void{
        this.x = position.x
        this.y = position.y
    }

    public translateTo(delta: Vector){
        this.x += delta.x
        this.y += delta.y
    }


    static get Default():Position{
        return new Position()
    }

}