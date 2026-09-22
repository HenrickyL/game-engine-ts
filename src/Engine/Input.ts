import {InputKeys } from './enums'
import { Position } from './middleware/Position';

//singleton
export class Input{
    private static _instance: Input | null = null
    private static _keys: {[key in InputKeys]: boolean };
    private static _ctrl: {[key in InputKeys]: boolean };
    private static _canvas: HTMLCanvasElement
    private static _offsetX: number =0
    private static _offsetY: number =0

    private static _onMouseClick : boolean = false
    private static _mousePosition: Position = Position.Zero
    private static _mouseClickPosition: Position = Position.Zero
    private static _mouseClickUpPosition: Position = Position.Zero
    private static _mouseWheel: number = 0
    private static _lastMouseWheelTime: number = 0
    private static _onPositiveWheel : boolean = false

    private static _dragX: number =0
    private static _dragY: number =0
    private static _dragElapse: number = 5


    private constructor(){
        Input._keys = Object.keys(InputKeys).reduce((acc, key) => {
            acc[key as InputKeys] = false;
            return acc;
          }, {} as { [key in InputKeys]: boolean });

        Input._ctrl = Object.keys(InputKeys).reduce((acc, key) => {
            acc[key as InputKeys] = false;
            return acc;
         }, {} as { [key in InputKeys]: boolean });

        this.eventHandle()
    }

    private eventHandle(): void{
        document.addEventListener('keydown', this.onKeyDown.bind(this))
        document.addEventListener('keyup', this.onKeyUp.bind(this))
        Input._canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
        Input._canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
        document.addEventListener('mouseup', this.onMouseUp.bind(this))
        Input._canvas.addEventListener('wheel', this.onMouseWheel.bind(this))
    }
    private onKeyDown(event: KeyboardEvent):void{
        const key = event.code as InputKeys;
        Input._keys[key] = true
    }

    private onMouseMove(event: MouseEvent){
        const mouseX = event.clientX - Input._offsetX
        const mouseY = event.clientY - Input._offsetY
        Input._mousePosition.x = mouseX
        Input._mousePosition.y = mouseY
    }

    private onMouseDown(event : MouseEvent){
        const mouseX = event.clientX - Input._offsetX
        const mouseY = event.clientY - Input._offsetY
        Input._mouseClickPosition.x = mouseX
        Input._mouseClickPosition.y = mouseY
        Input._mouseClickUpPosition.x = -1
        Input._mouseClickUpPosition.y = -1
        Input._onMouseClick = true
    }

    private onMouseUp(event : MouseEvent){
        const mouseX = event.clientX - Input._offsetX
        const mouseY = event.clientY - Input._offsetY
        Input._mouseClickPosition.x = -1
        Input._mouseClickPosition.y = -1

        Input._mouseClickUpPosition.x = mouseX
        Input._mouseClickUpPosition.y = mouseY
        Input._onMouseClick = false
        // Input._dragX = 0
        // Input._dragY = 0
    }

    private static onElapsed(lastTime:number, elapseTime: number):boolean{
        const currentTime = performance.now() 
        const elapsed = currentTime - lastTime

        return elapsed > elapseTime
    }
    private onMouseWheel(event: WheelEvent){
        if(Input.onElapsed(Input._lastMouseWheelTime, Input._lastMouseWheelTime)){
            Input._mouseWheel = 0
        }else{
            const mouseWheel = event.deltaY
            Input._onPositiveWheel = mouseWheel>0
            Input._mouseWheel += Math.round(mouseWheel/150)
        }
        Input._lastMouseWheelTime = performance.now()
    }

    private onKeyUp(event: KeyboardEvent){
        const key = event.code as InputKeys;
        Input._keys[key] = false
        Input._ctrl[key] = false
        
    }

//--------------------------------
    private static onDragged(): boolean{
        const dx = Input._mousePosition.x - Input._mouseClickPosition.x
        const dy = Input._mousePosition.y - Input._mouseClickPosition.y
        
        if(Input._mouseClickPosition.x != -1){
            Input._dragX += dx * 0.1
            Input._dragY += dy * 0.1
        }else{
            // Input._dragX = 0
            // Input._dragY = 0
        }

        return Math.abs(dx) > Input._dragElapse || Math.abs(dy) > Input._dragElapse
    }
//--------------------------------
    static keyDown(keyCode: InputKeys): boolean{
        return Input._keys[keyCode]
    }   

    static keyUp(keyCode: InputKeys) : boolean{
        return !Input._keys[keyCode]
    }  

    static keyPress(keyCode: InputKeys): boolean{
        if(Input._ctrl[keyCode]){
            if(Input.keyDown(keyCode)){
                Input._ctrl[keyCode] = false
                return true
            }
        }else if(Input.keyUp(keyCode)){
            Input._ctrl[keyCode] = true
        }
        return false
    }  


    static generate(canvas: HTMLCanvasElement): void{
        if(Input._instance == null){
            Input._canvas = canvas
            const rect = Input._canvas.getBoundingClientRect()
            Input._offsetX= rect.left 
            Input._offsetY= rect.top
            Input._instance = new Input()
        }
    }


    static getMouse():Position{
        return Input._mousePosition
    }

    static getMouseClick(): Position | null{
        return Input._mouseClickPosition.x === -1 ? null : Input._mouseClickPosition.copy()
    }

    static getOnWheelPositiveDirection():boolean{
        return Input._onPositiveWheel
    }

    static getMouseWheel():number{
        return Input._mouseWheel
    }

    static getOnMouseClick():boolean{
        return this._onMouseClick
    }

    static onDrag():boolean{
        return this._onMouseClick 
            && Input.onDragged()
    }


    static onDragX():boolean{
        return Input.onDrag() && Input._dragX !=0
    }

    static onDragY():boolean{
        return Input.onDrag() && Input._dragY !=0
    }

    static get dragX(): number{
        return Input._dragX
    }

    static get dragY(): number{
        return Input._dragY
    }
}