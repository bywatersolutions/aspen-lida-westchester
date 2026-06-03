export function normalizePage(page = 1, pageSize = 25, maxPageSize = 100) {
     const p = Math.max(1, Number(page) || 1);
     const ps = Math.max(1, Math.min(maxPageSize, Number(pageSize) || 25));
     return { page: p, pageSize: ps, offset: (p - 1) * ps };
}

export function buildPageMeta(page, pageSize, total) {
     const totalPages = Math.max(1, Math.ceil(total / pageSize));
     return {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages,
          hasPrevious: page > 1,
     };
}
