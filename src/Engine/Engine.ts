import { GameNotDefinedInEngineError } from "./Errors";
import { Graphics } from "./Graphics";
import { Input } from "./Input";
import { Timer } from "./Timer";
import { InputKeys } from "./enums";
import { IGame } from "./interfaces/IGame";

export class Engine{
    //fps
    private _isVariableRate: boolean
    private _frameRate: number = 60
    private _frameDuration: number = 1000/60
    private _lastTime: number = 0
    private _elapsed: number = 0
    private _frames: number = 0
    //
    private _game : IGame | undefined
    private _graphics : Graphics  = new Graphics()
    private _screenWidth: number = 800
    private _screenHeight: number = 600
    private _timer : Timer
    private _onPause: boolean = false
    private _ativa: boolean = false
    private _frame: number = 0

    constructor(isVariableRate = false){
        this._timer = new Timer()
        this._isVariableRate = isVariableRate
    }


    start(game: IGame){
        this._ativa = true
        this._graphics = new Graphics(this.screenWidth, this.screenHeight)
        this._game = game
        Input.generate(this._graphics.canvas)
        this.loop()
    }

    stop(){
        this._ativa = false
        cancelAnimationFrame(this._frame)
        this._frame = 0
        this._game = undefined
    }

    private loop(){
        if(!this._game){
            throw new GameNotDefinedInEngineError()
        }
        this._game.init(this._graphics)
        this._timer.resetTimer()

        this._frame = requestAnimationFrame(this._isVariableRate ?
            this.mainLoopVariable: this.mainLoopConstant)

        this._timer.stopTimer()
    }

    private mainLoopVariable = (timestamp:number)=>{
        if(!this._ativa){
            return
        }
        const elapsed = timestamp - this._lastTime
        this._lastTime = timestamp
        this._elapsed += elapsed
        this._frames++
        if(this._elapsed > 1000){
            this.frameRate = Math.floor((this._frames / this._elapsed)*1000)
            this._frames = 0
            this._elapsed = 0
        }
        this.mainLoop(elapsed)
        this._frame = requestAnimationFrame(this.mainLoopVariable)

    }

    private mainLoopConstant = (timestamp:number)=>{
        if(!this._ativa){
            return
        }
        const currentTime = timestamp || 0
        const elapsed = currentTime - this._lastTime
        this.mainLoop(elapsed)
        this._lastTime = currentTime - (elapsed % this._frameDuration);
        this._frame = requestAnimationFrame(this.mainLoopConstant)
    }


    private mainLoop = (elapsed: number)=>{
        this.verifyPause()
        if(this._game && this._graphics && this._graphics.context && !this._onPause){
            this._game.update()
            if(this._isVariableRate){
                this._graphics.clear()
                this._game.draw(this._graphics.context)
            }else if(!this._isVariableRate && elapsed > this._frameDuration){
                this._graphics.clear()
                this._game.draw(this._graphics.context)
            }
        }
    }

    private verifyPause():void{
        if(Input.keyPress(InputKeys.Pause)){
            this._onPause = !this._onPause
            console.log('Pause')
        }
    }




    set screenWidth(value: number){
        this._screenWidth = value
    }
    set screenHeight(value: number){
        this._screenHeight = value
    }

    get screenHeight():number{
        return this._screenHeight
    }
    get screenWidth():number{
        return this._screenWidth
    }

    get frameRate():number{
        return this._frameRate
    }

    set frameRate(value: number){
        this._frameRate = value
        this._frameDuration = 1000/this._frameRate
    }
}