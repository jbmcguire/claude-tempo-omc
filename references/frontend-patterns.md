# Tempo-Client Frontend Patterns

Reference document for Vue 3 patterns used in the Tempo-Client codebase.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          View                                   │
│                    (Page Component)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Components                                │
│                   (UI Building Blocks)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌─────────────┐ ┌─────────────┐
│    Composables    │ │   Stores    │ │  Services   │
│ (Reusable Logic)  │ │  (Pinia)    │ │ (API Layer) │
└───────────────────┘ └─────────────┘ └─────────────┘
                                            │
                                            ▼
                              ┌─────────────────────┐
                              │     API (axios)     │
                              │   → tempo backend   │
                              └─────────────────────┘
```

## Components

### Single File Component Pattern
```vue
<!-- src/components/settlements/SettlementCard.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import type { Settlement } from '@/types/settlement'
import StatusBadge from '@/components/common/StatusBadge.vue'

// Props with TypeScript
const props = defineProps<{
  settlement: Settlement
  showActions?: boolean
}>()

// Emits with TypeScript
const emit = defineEmits<{
  approve: [settlement: Settlement]
  view: [id: string]
}>()

// Computed
const formattedAmount = computed(() => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(props.settlement.amount)
)

// Methods
function handleApprove() {
  emit('approve', props.settlement)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-semibold text-gray-900">
          {{ settlement.reference_number }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ settlement.carrier.name }}
        </p>
      </div>
      <StatusBadge :status="settlement.status" />
    </div>
    
    <div class="mt-4 flex justify-between items-center">
      <span class="text-lg font-bold text-gray-900">
        {{ formattedAmount }}
      </span>
      
      <div v-if="showActions" class="space-x-2">
        <button
          @click="emit('view', settlement.id)"
          class="btn btn-secondary"
        >
          View
        </button>
        <button
          v-if="settlement.status === 'pending'"
          @click="handleApprove"
          class="btn btn-primary"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>
```

## Composables

### Pattern
```typescript
// src/composables/useSettlements.ts

import { ref, computed, readonly } from 'vue'
import { settlementService } from '@/services/settlementService'
import type { Settlement, CreateSettlementDTO } from '@/types/settlement'

export function useSettlements() {
  // State
  const settlements = ref<Settlement[]>([])
  const current = ref<Settlement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const pending = computed(() => 
    settlements.value.filter(s => s.status === 'pending')
  )

  const approved = computed(() =>
    settlements.value.filter(s => s.status === 'approved')
  )

  // Methods
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      settlements.value = await settlementService.list()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load settlements'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value = null
    try {
      current.value = await settlementService.get(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load settlement'
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateSettlementDTO) {
    loading.value = true
    error.value = null
    try {
      const settlement = await settlementService.create(data)
      settlements.value.push(settlement)
      return settlement
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create settlement'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function approve(id: string) {
    loading.value = true
    error.value = null
    try {
      const updated = await settlementService.approve(id)
      const index = settlements.value.findIndex(s => s.id === id)
      if (index !== -1) {
        settlements.value[index] = updated
      }
      if (current.value?.id === id) {
        current.value = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to approve settlement'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State (readonly to prevent external mutation)
    settlements: readonly(settlements),
    current: readonly(current),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    pending,
    approved,
    
    // Methods
    fetchAll,
    fetchOne,
    create,
    approve,
  }
}
```

## Services

### Pattern
```typescript
// src/services/settlementService.ts

import { api } from '@/services/api'
import type { 
  Settlement, 
  CreateSettlementDTO,
  UpdateSettlementDTO 
} from '@/types/settlement'

export const settlementService = {
  async list(params?: { status?: string }): Promise<Settlement[]> {
    const { data } = await api.get('/api/settlements', { params })
    return data.data
  },

  async get(id: string): Promise<Settlement> {
    const { data } = await api.get(`/api/settlements/${id}`)
    return data.data
  },

  async create(dto: CreateSettlementDTO): Promise<Settlement> {
    const { data } = await api.post('/api/settlements', dto)
    return data.data
  },

  async update(id: string, dto: UpdateSettlementDTO): Promise<Settlement> {
    const { data } = await api.put(`/api/settlements/${id}`, dto)
    return data.data
  },

  async approve(id: string): Promise<Settlement> {
    const { data } = await api.post(`/api/settlements/${id}/approve`)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/settlements/${id}`)
  },
}
```

## Types

### Pattern
```typescript
// src/types/settlement.ts

export interface Settlement {
  id: string
  reference_number: string
  carrier_id: string
  carrier: Carrier
  amount: number
  status: SettlementStatus
  line_items: SettlementLineItem[]
  approved_at: string | null
  approved_by: User | null
  created_at: string
  updated_at: string
}

export type SettlementStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'void'

export interface SettlementLineItem {
  id: string
  description: string
  amount: number
  load_id?: string
  load?: Load
}

export interface CreateSettlementDTO {
  carrier_id: string
  line_items: Omit<SettlementLineItem, 'id'>[]
}

export interface UpdateSettlementDTO {
  line_items?: Omit<SettlementLineItem, 'id'>[]
}
```

## Pinia Stores

### Pattern
```typescript
// src/stores/settlements.ts

import { defineStore } from 'pinia'
import { settlementService } from '@/services/settlementService'
import type { Settlement } from '@/types/settlement'

interface SettlementsState {
  items: Settlement[]
  current: Settlement | null
  loading: boolean
  error: string | null
}

export const useSettlementsStore = defineStore('settlements', {
  state: (): SettlementsState => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),

  getters: {
    pending: (state) => state.items.filter(s => s.status === 'pending'),
    approved: (state) => state.items.filter(s => s.status === 'approved'),
    byId: (state) => (id: string) => state.items.find(s => s.id === id),
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null
      try {
        this.items = await settlementService.list()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to load'
      } finally {
        this.loading = false
      }
    },

    async approve(id: string) {
      const updated = await settlementService.approve(id)
      const index = this.items.findIndex(s => s.id === id)
      if (index !== -1) {
        this.items[index] = updated
      }
      return updated
    },
  },
})
```

## Views

### Pattern
```vue
<!-- src/views/SettlementsView.vue -->

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettlements } from '@/composables/useSettlements'
import SettlementCard from '@/components/settlements/SettlementCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const { 
  settlements, 
  loading, 
  error, 
  fetchAll, 
  approve 
} = useSettlements()

onMounted(() => {
  fetchAll()
})

async function handleApprove(settlement: Settlement) {
  if (confirm(`Approve settlement ${settlement.reference_number}?`)) {
    await approve(settlement.id)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Settlements</h1>

    <LoadingSpinner v-if="loading" />
    
    <ErrorAlert v-else-if="error" :message="error" />
    
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SettlementCard
        v-for="settlement in settlements"
        :key="settlement.id"
        :settlement="settlement"
        show-actions
        @approve="handleApprove"
      />
    </div>
  </div>
</template>
```

## Tailwind Conventions

```css
/* Common button styles */
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}
```
