import type { ReactNode } from "react"

export function Palco({
    legenda,
    onVoltar,
    aviso,
    children,
}: {
    legenda: readonly string[]
    onVoltar: () => void
    aviso?: string
    children: ReactNode
}) {
    return (
        <div className="palco-pagina">
            <div className="palco">
                <button type="button" className="voltar" onClick={onVoltar}>
                    Voltar
                </button>
                {aviso ? <p className="aviso">{aviso}</p> : null}
                <ul className="legenda">
                    {legenda.map((linha) => (
                        <li key={linha}>{linha}</li>
                    ))}
                </ul>
                {children}
            </div>
        </div>
    )
}
