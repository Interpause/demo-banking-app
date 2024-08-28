/** Generate mock data with loading delay. */

const MOCK_DELAY = 1000
const MOCK_IDS_PER_REFRESH = 20
const MOCK_ID_LIMIT = 200

const allIds = []

const sleep = (ms) => new Promise((next) => setTimeout(next, ms))

/** Fetch all ids from server. */
export async function fetchAllIds() {
  console.log('fetchAllIds')
  await sleep(MOCK_DELAY)
  // Create new ids each time fetch is called.
  const curlen = allIds.length
  if (curlen >= MOCK_ID_LIMIT) return allIds
  allIds.push(
    ...Array.from(
      { length: MOCK_IDS_PER_REFRESH },
      (_, i) => `id-${curlen + i}`,
    ),
  )
  return allIds
}

/** Get data associated with id. */
export async function fetchDataById(id) {
  console.log('fetchDataById', id)
  await sleep(MOCK_DELAY)
  return {
    id,
    amount: Math.random() * 1000,
    type: Math.random() > 0.5 ? 'debit' : 'credit',
    created: new Date().toISOString(),
  }
}

/** Get associated data for each id in list. */
export async function fetchDataByIds(ids) {
  console.log('fetchDataByIds', ids)
  await sleep(MOCK_DELAY)
  return ids.map((id) => ({
    id,
    amount: Math.random() * 1000,
    type: Math.random() > 0.5 ? 'debit' : 'credit',
    created: new Date().toISOString(),
  }))
}
