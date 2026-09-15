import { PrismaClient } from '@prisma/client'
import {
  INITIAL_CONVERSATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_MESSAGES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SAAS_ASSIGNEES,
  INITIAL_SAAS_PROJECTS,
  INITIAL_SAAS_TASKS,
  INITIAL_TASK_VELOCITY,
  SaasTaskStatus,
} from '../lib/data'

const prisma = new PrismaClient()

function asDate(value: string): Date {
  return new Date(value)
}

function toLegacyStatus(status: SaasTaskStatus): 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' {
  if (status === 'DONE') return 'COMPLETED'
  if (status === 'BACKLOG') return 'TODO'
  return status
}

async function seedCommerceData() {
  for (const customer of INITIAL_CUSTOMERS) {
    const data = {
      ...customer,
      lastOrderDate: asDate(customer.lastOrderDate),
      joinedDate: asDate(customer.joinedDate),
    }

    await prisma.customer.upsert({
      where: { id: customer.id },
      update: data,
      create: data,
    })
  }

  for (const product of INITIAL_PRODUCTS) {
    const data = {
      ...product,
      createdAt: asDate(product.createdAt),
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: data,
    })
  }

  for (const order of INITIAL_ORDERS) {
    const data = {
      id: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerAvatar: order.customerAvatar,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: asDate(order.createdAt),
      updatedAt: asDate(order.updatedAt),
    }

    await prisma.order.upsert({
      where: { id: order.id },
      update: data,
      create: data,
    })

    for (const item of order.items) {
      const itemData = {
        ...item,
        orderId: order.id,
      }

      await prisma.orderItem.upsert({
        where: { id: item.id },
        update: itemData,
        create: itemData,
      })
    }
  }
}

async function seedConversationData() {
  for (const conversation of INITIAL_CONVERSATIONS) {
    const data = {
      id: conversation.id,
      customerId: conversation.customerId,
      status: conversation.status,
      assigneeId: conversation.assigneeId,
      orderRef: conversation.orderRef,
      subject: conversation.subject,
      lastMessage: conversation.lastMessage,
      lastMessageAt: asDate(conversation.lastMessageAt),
      unreadCount: conversation.unreadCount,
    }

    await prisma.conversation.upsert({
      where: { id: conversation.id },
      update: data,
      create: data,
    })
  }

  for (const message of INITIAL_MESSAGES) {
    const data = {
      ...message,
      createdAt: asDate(message.createdAt),
    }

    await prisma.message.upsert({
      where: { id: message.id },
      update: data,
      create: data,
    })
  }
}

async function seedSaasData() {
  for (const project of INITIAL_SAAS_PROJECTS) {
    const data = {
      ...project,
      dueDate: asDate(project.dueDate),
    }

    await prisma.saasProject.upsert({
      where: { id: project.id },
      update: data,
      create: data,
    })
  }

  for (const assignee of INITIAL_SAAS_ASSIGNEES) {
    await prisma.saasAssignee.upsert({
      where: { id: assignee.id },
      update: assignee,
      create: assignee,
    })
  }

  for (const task of INITIAL_SAAS_TASKS) {
    const data = {
      ...task,
      dueDate: asDate(task.dueDate),
      createdAt: asDate(task.createdAt),
    }

    await prisma.saasTask.upsert({
      where: { id: task.id },
      update: data,
      create: data,
    })
  }

  for (const velocityPoint of INITIAL_TASK_VELOCITY) {
    await prisma.taskVelocityPoint.upsert({
      where: { week: velocityPoint.week },
      update: velocityPoint,
      create: velocityPoint,
    })
  }
}

async function seedLegacyTaskTables() {
  for (const assignee of INITIAL_SAAS_ASSIGNEES) {
    const data = {
      id: assignee.id,
      name: assignee.name,
      email: `${assignee.id}@ecomflow.local`,
      avatar: assignee.avatar,
      role: assignee.role,
    }

    await prisma.user.upsert({
      where: { id: assignee.id },
      update: data,
      create: data,
    })
  }

  for (const [index, project] of INITIAL_SAAS_PROJECTS.entries()) {
    const data = {
      id: project.id,
      name: project.name,
      description: `${project.plan} plan workspace with ${project.members} members`,
      color: project.color,
      key: `SP${index + 1}`,
    }

    await prisma.project.upsert({
      where: { id: project.id },
      update: data,
      create: data,
    })
  }

  for (const task of INITIAL_SAAS_TASKS) {
    const data = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: toLegacyStatus(task.status),
      priority: task.priority,
      dueDate: asDate(task.dueDate),
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      tags: task.tags,
      createdAt: asDate(task.createdAt),
    }

    await prisma.task.upsert({
      where: { id: task.id },
      update: data,
      create: data,
    })
  }
}

async function main() {
  console.log('Seeding Supabase/PostgreSQL database from lib/data.ts...')

  await seedCommerceData()
  await seedConversationData()
  await seedSaasData()
  await seedLegacyTaskTables()

  console.log('Database seeded successfully from lib/data.ts!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
