import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://ltigdtyjrxgocipwmoug.supabase.co'
const SUPA_KEY = 'sb_publishable_qpHs3rg2FwW4d5B075S7eQ_EBhIzrc4'

export const db = createClient(SUPA_URL, SUPA_KEY)