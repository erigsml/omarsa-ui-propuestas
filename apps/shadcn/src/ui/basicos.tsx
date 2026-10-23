/* Componentes de shadcn/ui copiados y adaptados (badge, card, input, label, textarea, skeleton, separator, table, progress, avatar, alert). */
import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar as AvatarPrimitive, Label as LabelPrimitive, Progress as ProgressPrimitive, Separator as SeparatorPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from './utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-white',
        exito: 'border-transparent bg-success-soft text-success',
        aviso: 'border-transparent bg-warning-soft text-warning',
        error: 'border-transparent bg-destructive-soft text-[#9E2806]',
        info: 'border-transparent bg-info-soft text-info',
        neutro: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export type VarianteBadge = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('bg-card text-card-foreground flex flex-col gap-4 rounded-lg border py-5 shadow-xs', className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex items-start justify-between gap-4 px-5', className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('text-base leading-tight font-semibold', className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-muted-foreground text-[12.8px] mt-1', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-5', className)} {...props} />;
}

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-muted-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-card px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground flex min-h-20 w-full rounded-md border bg-card px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn('flex items-center gap-2 text-sm leading-none font-medium select-none', className)} {...props} />;
}

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />;
}

export function Separator({ className, orientation = 'horizontal', ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={orientation}
      className={cn('bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px', className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}
export const TableHeader = ({ className, ...props }: React.ComponentProps<'thead'>) => <thead className={cn('[&_tr]:border-b bg-[#FAFAFB]', className)} {...props} />;
export const TableBody = ({ className, ...props }: React.ComponentProps<'tbody'>) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
export const TableRow = ({ className, ...props }: React.ComponentProps<'tr'>) => <tr className={cn('hover:bg-muted/50 border-b transition-colors', className)} {...props} />;
export const TableHead = ({ className, ...props }: React.ComponentProps<'th'>) => (
  <th className={cn('text-muted-foreground h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide whitespace-nowrap', className)} {...props} />
);
export const TableCell = ({ className, ...props }: React.ComponentProps<'td'>) => <td className={cn('px-3 py-2 align-middle', className)} {...props} />;

export function Progress({ className, value, indicador, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicador?: string }) {
  return (
    <ProgressPrimitive.Root className={cn('bg-muted relative h-2.5 w-full overflow-hidden rounded-full', className)} {...props}>
      <ProgressPrimitive.Indicator className={cn('h-full w-full flex-1 transition-all', indicador ?? 'bg-primary')} style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export function Avatar({ className, children, fondo, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root> & { fondo?: string }) {
  return (
    <AvatarPrimitive.Root className={cn('relative flex size-9 shrink-0 overflow-hidden rounded-full', className)} {...props}>
      <AvatarPrimitive.Fallback className={cn('flex size-full items-center justify-center rounded-full font-semibold', fondo ?? 'bg-[#FBECEC] text-primary')}>{children}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

const alertVariants = cva('relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[20px_1fr] gap-x-3 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      error: 'bg-destructive-soft border-destructive/40 text-[#7A2005] [&>svg]:text-destructive',
      info: 'bg-info-soft border-info/30 text-[#174F80] [&>svg]:text-info',
    },
  },
  defaultVariants: { variant: 'default' },
});
export function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
export const AlertTitle = ({ className, ...props }: React.ComponentProps<'div'>) => <div className={cn('col-start-2 font-semibold tracking-tight', className)} {...props} />;
export const AlertDescription = ({ className, ...props }: React.ComponentProps<'div'>) => <div className={cn('col-start-2 text-sm', className)} {...props} />;
