"use client";

import { Label } from "@/components/ui/label";
import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  id?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, id, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {id
        ? React.Children.map(children, (child, index) => {
            if (index === 0 && React.isValidElement(child)) {
              return React.cloneElement(child, { id });
            }
            return child;
          })
        : children}
    </div>
  );
}