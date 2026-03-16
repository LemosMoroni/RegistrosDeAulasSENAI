// ══════════════════════════════════════════
//  CONFIGURAÇÃO DO SUPABASE
//  Altere apenas estas duas variáveis se
//  precisar trocar de projeto.
// ══════════════════════════════════════════

const SUPA_URL = 'https://ltigdtyjrxgocipwmoug.supabase.co';
const SUPA_KEY = 'sb_publishable_qpHs3rg2FwW4d5B075S7eQ_EBhIzrc4';

const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_KEY);
