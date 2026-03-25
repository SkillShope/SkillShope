---
name: ship-it-database
description: >-
  Guided database design for production apps. Schema patterns, relationships,
  indexing strategy, migrations, and seeding. Builds on the project scaffold.
  Use after setting up Prisma and before building features.
---

# Database Design

Design your database schema, set up indexes, and seed data. Follow in order.

## Step 1: Define Your Core Models

Start with the entities your app needs. Every SaaS needs at minimum:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  image     String?
  role      String   @default("user") // user | admin
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Decision tree for additional models:**
- Selling something? Add `Product`, `Purchase`, `Price`
- User-generated content? Add `Post`, `Comment`, `Like`
- Multi-tenant? Add `Organization`, `Membership`
- Subscriptions? Add `Subscription`, `Plan`

## Step 2: Relationships

Use these Prisma relationship patterns:

**One-to-many (most common):**
```prisma
model User {
  posts Post[]
}

model Post {
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

**Many-to-many (use explicit join table):**
```prisma
model Post {
  tags PostTag[]
}

model Tag {
  posts PostTag[]
}

model PostTag {
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@unique([postId, tagId])
}
```

**Always use `onDelete: Cascade`** on child relations unless you have a specific reason not to.

## Step 3: Field Patterns

| Pattern | Implementation |
|---------|---------------|
| Timestamps | `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` on every model |
| Soft delete | `deletedAt DateTime?` — filter with `where: { deletedAt: null }` |
| Slugs | `slug String @unique` — generate from name, validate format |
| Enums as strings | `status String @default("draft")` — more flexible than Prisma enums |
| Money | `price Float` or `priceInCents Int` (cents avoids floating point issues) |
| JSON data | `metadata Json?` — for flexible key-value storage |

## Step 4: Indexes

Add indexes for every field you query by:

```prisma
model Post {
  authorId  String
  status    String
  createdAt DateTime @default(now())

  @@index([authorId])
  @@index([status, createdAt])
  @@index([authorId, status])
}
```

**Rules:**
- Every foreign key gets an index
- Every field in a `where` clause gets an index
- Compound indexes for common filter + sort combinations
- Unique constraints are automatic indexes

## Step 5: Push and Validate

```bash
npx prisma db push
npx prisma studio
```

Open Prisma Studio and verify all tables were created.

## Step 6: Seed Data

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@yourapp.com" },
    update: {},
    create: {
      email: "admin@yourapp.com",
      name: "Admin",
      role: "admin",
    },
  });

  // Create sample data
  console.log("Seeded:", admin.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"db:seed": "tsx prisma/seed.ts"
```

```bash
npm install -D tsx
npm run db:seed
```

## Step 7: Prisma Best Practices

1. **Never use `prisma` in client components** — always in server components or API routes
2. **Use `select` to limit returned fields** — don't return entire objects when you need two fields
3. **Use transactions for multi-step writes** — `prisma.$transaction([...])`
4. **Add `prisma generate` to your build script** — ensures Vercel always has the latest client

## Checkpoint

Before proceeding to Auth & Security Hardening:
- [ ] All models defined with proper relationships
- [ ] Indexes on frequently queried fields
- [ ] Seed script creates test data
- [ ] Prisma Studio shows correct schema
