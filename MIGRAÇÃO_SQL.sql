-- Execute este SQL no Supabase > SQL Editor antes de usar o novo pacote
ALTER TABLE records ADD COLUMN IF NOT EXISTS image_url_2 text;
ALTER TABLE records ADD COLUMN IF NOT EXISTS image_url_3 text;
