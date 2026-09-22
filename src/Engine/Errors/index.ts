export class ThrowError extends Error{
    constructor(message: string) {
        super(message)
    }
}


export class NotImplementError extends ThrowError{
    constructor(){
        super("Method not implement")
    }
}


export class PolygonEdgesError extends ThrowError{
    constructor(){
        super("The polygon must have at least 3 edges.")
    }
}

export class GameNotDefinedInEngineError extends ThrowError{
    constructor(){
        super("No game provided. Please provide a valid game object to Engine.")
    }
}

export class GeometryParamInvalidError extends ThrowError{
    constructor(){
        super("this Geometry Param is invalid.")
    }
}



export class CanvasHTMLElementNotFoundError extends ThrowError{
    constructor(){
        super("Canvas tag not found.")
    }
}


export class CanvasContextError extends ThrowError{
    constructor(){
        super("Context Canvas not working.")
    }
}

export class ObjLoaderPerformanceError extends ThrowError{
    constructor(){
        super("The loaded object contains many triangles in the mesh, which would cause a performance problem. Sorry about that.")
    }
}