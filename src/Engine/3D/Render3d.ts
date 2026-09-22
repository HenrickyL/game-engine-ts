import { Point, Polygon } from "../Geometry"
import { Graphics } from "../Graphics"
import { Vector } from "../middleware/Vector"
import { Matrix4x4 } from "./Matrix4x4"
import { Mesh } from "./Mesh"
import { Triangle } from "./Triangle"

/*
a : Proportion = hight/width
theta: scale factor (angle)
F : Factor Projection = 1 / tan(theta/2)
scale coefficient ->q = zfar/(zfar-znear) - (zfar*znear)/(zfar-znear)
zFar
ZNear


x,y,z =>  aFx/z, Fy/z, (zq - znear q)/z

*/
type UpdateSettings = {
    angleX: number, 
    angleZ: number, 
    angleY: number,
    theta?: number
}
type RenderSettings = {
    isColor?: boolean
    isPoint?: boolean

}
export class Render3d{
    private _graphics: Graphics
    private _onWireframe : boolean = false

    private _width: number = 0
    private _height: number = 0
    private _zFar: number = 1000
    private _zNear: number = 0.1
    private _theta: number = 90 //angle vision - scale factor

    private _aspectRatio: number = 0

    private _matrixProjection: Matrix4x4 = new Matrix4x4()
    private _matRotation: Matrix4x4 = new Matrix4x4()

    //init can
    private _camera: Vector
    //light
    private _lightDirection: Vector

    //test
    private _angleXRad: number = 0
    private _angleZRad: number = 0
    private _angleYRad: number = 0
    private _zDistance:number = 2

    //
    private _lastRender: Triangle[] = []
    private _isChanged: boolean = true
    private _lastUpdateSettings: UpdateSettings = {angleX:0, angleZ:0, angleY:0}


    constructor(graphics: Graphics, theta: number = 90, zNear: number = 0, zFar:number = 0){
        this._graphics = graphics
        this._camera = Vector.Zero
        this._lightDirection = Vector.Backward
        this.setProjectionParams(graphics.width, graphics.height, theta, zFar, zNear)
        
    }

    
    update(settings:UpdateSettings = {angleX:0, angleZ:0, angleY:0}){
        if(settings.angleX !== this._lastUpdateSettings.angleX){
            this._angleXRad = settings.angleX /180 * Math.PI
            this._isChanged = true
        }
        if(settings.angleZ !== this._lastUpdateSettings.angleZ){
            this._angleZRad = settings.angleZ /180 * Math.PI
            this._isChanged = true
        }
        if(settings.angleY !== this._lastUpdateSettings.angleY){
            this._angleYRad = settings.angleY /180 * Math.PI
            this._isChanged = true
        }
        if(settings.theta &&  settings.theta != this._theta){
            this.theta = settings.theta
        }
        if(this._isChanged){
            this.calculatedMatrixRotation()
        }

        this._lastUpdateSettings = settings
    }
    

    render(mesh: Mesh, settings: RenderSettings = {}){
        this._graphics.clear()

        let triangleToDraw = this._lastRender
        if(this._isChanged){
            console.log('Change')
            const sortedTriangles = this.projectTrianglesAndSort(mesh)
            triangleToDraw = sortedTriangles
            this._lastRender = sortedTriangles
        }
        this.drawTriangles(triangleToDraw, settings)
        this._isChanged = false
    }
    private projectTrianglesAndSort(mesh: Mesh):Triangle[]{
        const trianglesToDraw: Triangle[] = []
        mesh.triangles.forEach(triangle =>{
            const projectedTriangle = this.projectVertex(triangle)
            if(projectedTriangle){
                trianglesToDraw.push(projectedTriangle)
            }
        })

        const sortedTriangles = trianglesToDraw.sort((t1, t2) => {
            // Encontre o valor z mínimo (mais próximo da câmera)
            const z1 = Math.min(t1.vertices[0].z, t1.vertices[1].z, t1.vertices[2].z);
            const z2 = Math.min(t2.vertices[0].z, t2.vertices[1].z, t2.vertices[2].z);
            return z2 - z1;
          });
        return sortedTriangles
    }

    private drawTriangles(triangles: Triangle[], settings: RenderSettings = {}){
        triangles.forEach(triangle=>{
            if(settings.isPoint)
                Point.draw(this._graphics.context, triangle.vertices,{color: triangle.color, isSquare: false, size: 5})
            else
                Polygon.draw(this._graphics.context, triangle.vertices, {fillColor: triangle.color})
        })
    }

    //------------------------------------------

    private setProjectionParams(width:number, height:number, theta: number, zNear: number, zFar:number){
        this._width = width;
        this._height = height;
        this._theta = theta;
        if(zNear!==0)this._zNear = zNear;
        if(zFar!==0) this._zFar = zFar;

        this._aspectRatio = this._height/ this._width
        this.calculatedMatrixProjection()
        this.calculatedMatrixRotation()
        console.log('setPRoj')
    }

    private calculatedMatrixProjection(){
        this._matrixProjection = Matrix4x4.MakeProjection(this._theta, this._aspectRatio,this._zNear, this._zFar)
    }


    private calculatedMatrixRotation(){
        this._matRotation = Matrix4x4.MakeRotation(this._angleXRad, this._angleYRad, this._angleZRad)
    }

    private onSeeTriangle(triangle: Triangle, normal: Vector): boolean{
        if(this._onWireframe) return true;
        const v = triangle.vertices
        //same plane, so i can take any point
        const adjust:Vector = v[0].sub(this._camera)
        return Vector.dotProduct(normal,adjust) < 0
    }


    private projectVertex(triangle: Triangle): Triangle | null{
        const triangleTranslated = this.preProjectionCalculation(triangle)
        const normal: Vector = Triangle.normalVector(triangleTranslated)

        if(this.onSeeTriangle(triangleTranslated, normal)){
            const result: Vector[] = triangleTranslated.vertices
            .map(vertex=>{
                const res = this.multiplyMatrixVector(vertex, this._matrixProjection)

                res.x += 1
                res.y += 1
        
                res.x *= 0.5 * this._width 
                res.y *= 0.5 * this._height 
                return res
            })
            const resultTriangle = new Triangle(result, triangle.color)
            return this.lightCalculation(resultTriangle, normal)
        }
        return null
    }
    private lightCalculation(triangle: Triangle, normal: Vector): Triangle{
        const light = this._lightDirection
        const lightUnit = light.unitary()
        
        const luminosity = Vector.dotProduct(lightUnit, normal)
        triangle.color = triangle.color.modifyColor(luminosity)
        return triangle
    }

    private preProjectionCalculation(triangle: Triangle): Triangle{
        const vertices = triangle.vertices
        const result: Triangle = new Triangle([], triangle.color)

        vertices.forEach(vertex=>{
            const v = this.multiplyMatrixVector(vertex, this._matRotation)
            // const v = vertex
            const translatedVertex = new Vector(v.x, v.y, v.z + this._zDistance)
            result.vertices.push(translatedVertex)
        })
        return result
    }


    private multiplyMatrixVector(v: Vector, matrix: Matrix4x4): Vector{
        const result = Matrix4x4.multiplyMatrixVector(v, matrix)
        if(result.w !== 0){
            result.x /= result.w
            result.y /= result.w
            result.z /= result.w
        }
        return result
    }

    set theta(value:number){
        this._theta = value/180*Math.PI
        this.setProjectionParams(this._width, this._height, this._theta, this._zFar, this._zNear)
    }

    get width(){
        return this._width
    }

    get height(){
        return this._height
    }

    set z(value:number){
        if(value > 0)
        this._zDistance = value
        this._isChanged =true
    }

    get isChanged():boolean{
        return this._isChanged
    }

    set isChanged(value: boolean){
        this._isChanged = value
    }
}