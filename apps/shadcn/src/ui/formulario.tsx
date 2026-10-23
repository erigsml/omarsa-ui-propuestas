/* shadcn/ui: checkbox, radio-group, switch, select (Radix). */
import { CheckIcon, ChevronDownIcon, CircleIcon } from 'lucide-react';
import { Checkbox as CB, RadioGroup as RG, Select as SE, Switch as SW } from 'radix-ui';
import type * as React from 'react';
import { cn } from './utils';

const foco = 'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] outline-none';

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CB.Root>) {
  return (
    <CB.Root className={cn('peer border-input size-4 shrink-0 rounded-[4px] border bg-card shadow-xs data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary aria-invalid:border-destructive', foco, className)} {...props}>
      <CB.Indicator className="flex items-center justify-center">
        <CheckIcon className="size-3.5" />
      </CB.Indicator>
    </CB.Root>
  );
}

export const RadioGroup = ({ className, ...props }: React.ComponentProps<typeof RG.Root>) => <RG.Root className={cn('grid gap-3', className)} {...props} />;
export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RG.Item>) {
  return (
    <RG.Item className={cn('border-input text-primary aspect-square size-4 shrink-0 rounded-full border bg-card shadow-xs data-[state=checked]:border-primary aria-invalid:border-destructive', foco, className)} {...props}>
      <RG.Indicator className="relative flex items-center justify-center">
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RG.Indicator>
    </RG.Item>
  );
}

export function Switch({ className, ...props }: React.ComponentProps<typeof SW.Root>) {
  return (
    <SW.Root className={cn('peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all', foco, className)} {...props}>
      <SW.Thumb className="bg-card pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SW.Root>
  );
}

export const Select = SE.Root;
export const SelectValue = SE.Value;
export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SE.Trigger>) {
  return (
    <SE.Trigger className={cn('border-input data-[placeholder]:text-muted-foreground flex h-9 w-fit items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm whitespace-nowrap shadow-xs aria-invalid:border-destructive', foco, className)} {...props}>
      {children}
      <SE.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SE.Icon>
    </SE.Trigger>
  );
}
export function SelectContent({ className, children, position = 'popper', ...props }: React.ComponentProps<typeof SE.Content>) {
  return (
    <SE.Portal>
      <SE.Content position={position} className={cn('bg-popover text-popover-foreground relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1', position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]', className)} {...props}>
        <SE.Viewport className="p-1">{children}</SE.Viewport>
      </SE.Content>
    </SE.Portal>
  );
}
export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SE.Item>) {
  return (
    <SE.Item className={cn('focus:bg-accent relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:opacity-50', className)} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SE.ItemIndicator>
          <CheckIcon className="size-4" />
        </SE.ItemIndicator>
      </span>
      <SE.ItemText>{children}</SE.ItemText>
    </SE.Item>
  );
}
