import { z } from 'zod';
import { insertUserSchema, insertPcSchema, insertSessionSchema, users, pcs, sessions, adminLogs } from './schema';

// === ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  pcs: {
    list: {
      method: 'GET' as const,
      path: '/api/pcs',
      responses: {
        200: z.array(z.custom<typeof pcs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pcs',
      input: insertPcSchema,
      responses: {
        201: z.custom<typeof pcs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/pcs/:id',
      input: insertPcSchema.partial(),
      responses: {
        200: z.custom<typeof pcs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/pcs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions',
      input: z.object({
        active: z.string().optional(), // "true" or "false"
        pcId: z.string().optional(),
        userId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof sessions.$inferSelect & { user?: typeof users.$inferSelect, pc?: typeof pcs.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions',
      input: insertSessionSchema,
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    end: {
      method: 'POST' as const,
      path: '/api/sessions/:id/end',
      responses: {
        200: z.custom<typeof sessions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalPcs: z.number(),
          activeSessions: z.number(),
          totalRevenue: z.number().optional(), // Placeholder
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
