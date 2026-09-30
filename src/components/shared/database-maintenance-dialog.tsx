"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MAINTENANCE_HEADLINE, MAINTENANCE_BODY } from "@/lib/maintenance";

/**
 * The one "you tried to do something that needs the database, and it's
 * down" popup - triggered only by an actual attempt (sign in, register,
 * checkout...), never shown just for browsing. Any form whose server
 * action can return `isDbMaintenance: true` (see dbMaintenanceResultIfApplicable
 * in src/actions/auth.ts) opens this alongside its normal inline error text.
 */
function DatabaseMaintenanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MAINTENANCE_HEADLINE}</DialogTitle>
          <DialogDescription>{MAINTENANCE_BODY}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DatabaseMaintenanceDialog };
