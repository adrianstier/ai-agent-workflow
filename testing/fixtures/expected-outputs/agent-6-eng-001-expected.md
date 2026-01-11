# Expected Output: Agent 6 - Engineer
## Scenario: eng-001 - Standard CRUD Implementation

This golden file represents the expected structure and quality for Engineer output.

---

## Implementation Plan

### Feature: User Profile CRUD Operations
Based on PRD section 3.2: User Management

### Technical Approach
Implementing RESTful API endpoints with Next.js API routes, Prisma ORM, and Zod validation. Frontend components using React Hook Form with server actions.

---

## Database Schema

### Migration: Add User Profile Fields

```sql
-- Migration: 20240115_add_user_profile_fields
ALTER TABLE users
ADD COLUMN bio TEXT,
ADD COLUMN avatar_url VARCHAR(500),
ADD COLUMN company VARCHAR(255),
ADD COLUMN job_title VARCHAR(255),
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_users_company ON users(company);
```

### Prisma Schema Update

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  bio       String?  @db.Text
  avatarUrl String?  @map("avatar_url")
  company   String?
  jobTitle  String?  @map("job_title")
  timezone  String   @default("UTC")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

---

## API Implementation

### Validation Schema

```typescript
// lib/validations/user.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(255).optional(),
  timezone: z.string().optional(),
});

export const userProfileUpdateSchema = userProfileSchema.partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
```

### API Route: GET /api/users/[id]

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        company: true,
        jobTitle: true,
        timezone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### API Route: PATCH /api/users/[id]

```typescript
// app/api/users/[id]/route.ts (continued)
import { userProfileUpdateSchema } from "@/lib/validations/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Users can only update their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = userProfileUpdateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        company: true,
        jobTitle: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Frontend Implementation

### Profile Form Component

```typescript
// components/profile/ProfileForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { userProfileSchema, type UserProfile } from "@/lib/validations/user";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: user,
  });

  const onSubmit = (data: UserProfile) => {
    startTransition(async () => {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500" role="alert">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          {...form.register("bio")}
          placeholder="Tell us about yourself..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          {form.watch("bio")?.length || 0}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company
          </label>
          <Input id="company" {...form.register("company")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium">
            Job Title
          </label>
          <Input id="jobTitle" {...form.register("jobTitle")} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
```

### Server Action

```typescript
// app/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { userProfileUpdateSchema } from "@/lib/validations/user";
import { authOptions } from "@/lib/auth";

export async function updateProfile(data: unknown) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = userProfileUpdateSchema.parse(data);

    await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
    });

    revalidatePath("/profile");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
```

---

## Testing

### API Tests

```typescript
// __tests__/api/users.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import { GET, PATCH } from "@/app/api/users/[id]/route";

describe("GET /api/users/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { req } = createMocks({ method: "GET" });

    const response = await GET(req, { params: { id: "test-id" } });

    expect(response.status).toBe(401);
  });

  it("returns 404 for non-existent user", async () => {
    // Mock authenticated session
    const { req } = createMocks({ method: "GET" });

    const response = await GET(req, { params: { id: "non-existent" } });

    expect(response.status).toBe(404);
  });

  it("returns user data for valid request", async () => {
    const { req } = createMocks({ method: "GET" });

    const response = await GET(req, { params: { id: "valid-user-id" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("email");
    expect(data).not.toHaveProperty("password");
  });
});

describe("PATCH /api/users/[id]", () => {
  it("returns 403 when updating another user", async () => {
    const { req } = createMocks({
      method: "PATCH",
      body: { name: "New Name" },
    });

    const response = await PATCH(req, { params: { id: "other-user-id" } });

    expect(response.status).toBe(403);
  });

  it("validates input data", async () => {
    const { req } = createMocks({
      method: "PATCH",
      body: { bio: "x".repeat(600) }, // Exceeds 500 char limit
    });

    const response = await PATCH(req, { params: { id: "current-user-id" } });

    expect(response.status).toBe(400);
  });
});
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid session
2. **Authorization**: Users can only modify their own profile
3. **Input Validation**: Zod schemas validate all input
4. **SQL Injection**: Prisma ORM handles parameterized queries
5. **XSS Prevention**: React auto-escapes rendered content
6. **Sensitive Data**: Password and tokens excluded from API responses

---

## Handoff to Next Agent

### Files Created/Modified
- `lib/validations/user.ts` - Validation schemas
- `app/api/users/[id]/route.ts` - API endpoints
- `components/profile/ProfileForm.tsx` - Form component
- `app/actions/profile.ts` - Server action
- `prisma/migrations/20240115_add_user_profile_fields` - Migration
- `__tests__/api/users.test.ts` - API tests

### Deployment Checklist
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Run tests: `npm test`
- [ ] Update types: `npx prisma generate`

### Open Questions
1. Should avatar upload use signed URLs or direct upload?
2. Rate limiting requirements for profile updates?
