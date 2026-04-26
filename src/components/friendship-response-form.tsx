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
      <div className="flex flex-wrap gap-3">
        <form action={acceptAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <button className="button-primary" type="submit" disabled={isAccepting || isRejecting}>
            {isAccepting ? "Aceitando..." : "Aceitar"}
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="friendshipId" value={friendshipId} />
          <button className="button-secondary danger-button" type="submit" disabled={isAccepting || isRejecting}>
            {isRejecting ? "Recusando..." : "Recusar"}
          </button>
        </form>
      </div>
      {message ? <p className={ok ? "helper-text mt-3" : "field-error"}>{message}</p> : null}
    </div>
  );
}
