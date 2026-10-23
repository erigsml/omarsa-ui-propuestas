/* shadcn/ui: command (cmdk) dentro de un diálogo, el patrón de búsqueda global de shadcn. */
import { Command as Cmdk } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import { Dialog as D } from 'radix-ui';
import type * as React from 'react';
import { cn } from './utils';

export function CommandDialog({ open, onOpenChange, children, titulo }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode; titulo: string }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <D.Content className="bg-popover fixed top-[18%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <D.Title className="sr-only">{titulo}</D.Title>
          <D.Description className="sr-only">Escribe una cédula o un nombre</D.Description>
          <Cmdk shouldFilter={false} className="flex flex-col">
            {children}
          </Cmdk>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof Cmdk.Input>) {
  return (
    <div className="flex h-12 items-center gap-2 border-b px-4">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <Cmdk.Input className={cn('placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-hidden', className)} {...props} />
    </div>
  );
}
export const CommandList = ({ className, ...props }: React.ComponentProps<typeof Cmdk.List>) => <Cmdk.List className={cn('max-h-80 overflow-y-auto p-1', className)} {...props} />;
export const CommandEmpty = (props: React.ComponentProps<typeof Cmdk.Empty>) => <Cmdk.Empty className="text-muted-foreground py-8 text-center text-sm" {...props} />;
export const CommandGroup = ({ className, ...props }: React.ComponentProps<typeof Cmdk.Group>) => (
  <Cmdk.Group className={cn('[&_[cmdk-group-heading]]:text-muted-foreground p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium', className)} {...props} />
);
export const CommandItem = ({ className, ...props }: React.ComponentProps<typeof Cmdk.Item>) => (
  <Cmdk.Item className={cn('data-[selected=true]:bg-accent relative flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm outline-hidden select-none', className)} {...props} />
);
