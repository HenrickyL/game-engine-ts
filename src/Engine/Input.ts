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
    private static _onPositiveWheel : boolean = false

    private static _dragX: number =0
    private static _dragY: number =0
    private static _dragElapse: number = 5

    private onKeyDownBound!: (event: KeyboardEvent) => void
    private onKeyUpBound!: (event: KeyboardEvent) => void
    private onMouseMoveBound!: (event: MouseEvent) => void
    private onMouseDownBound!: (event: MouseEvent) => void
    private onMouseUpBound!: (event: MouseEvent) => void
    private onWheelBound!: (event: WheelEvent) => void


    private constructor(){
        Input._keys = Object.keys(InputKeys).reduce((acc, key) => {
            acc[key as InputKeys] = false;
            return acc;
          }, {} as { [key in InputKeys]: boolean });

        Input._ctrl = Object.keys(InputKeys).reduce((acc, key) => {
            acc[key as InputKeys] = false;
            return acc;
         }, {} as { [key in InputKeys]: boolean });

        this.onKeyDownBound = (event) => this.onKeyDown(event)
        this.onKeyUpBound = (event) => this.onKeyUp(event)
        this.onMouseMoveBound = (event) => this.onMouseMove(event)
        this.onMouseDownBound = (event) => this.onMouseDown(event)
        this.onMouseUpBound = (event) => this.onMouseUp(event)
        this.onWheelBound = (event) => this.onMouseWheel(event)
        this.eventHandle()
    }

    private eventHandle(): void{
        document.addEventListener('keydown', this.onKeyDownBound)
        document.addEventListener('keyup', this.onKeyUpBound)
        document.addEventListener('mouseup', this.onMouseUpBound)
        this.ligarCanvas(Input._canvas)
    }

    private ligarCanvas(canvas: HTMLCanvasElement): void{
        canvas.addEventListener('mousemove', this.onMouseMoveBound)
        canvas.addEventListener('mousedown', this.onMouseDownBound)
        canvas.addEventListener('wheel', this.onWheelBound)
    }

    private desligarCanvas(canvas: HTMLCanvasElement): void{
        canvas.removeEventListener('mousemove', this.onMouseMoveBound)
        canvas.removeEventListener('mousedown', this.onMouseDownBound)
        canvas.removeEventListener('wheel', this.onWheelBound)
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

    private onMouseWheel(event: WheelEvent){
        const mouseWheel = event.deltaY
        Input._onPositiveWheel = mouseWheel > 0
        let notches = Math.round(mouseWheel / 150)
        if(notches === 0 && mouseWheel !== 0){
            notches = mouseWheel > 0 ? 1 : -1
        }
        Input._mouseWheel += notches
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
            Input.medirOffset()
            Input._instance = new Input()
            return
        }
        if(Input._canvas === canvas){
            Input.medirOffset()
            return
        }
        Input._instance.desligarCanvas(Input._canvas)
        Input._canvas = canvas
        Input.medirOffset()
        Input._instance.ligarCanvas(canvas)
        Input.limpar()
    }

    private static medirOffset(): void{
        const rect = Input._canvas.getBoundingClientRect()
        Input._offsetX = rect.left
        Input._offsetY = rect.top
    }

    private static limpar(): void{
        for(const key of Object.keys(Input._keys) as InputKeys[]){
            Input._keys[key] = false
            Input._ctrl[key] = false
        }
        Input._onMouseClick = false
        Input._dragX = 0
        Input._dragY = 0
        Input._mouseWheel = 0
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

    static zerarArrasto(): void{
        Input._dragX = 0
        Input._dragY = 0
    }

    static consumirRoda(): number{
        const valor = Input._mouseWheel
        Input._mouseWheel = 0
        return valor
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