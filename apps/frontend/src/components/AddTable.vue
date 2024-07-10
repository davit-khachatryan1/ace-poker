<template>
    <label class="text-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
      Add table
      <input class="hidden" type="file" @change="handleFileUpload" />
    </label>
  </template>
  
  <script setup lang="ts">
  import { defineEmits } from 'vue'
  
  interface Player {
    seat: string
    name: string
    chips: string
    holeCards?: string[]
  }
  
  interface Table {
    id: string
    name: string
    communityCards: string[]
    players: Player[]
  }
  
  const emit = defineEmits<{
    (e: 'table-added', table: Table): void
  }>()
  
  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files ? input.files[0] : null
    if (file) {
      const text = await file.text()
      const parsedData = parseHandHistory(text)
      emit('table-added', parsedData)
    }
  }
  
  const parseHandHistory = (text: string): Table => {
    const handLines = text.split('\n')
    const tableIdMatch = handLines[0].match(/#(\d+):/)
    const tableId = tableIdMatch ? tableIdMatch[1] : 'Unknown'
    const tableNameMatch = handLines[1].match(/Table '(.+)'/)
    const tableName = tableNameMatch ? tableNameMatch[1] : 'Unknown'
    const communityCardsMatch = handLines.find(line => line.startsWith('*** BOARD ***'))?.match(/\[(.+)\]/)
    const communityCards = communityCardsMatch ? communityCardsMatch[1].split(' ') : []
    const players: Player[] = []
  
    handLines.forEach(line => {
      if (line.startsWith('Seat')) {
        const match = line.match(/Seat (\d+): (.+) \((\d+) in chips\)/)
        if (match) {
          const [seat, name, chips] = match.slice(1, 4)
          players.push({ seat, name, chips })
        }
      }
      if (line.startsWith('Dealt to')) {
        const match = line.match(/Dealt to (.+) \[(.+)\]/)
        if (match) {
          const [name, cards] = match.slice(1, 3)
          const player = players.find(player => player.name === name)
          if (player) {
            player.holeCards = cards.split(' ')
          }
        }
      }
    })
  
    return {
      id: tableId,
      name: tableName,
      communityCards,
      players
    }
  }
  </script>
  