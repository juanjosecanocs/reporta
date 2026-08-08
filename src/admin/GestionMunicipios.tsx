import { useEffect, useState } from 'react';
import {
  listarMunicipiosAdmin,
  crearMunicipio,
  cambiarActivoMunicipio,
  type DatosMunicipio,
} from '../services/municipioAdminService';
import type { Municipio } from '../types';

const MUNICIPIO_VACIO: DatosMunicipio = { slug: '', nombre: '', centro_lat: 0, centro_lng: 0, zoom_inicial: 13 };

function slugify(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FormularioMunicipio({
  onGuardar,
  onCancelar,
}: {
  onGuardar: (datos: DatosMunicipio) => Promise<void>;
  onCancelar: () => void;
}) {
  const [datos, setDatos] = useState<DatosMunicipio>(MUNICIPIO_VACIO);
  const [slugTocado, setSlugTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (!datos.nombre.trim() || !datos.slug.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={datos.nombre}
          onChange={(e) => {
            const nombre = e.target.value;
            setDatos((d) => ({ ...d, nombre, slug: slugTocado ? d.slug : slugify(nombre) }));
          }}
          placeholder="Nombre del municipio"
          className="min-w-[160px] flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          value={datos.slug}
          onChange={(e) => {
            setSlugTocado(true);
            setDatos((d) => ({ ...d, slug: e.target.value }));
          }}
          placeholder="slug (subdominio)"
          className="w-44 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          step="0.000001"
          value={datos.centro_lat}
          onChange={(e) => setDatos((d) => ({ ...d, centro_lat: Number(e.target.value) }))}
          placeholder="Latitud"
          className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          type="number"
          step="0.000001"
          value={datos.centro_lng}
          onChange={(e) => setDatos((d) => ({ ...d, centro_lng: Number(e.target.value) }))}
          placeholder="Longitud"
          className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          type="number"
          value={datos.zoom_inicial}
          onChange={(e) => setDatos((d) => ({ ...d, zoom_inicial: Number(e.target.value) }))}
          placeholder="Zoom inicial"
          className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || !datos.nombre.trim() || !datos.slug.trim()}
          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Crear municipio'}
        </button>
        <button type="button" onClick={onCancelar} className="text-xs text-gray-500 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function GestionMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setMunicipios(await listarMunicipiosAdmin());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando municipios');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function alternarActivo(m: Municipio) {
    setError(null);
    try {
      await cambiarActivoMunicipio(m.id, !m.activo);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando el municipio');
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Municipios</h2>
      <p className="mb-4 text-sm text-gray-500">
        Activa un municipio cuando llegue una petición real, o da de alta uno que no esté en el catálogo. Solo
        visible para super-administradores.
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {municipios.map((m) => (
            <div
              key={m.id}
              className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${
                m.activo ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-70'
              }`}
            >
              <div className="min-w-[200px] flex-1">
                <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                <p className="text-xs text-gray-500">
                  {m.slug} · {m.centro_lat}, {m.centro_lng} · zoom {m.zoom_inicial}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  m.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {m.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button
                type="button"
                onClick={() => alternarActivo(m)}
                className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
              >
                {m.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {creando ? (
          <FormularioMunicipio
            onGuardar={async (datos) => {
              await crearMunicipio(datos);
              setCreando(false);
              cargar();
            }}
            onCancelar={() => setCreando(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="rounded-lg border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary"
          >
            + Nuevo municipio
          </button>
        )}
      </div>
    </div>
  );
}
