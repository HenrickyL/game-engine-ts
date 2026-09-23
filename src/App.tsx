import { useEffect, useState } from "react"
import { Engine } from "./Engine/Engine"
import { GameTest } from "./Game/GameTest"
import { DemonstracaoAberta } from "./vitrine/Demonstracao"
import { Palco } from "./vitrine/Palco"
import {
    abrir,
    catalogo,
    sessaoInicial,
    voltar,
    type Dimensao,
    type PecaId,
    type Sessao,
} from "./vitrine/sessao"

function grupos(): Dimensao[] {
    const vistos: Dimensao[] = []
    for (const entrada of catalogo) {
        if (!vistos.includes(entrada.dimensao)) {
            vistos.push(entrada.dimensao)
        }
    }
    return vistos
}

function TelaVitrine({ onAbrir }: { onAbrir: (id: PecaId) => void }) {
    return (
        <div className="vitrine-pagina">
            <main className="vitrine">
                <div>
                    <h1>Game engine</h1>
                    <p className="subtitulo">Uma engine para criar jogos 2d e 3d</p>
                    <section className="demos">
                        <h2>Demos</h2>
                        {grupos().map((dimensao) => (
                            <div className="grupo" key={dimensao}>
                                <h3>{dimensao}</h3>
                                {catalogo
                                    .filter((entrada) => entrada.dimensao === dimensao)
                                    .map((entrada) => (
                                        <button
                                            key={entrada.id}
                                            type="button"
                                            className="card"
                                            onClick={() => onAbrir(entrada.id)}
                                        >
                                            {entrada.nome}
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </section>
                </div>
                <footer className="rodape">
                    <span>Henricky Monteiro</span>
                    <a href="https://github.com/henrickyL">github</a>
                </footer>
            </main>
        </div>
    )
}

function BreakoutAberto({ onVoltar }: { onVoltar: () => void }) {
    const legenda = catalogo.find((entrada) => entrada.id === "breakout")?.legenda ?? []

    useEffect(() => {
        const engine = new Engine(true)
        engine.start(new GameTest())
        return () => {
            engine.stop()
        }
    }, [])

    return (
        <Palco legenda={legenda} onVoltar={onVoltar}>
            <canvas width={800} height={600} />
        </Palco>
    )
}

function App() {
    const [sessao, setSessao] = useState<Sessao>(sessaoInicial)

    if (sessao.pecaAtiva === "breakout") {
        return <BreakoutAberto onVoltar={() => setSessao(voltar())} />
    }

    if (sessao.pecaAtiva === "demonstracao") {
        return <DemonstracaoAberta onVoltar={() => setSessao(voltar())} />
    }

    return <TelaVitrine onAbrir={(id) => setSessao(abrir(id))} />
}

export default App
