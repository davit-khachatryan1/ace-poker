import { z } from 'zod'

const tableSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  holeCards: z.array(z.union([z.array(z.string()), z.null()])),
  communityCards: z.array(z.string())
})

const tableInfoSchema = tableSchema.pick({
  id: true,
  name: true
})
type Table = z.infer<typeof tableSchema>
type TableInfo = z.infer<typeof tableInfoSchema>

export function getTables(): Promise<TableInfo[]> {
  return fetch('/api/tables')
    .then((r) => r.json())
    .then((data) => z.array(tableInfoSchema).parse(data))
}

export function getTable(id: number): Promise<Table> {
  return fetch(`/api/tables/${id}`)
    .then((r) => r.json())
    .then((data) => tableSchema.parse(data))
}

export function createTable(input: Omit<Table, 'id'>): Promise<Table> {
  return fetch('/api/tables', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
    .then((r) => r.json())
    .then((data) => tableSchema.parse(data))
}

export function sendTableState(table: Table): Promise<{ message: string }> {
  const playerCards = table.holeCards.map(cards => cards ? cards.join('') : '').join('|')
  const playerBalances = Array(table.capacity).fill(1000).join('|')
  const state = `:${playerCards}:${playerBalances}`

  return fetch('/api/sendTableState', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'dc929e5e5e6d83784baa294a1819dfe1'
    },
    body: new URLSearchParams({
      format: '3blinds-ante',
      state: state
    }).toString()
  })
    .then((r) => r.json())
    .then((data) => {
      console.log(data, '<<<<<<<<<<<<<<<<<<');
      
      if (data.error) {
        throw new Error(data.error)
      }
      return data
    })
}
