"use client";

import React from "react";
import { Clock } from "lucide-react";
import useIdleLogout from "@/hooks/useIdleLogout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Runs the inactivity timer for the whole admin console and shows the last
 * minute as a countdown. Renders nothing until the warning is due.
 *
 * Any mouse movement or key press dismisses the dialog on its own — reaching
 * for the button is already the activity that resets the clock — so the button
 * is there for reassurance rather than because it is the only way out.
 */
const IdleLogout = () => {
  const { warning, secondsLeft, stayLoggedIn, logoutNow } = useIdleLogout(true);

  return (
    <AlertDialog open={warning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Still there?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have not used the admin console for a while. For security you
            will be signed out in{" "}
            <span className="font-semibold text-neutral-900 tabular-nums">
              {secondsLeft}s
            </span>
            . Anything you have not saved will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={logoutNow}>Sign out now</AlertDialogCancel>
          <AlertDialogAction onClick={stayLoggedIn}>
            Stay signed in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default IdleLogout;
