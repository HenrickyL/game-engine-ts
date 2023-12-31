import { Geometry } from "./Geometry";
import { Movable } from "./middleware/Movable"
import { Position } from "./middleware/Position";
import { Vector } from "./middleware/Vector";

export abstract class GameObject extends Movable{
    private _bbox: Geometry //colisao 
    constructor(position: Position, bbox: Geometry){
        super(position)
        this._bbox = bbox
    }

    get bbox(): Geometry{
        return this._bbox
    }

    abstract update(): void
    abstract onCollision(obj: GameObject): void

    draw(context: CanvasRenderingContext2D): void{
        this._bbox.draw(context)
    }

    moveTo(position:Position):void{
        super.moveTo(position)
        this.bbox.moveTo(position)
    }
    
    translateTo(delta: Vector): void{
        super.translateTo(delta)
        this.bbox.translateTo(delta)
    }


    get left(): number {
        return this._bbox.left
    }
    get right(): number {
        return this._bbox.right
    }
    get top(): number {
        return this._bbox.top
    }
    get bottom(): number {
        return this._bbox.bottom
    }

}