import { GameObject } from "../Engine/GameObject";
import { Rect } from "../Engine/Geometry";
import { Input } from "../Engine/Input";
import { InputKeys } from "../Engine/enums";
import { Position } from "../Engine/middleware/Position";
import { Vector } from "../Engine/middleware/Vector";

export class Player extends GameObject{
    constructor(position: Position){
        super(position, new Rect(position, 200,30))
        this.speed = Vector.Zero
        this.speedMag = 10
    }
    
    update(): void {
        this.handleInput()
    }
    onCollision(_obj: GameObject): void {
        
    }

    private handleInput():void{
        if(Input.keyDown(InputKeys.A)){
            this.speed = Vector.Left
            if(this.left >=0 )
                this.translateTo(this.speedFinal)
        }else if(Input.keyDown(InputKeys.D)){
            this.speed = Vector.Right
            if(this.right <= 800)
                this.translateTo(this.speedFinal)
        }
    }

}