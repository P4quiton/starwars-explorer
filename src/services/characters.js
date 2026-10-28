
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 12

export async function getCharacters(page = 1) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await supabase
    .from('characters')
    .select(`
      id,
      name,
      gender,
      birth_year,
      height,
      mass,
      hair_color,
      eye_color,
      homeworld_id,
      planets (
        name
      )
    `, { count: 'exact' })
    .order('id', { ascending: true })
    .range(from, to)

  if (error) throw error

  return {
    characters: data ?? [],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  }
}
