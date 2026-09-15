export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  id: string // e.g. ORD-1089
  customerId: string
  customerName: string
  customerEmail: string
  customerAvatar: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  paymentStatus: PaymentStatus
  paymentMethod: 'PromptPay' | 'Credit Card' | 'Bank Transfer' | 'COD'
  orderStatus: OrderStatus
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ProductStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  originalPrice?: number
  stock: number
  category: string
  image: string
  description: string
  status: ProductStatus
  salesCount: number
  createdAt: string
}

export type CustomerTier = 'VIP' | 'REGULAR' | 'NEW'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  location: string
  totalOrders: number
  totalSpent: number
  tier: CustomerTier
  lastOrderDate: string
  joinedDate: string
}

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED'
export type SenderType = 'CUSTOMER' | 'AGENT' | 'SYSTEM'

export interface Message {
  id: string
  conversationId: string
  senderType: SenderType
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  customerId: string
  customer?: Customer
  status: ConversationStatus
  assigneeId?: string
  orderRef?: string
  subject: string
  lastMessage?: string
  lastMessageAt: string
  unreadCount: number
  messages?: Message[]
}

export type SaasTaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type SaasTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface SaasProject {
  id: string
  name: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  color: string
  health: number
  members: number
  dueDate: string
}

export interface SaasAssignee {
  id: string
  name: string
  role: string
  avatar: string
}

export interface SaasTask {
  id: string
  title: string
  description: string
  status: SaasTaskStatus
  priority: SaasTaskPriority
  projectId: string
  projectName: string
  assigneeId: string
  assigneeName: string
  dueDate: string
  progress: number
  estimateHours: number
  tags: string[]
  createdAt: string
}

export interface TaskVelocityPoint {
  week: string
  completed: number
  created: number
}

// Initial Mock Data

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'วิภาวี สุขใจ',
    email: 'wipa@email.com',
    phone: '081-234-5678',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: 'กรุงเทพมหานคร',
    totalOrders: 12,
    totalSpent: 28490,
    tier: 'VIP',
    lastOrderDate: '2026-07-24',
    joinedDate: '2025-02-15',
  },
  {
    id: 'c2',
    name: 'ธนกร มณี',
    email: 'thanakorn@email.com',
    phone: '089-876-5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'เชียงใหม่',
    totalOrders: 6,
    totalSpent: 12350,
    tier: 'REGULAR',
    lastOrderDate: '2026-07-24',
    joinedDate: '2025-06-10',
  },
  {
    id: 'c3',
    name: 'พิมพ์ใจ รักดี',
    email: 'pimjai@email.com',
    phone: '062-345-6789',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    location: 'ชลบุรี',
    totalOrders: 9,
    totalSpent: 19800,
    tier: 'VIP',
    lastOrderDate: '2026-07-23',
    joinedDate: '2025-04-01',
  },
  {
    id: 'c4',
    name: 'สุรชัย วงศ์',
    email: 'surachai@email.com',
    phone: '095-111-2233',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    location: 'นนทบุรี',
    totalOrders: 3,
    totalSpent: 4500,
    tier: 'REGULAR',
    lastOrderDate: '2026-07-20',
    joinedDate: '2026-01-12',
  },
  {
    id: 'c5',
    name: 'มานี มีสุข',
    email: 'manee@email.com',
    phone: '084-555-6677',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'ภูเก็ต',
    totalOrders: 1,
    totalSpent: 1290,
    tier: 'NEW',
    lastOrderDate: '2026-07-24',
    joinedDate: '2026-07-18',
  },
  {
    id: 'c6',
    name: 'กฤษณะ เลิศชัย',
    email: 'kritsana@email.com',
    phone: '082-999-8877',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'ขอนแก่น',
    totalOrders: 4,
    totalSpent: 8700,
    tier: 'REGULAR',
    lastOrderDate: '2026-07-22',
    joinedDate: '2025-11-05',
  },
]

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-101',
    name: 'เสื้อกันฝน RainPro Lightweight Unisex',
    sku: 'APP-RN-001',
    price: 890,
    originalPrice: 1290,
    stock: 45,
    category: 'เครื่องแต่งกาย',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80',
    description: 'เสื้อกันฝนสะท้อนน้ำ เคลือบกันน้ำ 100% พกพาสะดวกพร้อมถุงเก็บ',
    status: 'IN_STOCK',
    salesCount: 342,
    createdAt: '2026-01-10',
  },
  {
    id: 'p-102',
    name: 'กระเป๋าเป้เดินทาง Minimalist Travel Backpack 25L',
    sku: 'BAG-TR-002',
    price: 1590,
    originalPrice: 2190,
    stock: 8,
    category: 'กระเป๋า & แอคเซสเซอรี่',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    description: 'กระเป๋าเป้กันน้ำ มีช่องใส่โน้ตบุ๊ก 15.6 นิ้ว เหมาะสำหรับการเดินทางและทำงาน',
    status: 'LOW_STOCK',
    salesCount: 189,
    createdAt: '2026-02-14',
  },
  {
    id: 'p-103',
    name: 'แก้วเก็บอุณหภูมิ Stainless Tumbler 750ml',
    sku: 'HOME-TB-003',
    price: 650,
    originalPrice: 850,
    stock: 120,
    category: 'ของใช้ในบ้าน',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    description: 'เก็บความเย็นได้นาน 24 ชั่วโมง ความร้อน 12 ชั่วโมง วัสดุ 304 Food Grade',
    status: 'IN_STOCK',
    salesCount: 512,
    createdAt: '2026-03-01',
  },
  {
    id: 'p-104',
    name: 'หูฟังไร้สาย Noise Cancelling Earbuds Pro',
    sku: 'GAD-EB-004',
    price: 2490,
    originalPrice: 3290,
    stock: 0,
    category: 'อุปกรณ์ไอที',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    description: 'ระบบตัดเสียงรบกวน ANC รองรับ Bluetooth 5.3 แบตเตอรี่ใช้งานได้ยาวนาน 30 ชั่วโมง',
    status: 'OUT_OF_STOCK',
    salesCount: 278,
    createdAt: '2026-03-20',
  },
  {
    id: 'p-105',
    name: 'นาฬิกาสมาร์ทวอทช์ Fitness Tracker Band 5',
    sku: 'GAD-SW-005',
    price: 1890,
    originalPrice: 2490,
    stock: 32,
    category: 'อุปกรณ์ไอที',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80',
    description: 'วัดอัตราการเต้นหัวใจ ติดตามการนอน กันน้ำระดับ 5ATM หน้าจอ AMOLED',
    status: 'IN_STOCK',
    salesCount: 165,
    createdAt: '2026-04-05',
  },
  {
    id: 'p-106',
    name: 'หมวกแคปผ้าฝ้าย Organic Cotton Cap',
    sku: 'APP-CP-006',
    price: 420,
    originalPrice: 590,
    stock: 4,
    category: 'เครื่องแต่งกาย',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
    description: 'หมวกทรงคลาสสิก ปรับขนาดได้ สวมใส่สบาย ระบายอากาศดีเยี่ยม',
    status: 'LOW_STOCK',
    salesCount: 94,
    createdAt: '2026-05-12',
  },
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1042',
    customerId: 'c1',
    customerName: 'วิภาวี สุขใจ',
    customerEmail: 'wipa@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    customerPhone: '081-234-5678',
    items: [
      {
        id: 'oi-1',
        productId: 'p-102',
        productName: 'กระเป๋าเป้เดินทาง Minimalist Travel Backpack 25L',
        quantity: 1,
        price: 1590,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 1590,
    paymentStatus: 'PAID',
    paymentMethod: 'PromptPay',
    orderStatus: 'PROCESSING',
    shippingAddress: '99/12 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    trackingNumber: 'TH88291023',
    createdAt: '2026-07-24T09:45:00Z',
    updatedAt: '2026-07-24T10:20:00Z',
  },
  {
    id: 'ORD-1039',
    customerId: 'c2',
    customerName: 'ธนกร มณี',
    customerEmail: 'thanakorn@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    customerPhone: '089-876-5432',
    items: [
      {
        id: 'oi-2',
        productId: 'p-101',
        productName: 'เสื้อกันฝน RainPro Lightweight Unisex',
        quantity: 2,
        price: 890,
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 1780,
    paymentStatus: 'REFUNDED',
    paymentMethod: 'Credit Card',
    orderStatus: 'CANCELLED',
    shippingAddress: '45/8 หมู่ 3 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
    notes: 'กล่องบรรจุภัณฑ์ชำรุดระหว่างขนส่ง ดำเนินการคืนเงินเรียบร้อย',
    createdAt: '2026-07-23T14:10:00Z',
    updatedAt: '2026-07-24T13:20:00Z',
  },
  {
    id: 'ORD-1055',
    customerId: 'c3',
    customerName: 'พิมพ์ใจ รักดี',
    customerEmail: 'pimjai@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    customerPhone: '062-345-6789',
    items: [
      {
        id: 'oi-3',
        productId: 'p-103',
        productName: 'แก้วเก็บอุณหภูมิ Stainless Tumbler 750ml',
        quantity: 2,
        price: 650,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'oi-4',
        productId: 'p-106',
        productName: 'หมวกแคปผ้าฝ้าย Organic Cotton Cap',
        quantity: 1,
        price: 420,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 1720,
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card',
    orderStatus: 'SHIPPED',
    shippingAddress: '120/5 ถนนบางแสนสาย 1 ต.แสนสุข อ.เมือง จ.ชลบุรี 20130',
    trackingNumber: 'TH123456789',
    createdAt: '2026-07-22T11:00:00Z',
    updatedAt: '2026-07-24T11:30:00Z',
  },
  {
    id: 'ORD-1056',
    customerId: 'c4',
    customerName: 'สุรชัย วงศ์',
    customerEmail: 'surachai@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    customerPhone: '095-111-2233',
    items: [
      {
        id: 'oi-5',
        productId: 'p-105',
        productName: 'นาฬิกาสมาร์ทวอทช์ Fitness Tracker Band 5',
        quantity: 1,
        price: 1890,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 1890,
    paymentStatus: 'PAID',
    paymentMethod: 'Bank Transfer',
    orderStatus: 'DELIVERED',
    shippingAddress: '88/90 ถนนงามวงศ์วาน ต.บางเขน อ.เมือง จ.นนทบุรี 11000',
    trackingNumber: 'TH99001122',
    createdAt: '2026-07-20T16:20:00Z',
    updatedAt: '2026-07-22T15:00:00Z',
  },
  {
    id: 'ORD-1057',
    customerId: 'c5',
    customerName: 'มานี มีสุข',
    customerEmail: 'manee@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    customerPhone: '084-555-6677',
    items: [
      {
        id: 'oi-6',
        productId: 'p-101',
        productName: 'เสื้อกันฝน RainPro Lightweight Unisex',
        quantity: 1,
        price: 890,
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'oi-7',
        productId: 'p-106',
        productName: 'หมวกแคปผ้าฝ้าย Organic Cotton Cap',
        quantity: 1,
        price: 420,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 1310,
    paymentStatus: 'PENDING',
    paymentMethod: 'PromptPay',
    orderStatus: 'PENDING',
    shippingAddress: '15/2 ถนนเทพกระษัตรี ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต 83000',
    createdAt: '2026-07-25T08:15:00Z',
    updatedAt: '2026-07-25T08:15:00Z',
  },
  {
    id: 'ORD-1058',
    customerId: 'c6',
    customerName: 'กฤษณะ เลิศชัย',
    customerEmail: 'kritsana@email.com',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    customerPhone: '082-999-8877',
    items: [
      {
        id: 'oi-8',
        productId: 'p-103',
        productName: 'แก้วเก็บอุณหภูมิ Stainless Tumbler 750ml',
        quantity: 4,
        price: 650,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 2600,
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card',
    orderStatus: 'SHIPPED',
    shippingAddress: '300/12 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    trackingNumber: 'TH77665544',
    createdAt: '2026-07-24T18:00:00Z',
    updatedAt: '2026-07-25T07:30:00Z',
  },
]

export const INITIAL_MESSAGES: Message[] = [
  // conv-1: Order #1039 refund
  { id: 'm1', conversationId: 'conv-1', senderType: 'CUSTOMER', content: 'สวัสดีครับ สินค้าที่สั่ง Order #1039 มาถึงแล้วแต่กล่องบุบและเสื้อมีรอยขาด ขอคืนเงินได้ไหมครับ', createdAt: '2026-07-24T08:00:00Z' },
  { id: 'm2', conversationId: 'conv-1', senderType: 'AGENT', content: 'สวัสดีค่ะคุณธนกร ขออภัยในความไม่สะดวกค่ะ รบกวนส่งรูปสินค้าที่ชำรุดมาให้ทีมตรวจสอบได้ไหมคะ', createdAt: '2026-07-24T08:05:00Z' },
  { id: 'm3', conversationId: 'conv-1', senderType: 'CUSTOMER', content: 'ส่งรูปให้แล้วครับ กล่องบุบมากเลย ขนส่งเอามาวางหน้าบ้านแล้วไปเลย', createdAt: '2026-07-24T08:15:00Z' },
  { id: 'm4', conversationId: 'conv-1', senderType: 'AGENT', content: 'ได้รับรูปแล้วค่ะ ทีมกำลังติดต่อบริษัทขนส่งเพื่อเคลมค่ะ คาดว่าจะดำเนินการคืนเงินภายใน 3-5 วันทำการ', createdAt: '2026-07-24T09:00:00Z' },
  { id: 'm5', conversationId: 'conv-1', senderType: 'CUSTOMER', content: 'ขอบคุณครับ รอฟังข่าวนะครับ', createdAt: '2026-07-24T13:20:00Z' },
  // conv-2: Order #1042 payment
  { id: 'm6', conversationId: 'conv-2', senderType: 'CUSTOMER', content: 'ค่ะ สั่ง Order #1042 แล้วโอนเงินไปแล้ว แต่ระบบยังไม่ยืนยันการชำระเงินค่ะ', createdAt: '2026-07-24T10:00:00Z' },
  { id: 'm7', conversationId: 'conv-2', senderType: 'AGENT', content: 'สวัสดีค่ะคุณวิภาวี รบกวนส่งสลิปการโอนเงินมาให้ตรวจสอบได้ไหมคะ', createdAt: '2026-07-24T10:10:00Z' },
  { id: 'm8', conversationId: 'conv-2', senderType: 'CUSTOMER', content: 'ส่งสลิปให้แล้วค่ะ โอน 1,590 บาท เวลา 09:45 น.', createdAt: '2026-07-24T10:20:00Z' },
  // conv-3: Shipping delay
  { id: 'm9', conversationId: 'conv-3', senderType: 'CUSTOMER', content: 'Order #1055 สั่งมา 5 วันแล้ว ยังไม่ได้รับของเลยค่ะ ติดตามสถานะให้หน่อยค่ะ', createdAt: '2026-07-24T11:00:00Z' },
  { id: 'm10', conversationId: 'conv-3', senderType: 'SYSTEM', content: 'ระบบ: ลูกค้าเปิดเคสติดตามพัสดุ Order #1055', createdAt: '2026-07-24T11:00:01Z' },
  { id: 'm11', conversationId: 'conv-3', senderType: 'AGENT', content: 'สวัสดีค่ะคุณพิมพ์ใจ ตรวจสอบแล้วพัสดุอยู่ระหว่างขนส่งค่ะ Tracking: TH123456789 คาดว่าจะถึงภายในวันนี้ค่ะ', createdAt: '2026-07-24T11:30:00Z' },
  // conv-4: Product inquiry
  { id: 'm12', conversationId: 'conv-4', senderType: 'CUSTOMER', content: 'เสื้อกันฝนรุ่น RainPro มีไซส์ XL ไหมครับ สีน้ำเงิน', createdAt: '2026-07-24T12:00:00Z' },
  { id: 'm13', conversationId: 'conv-4', senderType: 'AGENT', content: 'สวัสดีครับคุณสุรชัย ตอนนี้ RainPro สีน้ำเงิน ไซส์ XL เหลือ 3 ตัวค่ะ สนใจสั่งเลยไหมคะ', createdAt: '2026-07-24T12:15:00Z' },
  // conv-5: Return request
  { id: 'm14', conversationId: 'conv-5', senderType: 'CUSTOMER', content: 'สินค้า Order #1028 ไม่ตรงกับที่สั่ง ขอคืนสินค้าค่ะ สีไม่ตรง', createdAt: '2026-07-24T14:00:00Z' },
]

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    customerId: 'c2',
    status: 'OPEN',
    orderRef: 'ORD-1039',
    subject: 'ขอคืนเงิน - สินค้าชำรุดระหว่างขนส่ง',
    lastMessage: 'ขอบคุณครับ รอฟังข่าวนะครับ',
    lastMessageAt: '2026-07-24T13:20:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    customerId: 'c1',
    status: 'PENDING',
    orderRef: 'ORD-1042',
    subject: 'ยืนยันการชำระเงิน Order #1042',
    lastMessage: 'ส่งสลิปให้แล้วค่ะ โอน 1,590 บาท เวลา 09:45 น.',
    lastMessageAt: '2026-07-24T10:20:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv-3',
    customerId: 'c3',
    status: 'OPEN',
    orderRef: 'ORD-1055',
    subject: 'ติดตามสถานะพัสดุ - ล่าช้า',
    lastMessage: 'ตรวจสอบแล้วพัสดุอยู่ระหว่างขนส่งค่ะ Tracking: TH123456789',
    lastMessageAt: '2026-07-24T11:30:00Z',
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    customerId: 'c4',
    status: 'OPEN',
    orderRef: undefined,
    subject: 'สอบถามสินค้า RainPro ไซส์ XL',
    lastMessage: 'ตอนนี้ RainPro สีน้ำเงิน ไซส์ XL เหลือ 3 ตัวค่ะ',
    lastMessageAt: '2026-07-24T12:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'conv-5',
    customerId: 'c5',
    status: 'OPEN',
    orderRef: 'ORD-1057',
    subject: 'ขอคืนสินค้า - สีไม่ตรง',
    lastMessage: 'สินค้า Order #1057 ไม่ตรงกับที่สั่ง ขอคืนสินค้าค่ะ สีไม่ตรง',
    lastMessageAt: '2026-07-24T14:00:00Z',
    unreadCount: 1,
  },
]

export const INITIAL_SAAS_PROJECTS: SaasProject[] = [
  {
    id: 'sp-1',
    name: 'Acme CRM Launch',
    plan: 'Enterprise',
    color: '#2563eb',
    health: 86,
    members: 8,
    dueDate: '2026-08-18',
  },
  {
    id: 'sp-2',
    name: 'Billing Automation',
    plan: 'Growth',
    color: '#059669',
    health: 72,
    members: 5,
    dueDate: '2026-08-05',
  },
  {
    id: 'sp-3',
    name: 'Customer Portal',
    plan: 'Starter',
    color: '#d97706',
    health: 64,
    members: 4,
    dueDate: '2026-09-02',
  },
]

export const INITIAL_SAAS_ASSIGNEES: SaasAssignee[] = [
  {
    id: 'sa-1',
    name: 'Nara Chen',
    role: 'Product Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa-2',
    name: 'Krit S.',
    role: 'Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa-3',
    name: 'Maya Lin',
    role: 'UX Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa-4',
    name: 'Tanawat P.',
    role: 'Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
]

export const INITIAL_SAAS_TASKS: SaasTask[] = [
  {
    id: 'TSK-2401',
    title: 'ออกแบบ onboarding checklist สำหรับลูกค้าใหม่',
    description: 'สร้าง flow ให้ผู้ใช้ setup workspace, invite team และเชื่อม billing ได้ในหน้าเดียว',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    projectId: 'sp-1',
    projectName: 'Acme CRM Launch',
    assigneeId: 'sa-3',
    assigneeName: 'Maya Lin',
    dueDate: '2026-07-31',
    progress: 68,
    estimateHours: 14,
    tags: ['UX', 'Activation'],
    createdAt: '2026-07-15',
  },
  {
    id: 'TSK-2402',
    title: 'เพิ่ม webhook retry สำหรับ invoice failed',
    description: 'เก็บ event log และ retry ตาม exponential backoff เมื่อ provider ตอบ error',
    status: 'IN_REVIEW',
    priority: 'URGENT',
    projectId: 'sp-2',
    projectName: 'Billing Automation',
    assigneeId: 'sa-4',
    assigneeName: 'Tanawat P.',
    dueDate: '2026-07-30',
    progress: 92,
    estimateHours: 18,
    tags: ['Billing', 'API'],
    createdAt: '2026-07-16',
  },
  {
    id: 'TSK-2403',
    title: 'สร้างหน้า account usage chart',
    description: 'แสดง active users, API calls, storage และ quota trend แยกตาม workspace',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: 'sp-3',
    projectName: 'Customer Portal',
    assigneeId: 'sa-2',
    assigneeName: 'Krit S.',
    dueDate: '2026-08-04',
    progress: 12,
    estimateHours: 11,
    tags: ['Analytics', 'Chart'],
    createdAt: '2026-07-18',
  },
  {
    id: 'TSK-2404',
    title: 'เตรียม release note สำหรับ Q3 roadmap',
    description: 'สรุป feature flags, migration notes และ customer-facing changes',
    status: 'DONE',
    priority: 'LOW',
    projectId: 'sp-1',
    projectName: 'Acme CRM Launch',
    assigneeId: 'sa-1',
    assigneeName: 'Nara Chen',
    dueDate: '2026-07-25',
    progress: 100,
    estimateHours: 6,
    tags: ['Docs', 'Launch'],
    createdAt: '2026-07-12',
  },
  {
    id: 'TSK-2405',
    title: 'ปรับสิทธิ์ role-based access สำหรับทีม support',
    description: 'เพิ่ม policy สำหรับอ่าน ticket, แก้ไข conversation และ export report',
    status: 'BACKLOG',
    priority: 'HIGH',
    projectId: 'sp-3',
    projectName: 'Customer Portal',
    assigneeId: 'sa-4',
    assigneeName: 'Tanawat P.',
    dueDate: '2026-08-11',
    progress: 0,
    estimateHours: 20,
    tags: ['Security', 'RBAC'],
    createdAt: '2026-07-21',
  },
  {
    id: 'TSK-2406',
    title: 'ทดลอง pricing experiment สำหรับ Growth plan',
    description: 'สร้าง cohort dashboard และ metric guardrail สำหรับ conversion/retention',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    projectId: 'sp-2',
    projectName: 'Billing Automation',
    assigneeId: 'sa-1',
    assigneeName: 'Nara Chen',
    dueDate: '2026-08-07',
    progress: 44,
    estimateHours: 16,
    tags: ['Growth', 'Experiment'],
    createdAt: '2026-07-20',
  },
]

export const INITIAL_TASK_VELOCITY: TaskVelocityPoint[] = [
  { week: 'W1', completed: 18, created: 22 },
  { week: 'W2', completed: 24, created: 26 },
  { week: 'W3', completed: 21, created: 19 },
  { week: 'W4', completed: 31, created: 28 },
  { week: 'W5', completed: 28, created: 30 },
  { week: 'W6', completed: 36, created: 32 },
]
