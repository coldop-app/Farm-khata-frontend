import React from 'react';

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
