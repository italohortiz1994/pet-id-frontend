"use client";

import { useActionState } from "react";
import {
  acceptFriendshipAction,
  rejectFriendshipAction,
  type FriendshipActionState,
} from "@/app/amigos/actions";

type FriendshipResponseFormProps = {
  friendshipId: string;
};

const initialState: FriendshipActionState = {
  message: "",
  ok: false,
};

export function FriendshipResponseForm({ friendshipId }: FriendshipResponseFormProps) {
  const [acceptState, acceptAction, isAccepting] = useActionState(acceptFriendshipAction, initialState);
  const [rejectState, rejectAction, isRejecting] = useActionState(rejectFriendshipAction, initialState);
  const message = acceptState.message || rejectState.message;
  const ok = acceptState.ok || rejectState.ok;

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <form action={acceptAction} className="min-w-0">
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <button className="button-primary w-full" type="submit" disabled={isAccepting || isRejecting}>
            {isAccepting ? "Aceitando..." : "Aceitar solicitação"}
          </button>
        </form>
        <form action={rejectAction} className="min-w-0">
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <button className="button-secondary danger-button w-full" type="submit" disabled={isAccepting || isRejecting}>
            {isRejecting ? "Recusando..." : "Recusar"}
          </button>
        </form>
      </div>
      {message ? <p className={ok ? "helper-text mt-3" : "field-error"}>{message}</p> : null}
    </div>
  );
}
