import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://doevlzpslaigpjnmcpem.supabase.co'
const supabaseKey = 'sb_publishable_diQgAkeHSwhbcuO38IZJMw_0mFvagfF'

export const supabase = createClient(supabaseUrl, supabaseKey)