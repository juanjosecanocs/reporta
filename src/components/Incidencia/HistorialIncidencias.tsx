import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useHistorialIncidencias, type HistorialEntry } from '../../hooks/useLocalStorage';
import { useTipos } from '../../hooks/useTipos';
import { SUBTIPO_ICONOS, TIPO_ICONOS, ICONO_POR_DEFECTO } from '../../data/iconos';
import type { Tipo } from '../../types';

interface EstadoActual {
  estado: string;
  updated_at: string;
}

interface ResultadoBusqueda {
  codigo_seguimiento: string;
  tipo_id: string;
  subtipo_id: string;
  estado: string;
  created_at: string;
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  revisada: 'Revisada',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#6b7280',
  revisada: '#F7931E',
  resuelto: '#16a34a',
  rechazado: '#dc2626',
};

function Insignia({ estado }: { estado: string }) {
  return (
    <span
      className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: ESTADO_COLOR[estado] ?? ESTADO_COLOR.pendiente }}
    >
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}

function Fila({
  tipos,
  tipoId,
  subtipoId,
  codigo,
  fecha,
  estado,
}: {
  tipos: Tipo[];
  tipoId: string;
  subtipoId: string;
  codigo: string;
  fecha: string;
  estado: string | null;
}) {
  const tipo = tipos.find((t) => t.id === tipoId);
  const subtipo = tipo?.subtipos?.find((s) => s.id === subtipoId);
  const color = tipo?.color_primario ?? '#043F63';
  const icono = SUBTIPO_ICONOS[subtipoId] ?? TIPO_ICONOS[tipoId] ?? ICONO_POR_DEFECTO;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-white text-lg"
        style={{ borderColor: color }}
      >
        {icono}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {tipo?.nombre ?? tipoId} · {subtipo?.nombre ?? subtipoId}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(fecha).toLocaleDateString('es-ES')} · {codigo}
        </p>
      </div>
      {estado ? <Insignia estado={estado} /> : <span className="text-xs text-gray-400">…</span>}
    </div>
  );
}

interface Props {
  onVolver: () => void;
}

export function HistorialIncidencias({ onVolver }: Props) {
  const { historial } = useHistorialIncidencias();
  const { tipos } = useTipos();
  const [estados, setEstados] = useState<Record<string, EstadoActual>>({});
  const [cargandoEstados, setCargandoEstados] = useState(true);

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusqueda | null>(null);

  useEffect(() => {
    if (historial.length === 0) {
      setCargandoEstados(false);
      return;
    }
    let cancelado = false;

    async function cargar() {
      const { data } = await supabase
        .from('incidencias_anonimas')
        .select('codigo_seguimiento, estado, updated_at')
        .in(
          'codigo_seguimiento',
          historial.map((h) => h.codigo_seguimiento)
        );

      if (cancelado) return;

      const mapa: Record<string, EstadoActual> = {};
      for (const fila of data ?? []) {
        mapa[fila.codigo_seguimiento] = { estado: fila.estado, updated_at: fila.updated_at };
      }
      setEstados(mapa);
      setCargandoEstados(false);
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [historial]);

  async function buscarCodigo(e: FormEvent) {
    e.preventDefault();
    const codigo = codigoBusqueda.trim().toUpperCase();
    if (!codigo) return;

    setBuscando(true);
    setErrorBusqueda(null);
    setResultadoBusqueda(null);

    const { data, error } = await supabase
      .from('incidencias_anonimas')
      .select('codigo_seguimiento, tipo_id, subtipo_id, estado, created_at')
      .eq('codigo_seguimiento', codigo)
      .maybeSingle();

    setBuscando(false);

    if (error || !data) {
      setErrorBusqueda('No se ha encontrado ninguna incidencia con ese código');
      return;
    }
    setResultadoBusqueda(data);
  }

  const entradasOrdenadas = [...historial].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mx-auto max-w-md p-4">
      <button type="button" onClick={onVolver} className="mb-3 text-sm text-primary">
        ← Volver
      </button>
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Mi historial</h2>

      <form onSubmit={buscarCodigo} className="mb-2 flex gap-2">
        <input
          value={codigoBusqueda}
          onChange={(e) => setCodigoBusqueda(e.target.value.toUpperCase())}
          placeholder="Buscar por código (ej. ABC123)"
          maxLength={6}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={buscando || !codigoBusqueda.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {errorBusqueda && <p className="mb-4 text-sm text-red-500">{errorBusqueda}</p>}
      {resultadoBusqueda && (
        <div className="mb-6">
          <Fila
            tipos={tipos}
            tipoId={resultadoBusqueda.tipo_id}
            subtipoId={resultadoBusqueda.subtipo_id}
            codigo={resultadoBusqueda.codigo_seguimiento}
            fecha={resultadoBusqueda.created_at}
            estado={resultadoBusqueda.estado}
          />
        </div>
      )}

      <h3 className="mb-2 text-sm font-semibold text-gray-500">Enviadas desde este dispositivo</h3>
      {historial.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no has enviado ninguna incidencia desde este dispositivo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entradasOrdenadas.map((item: HistorialEntry) => (
            <Fila
              key={item.codigo_seguimiento}
              tipos={tipos}
              tipoId={item.tipo_id}
              subtipoId={item.subtipo_id}
              codigo={item.codigo_seguimiento}
              fecha={item.created_at}
              estado={cargandoEstados ? null : (estados[item.codigo_seguimiento]?.estado ?? 'pendiente')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
