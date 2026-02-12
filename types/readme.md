--tabla profile

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text
);


--Activar seguridad
alter table profiles enable row level security;


Crear políticas
Permitir que el usuario inserte su propio perfil

create policy "Users can insert their own profile"
on profiles
for insert
with check (auth.uid() = id);



Permitir que vea su propio perfil
create policy "Users can view their own profile"
on profiles
for select
using (auth.uid() = id);




Permitir que actualice su propio perfil
create policy "Users can update their own profile"
on profiles
for update
using (auth.uid() = id);


triggers
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, telefono)
  values (new.id, '', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();












