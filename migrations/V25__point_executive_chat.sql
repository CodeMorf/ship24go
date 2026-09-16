-- V25__point_executive_chat.sql
-- Vinculacion de Account Executive y Chat de Asistencia Dedicado para Points

ALTER TABLE points
  ADD COLUMN executive_user_id VARCHAR(64) NULL DEFAULT NULL AFTER user_id,
  ADD INDEX idx_points_executive (executive_user_id);

CREATE TABLE IF NOT EXISTS point_chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  point_id VARCHAR(64) NOT NULL,
  sender_user_id VARCHAR(64) NOT NULL,
  sender_role ENUM('point', 'executive', 'super_admin') NOT NULL,
  sender_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pcm_point_date (point_id, created_at),
  INDEX idx_pcm_sender (sender_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
