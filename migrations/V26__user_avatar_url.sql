-- V26__user_avatar_url.sql
-- Agregar columna avatar_url a la tabla users para fotos de perfil del equipo y ejecutivos

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar_url MEDIUMTEXT NULL AFTER name;
