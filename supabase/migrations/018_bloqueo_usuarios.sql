-- REPORTA · Bloqueo de usuarios ciudadanos
--
-- Un admin puede bloquear a un usuario verificado que haya hecho mal uso
-- de la app (foto/comentario inadecuado). El bloqueo se lanza desde la
-- ficha de la incidencia que lo motivó, queda con fecha/hora, incidencia y
-- administrador que lo hizo, y puede ser:
--   - de municipio (municipio_id no nulo): solo afecta a ese municipio,
--     lo puede crear un admin de ese municipio o un super-admin.
--   - global (municipio_id nulo): afecta a todos los municipios, solo lo
--     puede crear un super-admin.
--
-- El bloqueo no cierra la sesión del usuario ni le impide reportar de
-- forma anónima (tipo/subtipo/ubicación, como cualquiera) -- le retira el
-- privilegio de identificarse con foto/comentario, que es justo lo que se
-- usó mal. Un desbloqueo se registra (no se borra la fila) para conservar
-- el historial.

create table usuarios_bloqueados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  municipio_id uuid references municipios(id),
  motivo text not null,
  incidencia_id uuid references incidencias_anonimas(id),
  bloqueado_por uuid not null references admin_users(id),
  created_at timestamp default now(),
  desbloqueado_at timestamp,
  desbloqueado_por uuid references admin_users(id)
);

create index idx_bloqueados_usuario on usuarios_bloqueados (usuario_id);
create index idx_bloqueados_municipio on usuarios_bloqueados (municipio_id);
create index idx_bloqueados_activo on usuarios_bloqueados (usuario_id, municipio_id) where desbloqueado_at is null;

alter table usuarios_bloqueados enable row level security;

-- SELECT: un admin ve los bloqueos de su municipio y, además, los globales
-- (para saber que un usuario está vetado en todas partes aunque él sea de
-- un solo municipio). Un super-admin ve todos.
create policy "bloqueos: admin ve los de su ambito" on usuarios_bloqueados
  for select
  using (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (
          a.municipio_id is null
          or usuarios_bloqueados.municipio_id is null
          or a.municipio_id = usuarios_bloqueados.municipio_id
        )
    )
  );

-- INSERT: un admin de municipio solo puede crear bloqueos con su propio
-- municipio_id; un super-admin puede crear con cualquier municipio_id o
-- con NULL (bloqueo global).
create policy "bloqueos: admin bloquea dentro de su ambito" on usuarios_bloqueados
  for insert
  with check (
    bloqueado_por = auth.uid()
    and exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = usuarios_bloqueados.municipio_id)
    )
  );

-- UPDATE (desbloquear): mismo ámbito que crear.
create policy "bloqueos: admin desbloquea dentro de su ambito" on usuarios_bloqueados
  for update
  using (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = usuarios_bloqueados.municipio_id)
    )
  )
  with check (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = usuarios_bloqueados.municipio_id)
    )
  );

-- ---------------------------------------------------------------------
-- Enforcement: un usuario bloqueado (global, o para ese municipio en
-- concreto) no puede crear ni completar incidencias identificadas.
-- ---------------------------------------------------------------------

drop policy if exists "incidencias: creacion anonima limitada o de usuario verificado" on incidencias_anonimas;
create policy "incidencias: creacion anonima o de usuario verificado y no bloqueado" on incidencias_anonimas
  for insert
  with check (
    (usuario_id is null and descripcion_corta is null and imagen_url is null)
    or (
      usuario_id = auth.uid()
      and email_verificado(usuario_id)
      and not exists (
        select 1 from usuarios_bloqueados b
        where b.usuario_id = auth.uid()
          and b.desbloqueado_at is null
          and (b.municipio_id is null or b.municipio_id = incidencias_anonimas.municipio_id)
      )
    )
  );

drop policy if exists "incidencias: adjuntar imagen solo el autor verificado" on incidencias_anonimas;
create policy "incidencias: adjuntar imagen solo autor verificado y no bloqueado" on incidencias_anonimas
  for update
  using (imagen_id is null and usuario_id = auth.uid())
  with check (
    usuario_id = auth.uid()
    and email_verificado(usuario_id)
    and not exists (
      select 1 from usuarios_bloqueados b
      where b.usuario_id = auth.uid()
        and b.desbloqueado_at is null
        and (b.municipio_id is null or b.municipio_id = incidencias_anonimas.municipio_id)
    )
  );

-- Un bloqueo global también corta la subida a Storage (no es un bucket
-- consciente de municipio, así que un bloqueo de municipio no puede
-- aplicarse aquí -- solo el global).
drop policy if exists "incidencias-bucket: subida solo usuario verificado" on storage.objects;
create policy "incidencias-bucket: subida solo usuario verificado y no bloqueado global" on storage.objects
  for insert
  with check (
    bucket_id = 'incidencias'
    and auth.uid() is not null
    and email_verificado(auth.uid())
    and not exists (
      select 1 from usuarios_bloqueados b
      where b.usuario_id = auth.uid() and b.municipio_id is null and b.desbloqueado_at is null
    )
  );
