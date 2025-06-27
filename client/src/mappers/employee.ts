// src/mappers/employee.ts
import type { Employee } from "@shared/schema";

export function mapEmployee(row: any): Employee {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        department: row.department,
        isActive: !!row.isActive || !!row.is_active,
        createdAt: row.created_at,
    };
}
