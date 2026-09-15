# EcomFlow Dashboard

EcomFlow เป็น case study ของระบบหลังบ้านสำหรับทีม e-commerce ที่ต้องดูแลคำสั่งซื้อ สต็อกสินค้า แชทลูกค้า invoice และงานภายในทีมในพื้นที่เดียว โปรเจกต์นี้ออกแบบให้เป็น operations workspace ที่ใช้งานได้จริงมากกว่า landing page: หน้าจอเน้นข้อมูลที่สแกนเร็ว, action ชัด, รองรับ dark mode และใช้ภาษาไทยเป็นหลักสำหรับบริบทผู้ใช้งานในไทย

## Case Study Summary

| หัวข้อ | รายละเอียด |
| --- | --- |
| Product | E-commerce Operations & Customer Support Dashboard |
| Users | ทีมแอดมินร้านค้า, ทีม fulfillment, customer support, project/ops manager |
| Problem | ข้อมูลคำสั่งซื้อ สต็อก แชทลูกค้า และงานทีมกระจายอยู่หลายเครื่องมือ ทำให้ตอบลูกค้าช้าและมองภาพรวมธุรกิจยาก |
| Solution | รวม workflow สำคัญไว้ใน dashboard เดียว พร้อมสรุป metric, ค้นหา/กรองข้อมูล, จัดการสินค้า, ติดตาม task และตอบแชทลูกค้า |
| Stack | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Prisma, Recharts, lucide-react |

## Product Goal

เป้าหมายของ EcomFlow คือทำให้ทีมปฏิบัติการร้านค้าเห็นสถานะธุรกิจแบบ end-to-end โดยไม่ต้องสลับหลายระบบ ผู้ใช้ควรรู้ได้ทันทีว่า:

- วันนี้มีคำสั่งซื้อและรายรับเท่าไร
- สินค้าตัวไหนใกล้หมดหรือหมดสต็อก
- ลูกค้าคนไหนยังรอคำตอบในแชท
- งานทีมไหนค้าง, งานไหนใกล้ deadline, และภาพรวม project health เป็นอย่างไร
- invoice ใดจ่ายแล้วหรือยังรอดำเนินการ

## Key Workflows

### 1. Executive Overview

หน้าแรก (`/`) รวม metric หลักของร้านค้า เช่น revenue, order volume, stock health, unread chat และ chart สำหรับดูแนวโน้ม ทีมสามารถใช้หน้านี้เป็น daily standup screen เพื่อจับสัญญาณผิดปกติได้เร็ว

### 2. Order & Invoice Operations

หน้า Orders (`/orders`) และ Invoices (`/invoices`) ช่วยให้ทีมตรวจสอบรายการคำสั่งซื้อ, สถานะการชำระเงิน, ยอดรวม และข้อมูลลูกค้าได้ในมุมมองเดียว ข้อมูล invoice ผูกกับ order data ทำให้ลดการกรอกซ้ำและช่วยตรวจสอบเอกสารได้ง่ายขึ้น

### 3. Inventory Management

หน้า Products (`/products`), Add Product (`/addproduct`) และ Stocks (`/stocks`) รองรับการดูสินค้า, ค้นหา, กรองตามหมวดหมู่/สถานะ, เพิ่มสินค้าใหม่ และอัปเดต stock status อัตโนมัติจากจำนวนคงเหลือ

สถานะสินค้าที่ใช้:

- `IN_STOCK`
- `LOW_STOCK`
- `OUT_OF_STOCK`

### 4. Customer Chat

หน้า Chat (`/chat`) จำลอง customer support inbox พร้อมรายการ conversation, unread count, filter ตามสถานะ และ message thread สำหรับตอบกลับลูกค้า เหมาะกับเคสที่ทีม support ต้องผูกบทสนทนาเข้ากับ order reference

สถานะแชทที่ใช้:

- `OPEN`
- `PENDING`
- `RESOLVED`

### 5. SaaS Task Management

ระบบ task แยกเป็น 3 มุมมอง:

- Tasks (`/tasks`) สำหรับภาพรวมงานและสร้าง task ใหม่
- Task List (`/tasklist`) สำหรับค้นหา, กรอง, sort และอัปเดต progress
- Task Kanban (`/taskkanban`) สำหรับย้ายสถานะงานแบบ board

สถานะ task ที่ใช้:

- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`

## Design Direction

EcomFlow ถูกออกแบบเป็น admin workspace ที่เงียบและใช้งานซ้ำได้ทุกวัน จึงเลือกแนวทาง:

- Layout แบบ sidebar + content เพื่อให้ย้าย workflow ได้เร็ว
- Card และ table แบบ compact สำหรับข้อมูลจำนวนมาก
- สี slate เป็นพื้นหลัก พร้อม accent เฉพาะสถานะ เช่น success, warning, danger
- ใช้ `lucide-react` เพื่อให้ icon ในเมนูและ action มีภาษาภาพที่สม่ำเสมอ
- รองรับ dark mode ผ่าน `next-themes`
- Copy ภาษาไทยเป็นหลัก แต่คง English product labels ในจุดที่เป็นชื่อ feature หรือ domain term

## Technical Architecture

```text
app/
  layout.tsx          Root layout, metadata, theme provider, sidebar shell
  page.tsx            Dashboard overview
  analytics/          Analytics workspace
  chat/               Customer conversation inbox
  orders/             Order management
  invoices/           Invoice list
  products/           Product management
  addproduct/         Product creation form
  stocks/             Inventory view
  tasks/              SaaS task overview
  tasklist/           Task table/list workflow
  taskkanban/         Kanban workflow

components/
  sidebar.tsx         Main navigation and unread chat badge
  header.tsx          Shared page header
  dashboard-charts.tsx
  chat/               Conversation and message components
  ui/                 Reusable UI primitives

lib/
  data.ts             Shared TypeScript types and mock seed data
  actions.ts          Async app actions backed by in-memory stores
  prisma.ts           Prisma client helper

prisma/
  schema.prisma       PostgreSQL schema for task data
  seed.ts             Database seed script
```

## Data Strategy

ปัจจุบัน UI ใช้ mock data จาก `lib/data.ts` และ action helper ใน `lib/actions.ts` เพื่อให้ interactive ได้ทันทีโดยไม่ต้องต่อ database ทุกครั้ง ตัว Prisma schema ถูกเตรียมไว้สำหรับ PostgreSQL โดยเฉพาะ task management domain

แนวทางนี้เหมาะกับ case study เพราะ:

- ทดลอง UX ได้เร็ว
- demo ได้โดยไม่ต้องตั้งค่า infrastructure เยอะ
- มี type contract ชัดเจนก่อนย้ายไป database จริง
- แยก business entities เช่น order, product, customer, conversation และ SaaS task ออกจาก UI components

## Tech Stack

- Next.js `16.2.11`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- `next-themes` สำหรับ theme switching
- `lucide-react` สำหรับ icon
- Recharts สำหรับ data visualization
- Prisma ORM พร้อม PostgreSQL schema

## Getting Started

ติดตั้ง dependencies:

```bash
pnpm install
```

รัน development server:

```bash
pnpm dev
```

เปิดเว็บที่:

```text
http://localhost:3000
```

ตรวจ lint:

```bash
pnpm lint
```

build production:

```bash
pnpm build
```

seed database เมื่อต้องใช้ Prisma:

```bash
pnpm db:seed
```

ต้องตั้งค่า `DATABASE_URL` ใน `.env` หากต้องใช้งาน Prisma กับ PostgreSQL จริง

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

## What This Project Demonstrates

- การออกแบบ dashboard ที่ครอบคลุมหลาย workflow โดยยังคง navigation ให้เข้าใจง่าย
- การใช้ TypeScript types เป็น contract ระหว่าง mock data, actions และ UI
- การทำ interactive state mutation ผ่าน async helpers ก่อนเชื่อมต่อ backend จริง
- การจัดการ UI ภาษาไทยใน admin tool ที่ยังมี domain term ภาษาอังกฤษ
- การใช้ Next.js App Router กับ component ที่แยก server/client boundary ตามความจำเป็น
- การเตรียมเส้นทางต่อยอดจาก prototype ไปสู่ production data layer ด้วย Prisma

## Next Improvements

- เชื่อม `lib/actions.ts` เข้ากับ Prisma แทน in-memory store
- เพิ่ม authentication และ role-based access control สำหรับทีม admin/support
- เพิ่ม order status update flow พร้อม tracking number และ audit log
- เพิ่ม real-time chat ด้วย websocket หรือ server-sent events
- เพิ่ม automated tests สำหรับ actions, filters และ critical dashboard states
- เพิ่ม empty/error/loading state ให้ครบทุก workflow

## Project Status

โปรเจกต์นี้อยู่ในสถานะ functional case study: หน้าจอหลักและ workflow สำคัญพร้อมใช้งานในระดับ demo/prototype และมีโครงสร้างที่พร้อมต่อยอดเป็นระบบ production ได้เมื่อเชื่อมต่อฐานข้อมูลและระบบ auth จริง
