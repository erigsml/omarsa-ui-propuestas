/* shadcn/ui: dialog, alert-dialog, dropdown-menu, tooltip, tabs, popover (Radix). */
import { XIcon } from 'lucide-react';
import { AlertDialog as AD, Dialog as D, DropdownMenu as DM, Popover as PO, Tabs as TB, Tooltip as TT } from 'radix-ui';
import type * as React from 'react';
import { buttonVariants } from './button';
import { cn } from './utils';

const overlay = 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50';
const contenido =
  'bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border p-6 shadow-lg';

export const Dialog = D.Root;
export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Overlay className={overlay} />
      <D.Content className={cn(contenido, className)} {...props}>
        {children}
        <D.Close className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none">
          <XIcon className="size-4" />
          <span className="sr-only">Cerrar</span>
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
export const DialogHeader = ({ className, ...props }: React.ComponentProps<'div'>) => <div className={cn('flex flex-col gap-2', className)} {...props} />;
export const DialogFooter = ({ className, ...props }: React.ComponentProps<'div'>) => <div className={cn('flex justify-end gap-2', className)} {...props} />;
export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof D.Title>) => <D.Title className={cn('text-lg leading-none font-semibold', className)} {...props} />;
export const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof D.Description>) => <D.Description className={cn('text-muted-foreground text-sm', className)} {...props} />;

export const AlertDialog = AD.Root;
export function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AD.Content>) {
  return (
    <AD.Portal>
      <AD.Overlay className={overlay} />
      <AD.Content className={cn(contenido, className)} {...props} />
    </AD.Portal>
  );
}
export const AlertDialogTitle = ({ className, ...props }: React.ComponentProps<typeof AD.Title>) => <AD.Title className={cn('text-lg font-semibold', className)} {...props} />;
export const AlertDialogDescription = ({ className, ...props }: React.ComponentProps<typeof AD.Description>) => <AD.Description className={cn('text-muted-foreground text-sm', className)} {...props} />;
export const AlertDialogAction = ({ className, ...props }: React.ComponentProps<typeof AD.Action>) => <AD.Action className={cn(buttonVariants({ variant: 'destructive' }), className)} {...props} />;
export const AlertDialogCancel = ({ className, ...props }: React.ComponentProps<typeof AD.Cancel>) => <AD.Cancel className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />;

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content sideOffset={sideOffset} className={cn('bg-popover text-popover-foreground z-50 min-w-[10rem] overflow-hidden rounded-md border p-1 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...props} />
    </DM.Portal>
  );
}
export const DropdownMenuItem = ({ className, ...props }: React.ComponentProps<typeof DM.Item>) => (
  <DM.Item className={cn("focus:bg-accent relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
);
export const DropdownMenuCheckboxItem = ({ className, children, ...props }: React.ComponentProps<typeof DM.CheckboxItem>) => (
  <DM.CheckboxItem className={cn('focus:bg-accent relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none', className)} {...props}>
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <DM.ItemIndicator>✓</DM.ItemIndicator>
    </span>
    {children}
  </DM.CheckboxItem>
);
export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentProps<typeof DM.Separator>) => <DM.Separator className={cn('bg-border -mx-1 my-1 h-px', className)} {...props} />;

export function Tooltip({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <TT.Root delayDuration={300}>
      <TT.Trigger asChild>{children}</TT.Trigger>
      <TT.Portal>
        <TT.Content sideOffset={4} className="bg-foreground text-background z-50 rounded-md px-2.5 py-1.5 text-xs animate-in fade-in-0 zoom-in-95">
          {texto}
        </TT.Content>
      </TT.Portal>
    </TT.Root>
  );
}
export const TooltipProvider = TT.Provider;

export const Tabs = TB.Root;
export const TabsList = ({ className, ...props }: React.ComponentProps<typeof TB.List>) => <TB.List className={cn('bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-1', className)} {...props} />;
export const TabsTrigger = ({ className, ...props }: React.ComponentProps<typeof TB.Trigger>) => (
  <TB.Trigger
    className={cn(
      'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm inline-flex h-full items-center justify-center gap-1.5 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none',
      className,
    )}
    {...props}
  />
);
export const TabsContent = ({ className, ...props }: React.ComponentProps<typeof TB.Content>) => <TB.Content className={cn('flex-1 outline-none mt-4', className)} {...props} />;

export const Popover = PO.Root;
export const PopoverAnchor = PO.Anchor;
export function PopoverContent({ className, align = 'start', sideOffset = 4, ...props }: React.ComponentProps<typeof PO.Content>) {
  return (
    <PO.Portal>
      <PO.Content align={align} sideOffset={sideOffset} className={cn('bg-popover text-popover-foreground z-50 rounded-md border p-1 shadow-md outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0', className)} {...props} />
    </PO.Portal>
  );
}
