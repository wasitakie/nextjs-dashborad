'use me'

import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_SAAS_ASSIGNEES,
  INITIAL_SAAS_PROJECTS,
  INITIAL_SAAS_TASKS,
  INITIAL_TASK_VELOCITY,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductStatus,
  Customer,
  Conversation,
  Message,
  ConversationStatus,
  SenderType,
  SaasAssignee,
  SaasProject,
  SaasTask,
  SaasTaskPriority,
  SaasTaskStatus,
  TaskVelocityPoint,
} from './data'

// In-Memory Data Stores for fast interactive state mutations
const inMemoryOrders: Order[] = [...INITIAL_ORDERS]
const inMemoryProducts: Product[] = [...INITIAL_PRODUCTS]
const inMemoryCustomers: Customer[] = [...INITIAL_CUSTOMERS]
const inMemoryConversations: Conversation[] = [...INITIAL_CONVERSATIONS]
const inMemoryMessages: Message[] = [...INITIAL_MESSAGES]
const inMemorySaasProjects: SaasProject[] = [...INITIAL_SAAS_PROJECTS]
const inMemorySaasAssignees: SaasAssignee[] = [...INITIAL_SAAS_ASSIGNEES]
const inMemorySaasTasks: SaasTask[] = [...INITIAL_SAAS_TASKS]

/* ==========================================================================
   ORDERS ACTIONS
   ========================================================================== */

export async function getOrders(filters?: {
  status?: string
  paymentStatus?: string
  search?: string
}): Promise<Order[]> {
  let result = [...inMemoryOrders]

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((o) => o.orderStatus === filters.status)
  }

  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    result = result.filter((o) => o.paymentStatus === filters.paymentStatus)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    )
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
): Promise<boolean> {
  const index = inMemoryOrders.findIndex((o) => o.id === orderId)
  if (index !== -1) {
    inMemoryOrders[index] = {
      ...inMemoryOrders[index],
      orderStatus: newStatus,
      trackingNumber: trackingNumber ?? inMemoryOrders[index].trackingNumber,
      updatedAt: new Date().toISOString(),
    }
    return true
  }
  return false
}

export async function updatePaymentStatus(
  orderId: string,
  newPaymentStatus: PaymentStatus
): Promise<boolean> {
  const index = inMemoryOrders.findIndex((o) => o.id === orderId)
  if (index !== -1) {
    inMemoryOrders[index] = {
      ...inMemoryOrders[index],
      paymentStatus: newPaymentStatus,
      updatedAt: new Date().toISOString(),
    }
    return true
  }
  return false
}

/* ==========================================================================
   PRODUCTS ACTIONS
   ========================================================================== */

export async function getProducts(filters?: {
  category?: string
  status?: string
  search?: string
}): Promise<Product[]> {
  let result = [...inMemoryProducts]

  if (filters?.category && filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category)
  }

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((p) => p.status === filters.status)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }

  return result
}

export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<boolean> {
  const index = inMemoryProducts.findIndex((p) => p.id === productId)
  if (index !== -1) {
    const status: ProductStatus =
      newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= 10 ? 'LOW_STOCK' : 'IN_STOCK'
    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      stock: newStock,
      status,
    }
    return true
  }
  return false
}

export async function createProduct(data: {
  name: string
  sku: string
  price: number
  originalPrice?: number
  stock: number
  category: string
  image: string
  description: string
}): Promise<Product> {
  const status: ProductStatus =
    data.stock <= 0 ? 'OUT_OF_STOCK' : data.stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK'

  const newProd: Product = {
    id: `p-${Date.now()}`,
    name: data.name,
    sku: data.sku,
    price: data.price,
    originalPrice: data.originalPrice,
    stock: data.stock,
    category: data.category,
    image:
      data.image ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    description: data.description,
    status,
    salesCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  }

  inMemoryProducts.unshift(newProd)
  return newProd
}

/* ==========================================================================
   CUSTOMERS ACTIONS
   ========================================================================== */

export async function getCustomers(filters?: {
  tier?: string
  search?: string
}): Promise<Customer[]> {
  let result = [...inMemoryCustomers]

  if (filters?.tier && filters.tier !== 'all') {
    result = result.filter((c) => c.tier === filters.tier)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.location.toLowerCase().includes(q)
    )
  }

  return result
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return inMemoryCustomers.find((c) => c.id === id)
}

/* ==========================================================================
   CONVERSATIONS & CHAT ACTIONS
   ========================================================================== */

function enrichConversation(conv: Conversation): Conversation {
  const customer = inMemoryCustomers.find((c) => c.id === conv.customerId)
  const messages = inMemoryMessages.filter((m) => m.conversationId === conv.id)
  const lastMsg = messages[messages.length - 1]
  return {
    ...conv,
    customer,
    lastMessage: lastMsg?.content || conv.lastMessage,
    messages,
  }
}

export async function getConversations(filters?: {
  status?: string
  search?: string
}): Promise<Conversation[]> {
  let result = inMemoryConversations.map(enrichConversation)

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((c) => c.status === filters.status)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.subject.toLowerCase().includes(q) ||
        c.customer?.name.toLowerCase().includes(q) ||
        c.orderRef?.toLowerCase().includes(q)
    )
  }

  return result.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return inMemoryMessages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function sendMessage(
  conversationId: string,
  content: string,
  senderType: SenderType = 'AGENT'
): Promise<Message> {
  const newMessage: Message = {
    id: `m-${Date.now()}`,
    conversationId,
    senderType,
    content,
    createdAt: new Date().toISOString(),
  }

  inMemoryMessages.push(newMessage)

  const convIndex = inMemoryConversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    inMemoryConversations[convIndex] = {
      ...inMemoryConversations[convIndex],
      lastMessage: content,
      lastMessageAt: newMessage.createdAt,
      unreadCount: senderType === 'CUSTOMER' ? inMemoryConversations[convIndex].unreadCount + 1 : 0,
    }
  }

  return newMessage
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus
): Promise<boolean> {
  const convIndex = inMemoryConversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    inMemoryConversations[convIndex] = {
      ...inMemoryConversations[convIndex],
      status,
    }
    return true
  }
  return false
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const convIndex = inMemoryConversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    inMemoryConversations[convIndex] = {
      ...inMemoryConversations[convIndex],
      unreadCount: 0,
    }
  }
}

export async function getUnreadCount(): Promise<number> {
  return inMemoryConversations.reduce((sum, c) => sum + c.unreadCount, 0)
}

/* ==========================================================================
   TASK MANAGEMENT SAAS ACTIONS
   ========================================================================== */

export async function getSaasProjects(): Promise<SaasProject[]> {
  return [...inMemorySaasProjects]
}

export async function getSaasAssignees(): Promise<SaasAssignee[]> {
  return [...inMemorySaasAssignees]
}

export async function getTaskVelocity(): Promise<TaskVelocityPoint[]> {
  return [...INITIAL_TASK_VELOCITY]
}

export async function getSaasTasks(filters?: {
  status?: string
  projectId?: string
  assigneeId?: string
  search?: string
}): Promise<SaasTask[]> {
  let result = [...inMemorySaasTasks]

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((task) => task.status === filters.status)
  }

  if (filters?.projectId && filters.projectId !== 'all') {
    result = result.filter((task) => task.projectId === filters.projectId)
  }

  if (filters?.assigneeId && filters.assigneeId !== 'all') {
    result = result.filter((task) => task.assigneeId === filters.assigneeId)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (task) =>
        task.id.toLowerCase().includes(q) ||
        task.title.toLowerCase().includes(q) ||
        task.projectName.toLowerCase().includes(q) ||
        task.assigneeName.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }

  return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export async function createSaasTask(data: {
  title: string
  description: string
  projectId: string
  assigneeId: string
  priority: SaasTaskPriority
  status: SaasTaskStatus
  dueDate: string
  estimateHours: number
  tags: string[]
}): Promise<SaasTask> {
  const project = inMemorySaasProjects.find((item) => item.id === data.projectId)
  const assignee = inMemorySaasAssignees.find((item) => item.id === data.assigneeId)

  const newTask: SaasTask = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    projectId: data.projectId,
    projectName: project?.name ?? 'Unassigned Project',
    assigneeId: data.assigneeId,
    assigneeName: assignee?.name ?? 'Unassigned',
    dueDate: data.dueDate,
    progress: data.status === 'DONE' ? 100 : 0,
    estimateHours: data.estimateHours,
    tags: data.tags,
    createdAt: new Date().toISOString().split('T')[0],
  }

  inMemorySaasTasks.unshift(newTask)
  return newTask
}

export async function updateSaasTaskStatus(taskId: string, status: SaasTaskStatus): Promise<boolean> {
  const index = inMemorySaasTasks.findIndex((task) => task.id === taskId)
  if (index === -1) return false

  inMemorySaasTasks[index] = {
    ...inMemorySaasTasks[index],
    status,
    progress: status === 'DONE' ? 100 : inMemorySaasTasks[index].progress,
  }

  return true
}

export async function updateSaasTaskProgress(taskId: string, progress: number): Promise<boolean> {
  const index = inMemorySaasTasks.findIndex((task) => task.id === taskId)
  if (index === -1) return false

  const nextProgress = Math.max(0, Math.min(100, Math.round(progress)))
  inMemorySaasTasks[index] = {
    ...inMemorySaasTasks[index],
    progress: nextProgress,
    status: nextProgress === 100 ? 'DONE' : inMemorySaasTasks[index].status,
  }

  return true
}
