import { useEffect, useState } from "react"
import { Graphics } from "../Engine/Graphics"
import { Input } from "../Engine/Input"
import { InputKeys } from "../Engine/enums"
import { Mesh } from "../Engine/3D/Mesh"
import { Render3d } from "../Engine/3D/Render3d"
import { Test3d } from "../Engine/3D/Test3d"
import { Palco } from "./Palco"
import { catalogo } from "./sessao"

const AVISO = "Não foi possível carregar o objeto."

const OBJETOS = ["/tree.obj", "/sphere.obj", "/Jeep.obj"]

async function carregar(test: Test3d, url: string): Promise<Mesh | null> {
    try {
        const resposta = await fetch(url)
        const tipo = resposta.headers.get("content-type") ?? ""
        if (!resposta.ok || tipo.includes("text/html")) {
            return null
        }
        const malha = await test.getObj(url)
        if (malha.triangles.length === 0) {
            return null
        }
        return malha
    } catch {
        return null
    }
}

export function DemonstracaoAberta({ onVoltar }: { onVoltar: () => void }) {
    const legenda = catalogo.find((entrada) => entrada.id === "demonstracao")?.legenda ?? []
    const [aviso, setAviso] = useState<string | undefined>(undefined)

    useEffect(() => {
        let cancelado = false
        const intervalos: number[] = []
        const graphics = new Graphics()
        const test = new Test3d()
        const graph = new Render3d(graphics)
        Input.generate(graphics.canvas)

        const cubo = test.getCube()
        const piramide = test.getPyramid()
        graph.render(cubo, {})

        void (async () => {
            const objetos = await Promise.all(OBJETOS.map((url) => carregar(test, url)))
            if (cancelado) {
                return
            }
            if (objetos.some((malha) => malha === null)) {
                setAviso(AVISO)
            }

            const forms = [cubo, piramide, ...objetos.filter((malha): malha is Mesh => malha !== null)]
            let index = 0
            let mesh = forms[index]
            let angleX = 0
            let angleZ = 0
            let angleY = 0
            let isPoint = false
            let iluminado = true
            let x = 0
            let y = 0
            let z = 2
            const abertura = { x, y, z, angleX, angleY, angleZ }
            const tick = 0.2
            graph.isChanged = true

            intervalos.push(window.setInterval(() => {
                const rapido = Input.keyDown(InputKeys.ShiftLeft) || Input.keyDown(InputKeys.ShiftRight)
                const passo = tick * (rapido ? 5 : 1)
                if (Input.keyDown(InputKeys.A)) {
                    x -= passo
                    graph.x = x
                }
                if (Input.keyDown(InputKeys.D)) {
                    x += passo
                    graph.x = x
                }
                if (Input.keyDown(InputKeys.W)) {
                    y -= passo
                    graph.y = y
                }
                if (Input.keyDown(InputKeys.S)) {
                    y += passo
                    graph.y = y
                }
                if (Input.keyPress(InputKeys.T)) {
                    isPoint = !isPoint
                }
                if (Input.keyPress(InputKeys.I)) {
                    iluminado = !iluminado
                    graph.isChanged = true
                }
                if (Input.keyPress(InputKeys.Space)) {
                    index = (index + 1) % forms.length
                    mesh = forms[index]
                    graph.isChanged = true
                }
                if (Input.onDragY()) {
                    angleX = Input.dragY
                }
                if (Input.onDragX()) {
                    angleY = Input.dragX
                }
                const roda = Input.consumirRoda()
                if (roda !== 0) {
                    const proximo = z + roda * passo
                    z = proximo > tick ? proximo : tick
                    graph.z = z
                }
                if (Input.keyPress(InputKeys.R)) {
                    x = abertura.x
                    y = abertura.y
                    z = abertura.z
                    angleX = abertura.angleX
                    angleY = abertura.angleY
                    angleZ = abertura.angleZ
                    graph.x = x
                    graph.y = y
                    graph.z = z
                    Input.zerarArrasto()
                    graph.isChanged = true
                }
            }, 100))

            intervalos.push(window.setInterval(() => {
                graph.update({ angleX, angleZ, angleY })
                graph.render(mesh, { isPoint, iluminado })
            }, 1000 / 45))
        })()

        return () => {
            cancelado = true
            for (const id of intervalos) {
                window.clearInterval(id)
            }
        }
    }, [])

    return (
        <Palco legenda={legenda} onVoltar={onVoltar} aviso={aviso}>
            <canvas width={800} height={600} />
        </Palco>
    )
}
