export type Dimensao = "2D" | "3D"

export type PecaId = "breakout" | "demonstracao"

export type EntradaDemo = {
    id: PecaId
    nome: string
    dimensao: Dimensao
    legenda: readonly string[]
}

export const catalogo: readonly EntradaDemo[] = [
    {
        id: "breakout",
        nome: "Breakout",
        dimensao: "2D",
        legenda: [
            "A / D — mover a raquete",
            "Espaço — soltar a bola",
            "Pause — pausar",
        ],
    },
    {
        id: "demonstracao",
        nome: "Demonstração",
        dimensao: "3D",
        legenda: [
            "Arrastar — girar",
            "Roda do mouse — girar no outro eixo",
            "W / S — aproximar e afastar",
            "Shift — mais rápido",
            "Espaço — trocar a malha",
            "A — preenchido ou pontos",
            "D — iluminação",
        ],
    },
]

export type Sessao = {
    pecaAtiva: PecaId | null
}

export const sessaoInicial: Sessao = { pecaAtiva: null }

export function abrir(id: PecaId): Sessao {
    return { pecaAtiva: id }
}

export function voltar(): Sessao {
    return { pecaAtiva: null }
}
