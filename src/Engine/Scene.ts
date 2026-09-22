import { GameObject } from "./GameObject"
import { CollisionDetection } from "./middleware/CollisionDetection"

export enum ObjectGroup{
    STATIC = "STATIC",
    MOVING = "MOVING"
}

type Collision = {
    A: GameObject,
    B: GameObject
}


type Delete = {
    obj: GameObject,
    type: ObjectGroup
}
export class Scene{
    private _statics: GameObject[] = []
    private _moving: GameObject[] = []
    private _collisions: Collision[] = []
    private _toDelete: Delete[] = []


    add(obj:GameObject, type: ObjectGroup) {
        if (type === ObjectGroup.STATIC) {
            this._statics.push(obj);
        } else {
            this._moving.push(obj);
        }
    }

    size() {
        return this._statics.length + this._moving.length;
    }

    update():void{
        this._statics.forEach(obj => obj.update());
        this._moving.forEach(obj => obj.update());

        this.processDeleted();
    }

    draw(context: CanvasRenderingContext2D) {
        this._statics.forEach(obj => obj.draw(context));
        this._moving.forEach(obj => obj.draw(context));
    }

    public collisionDetection():void{
        this._collisions = []
        if(this._moving.length >= 2){
            for (let i = 0; i < this._moving.length - 1; i++) {
                for (let j = i + 1; j < this._moving.length; j++) {
                    const objA = this._moving[i]
                    const objB = this._moving[j]
                    if (CollisionDetection.collision(objA.bbox, objB.bbox)) {
                        this._collisions.push({ A: objA, B: objB });
                    }
                }
            }
        }


        this._moving.forEach(obj => {
            this._statics.forEach(staticObj => {
                if (CollisionDetection.collision(obj.bbox, staticObj.bbox)) {
                    this._collisions.push({ A: obj, B: staticObj });
                }
            });
        });


        if (this._collisions.length > 0) {
            this._collisions.forEach( ({A,B}) => {
                A.onCollision(B);
                B.onCollision(A);
            });
        }
    
    }

    remove(objToRemove: GameObject, type: ObjectGroup) {
        if (type === ObjectGroup.STATIC) {
            this._statics = this._statics.filter(object => objToRemove !== object)
        } else {
            this._moving = this._moving.filter(object => objToRemove !== object)
        }
    }

    delete(objToDelete: GameObject, type: ObjectGroup) {
        this._toDelete.push({ obj:objToDelete, type: type });
    }


    private processDeleted(){
        this._toDelete.forEach(({ obj, type }) => {
            if (type === ObjectGroup.STATIC) {
                this._statics = this._statics.filter(object => obj !== object)
            } else {
                this._moving = this._moving.filter(object => obj !== object)
            }
        });
        this._toDelete = [];
    }
}