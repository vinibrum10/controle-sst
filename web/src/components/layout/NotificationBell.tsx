import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import { formatDateTime } from "../../lib/format";
import type { NotificacaoItem } from "../../lib/notificacoes";

const iconButtonClasses =
  "relative inline-flex min-h-[42px] min-w-[42px] items-center justify-center gap-2 rounded-[8px] border border-line bg-neutral-button px-2.5 font-extrabold text-text transition-all hover:-translate-y-px hover:shadow-card-lg active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function NotificationBell() {
  const { itens, naoLidas, carregando, marcarLida, marcarTodasLidas } = useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function aoClicarFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  async function abrirNotificacao(item: NotificacaoItem) {
    if (!item.lida) await marcarLida(item.id);
    setAberto(false);
    if (item.link) navigate(item.link);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={iconButtonClasses}
        aria-label="Notificações"
        title="Notificações"
        onClick={() => setAberto((valor) => !valor)}
      >
        <Icon id="icon-bell" />
        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red px-1 text-[0.65rem] font-extrabold text-white">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="fixed inset-x-3 top-[116px] z-50 rounded-[8px] border border-line bg-surface shadow-card-lg sm:absolute sm:inset-x-auto sm:left-auto sm:top-[calc(100%+8px)] sm:right-0 sm:w-[360px]">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
            <span className="font-extrabold text-text">Notificações</span>
            {naoLidas > 0 && (
              <button
                type="button"
                className="text-[0.78rem] font-bold text-teal hover:underline"
                onClick={() => marcarTodasLidas()}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {carregando && <p className="px-3.5 py-4 text-center text-[0.85rem] text-muted">Carregando...</p>}
            {!carregando && itens.length === 0 && (
              <p className="px-3.5 py-4 text-center text-[0.85rem] text-muted">Nenhuma notificação por aqui.</p>
            )}
            {itens.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`flex w-full flex-col gap-1 border-b border-line px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-strong ${
                  item.lida ? "" : "bg-teal-soft/40"
                }`}
                onClick={() => abrirNotificacao(item)}
              >
                <span className="text-[0.85rem] font-extrabold text-text">{item.titulo}</span>
                <span className="text-[0.8rem] text-muted">{item.mensagem}</span>
                <span className="text-[0.7rem] text-muted">{formatDateTime(item.criadoEm)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
