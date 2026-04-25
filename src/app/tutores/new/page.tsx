import { createTutorAction } from "@/app/tutores/actions";
import { initialUserFormState } from "@/app/tutores/form-state";
import { UserForm } from "@/components/user-form";
import { getEmptyUserValues } from "@/lib/users";

type NewTutorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewTutorPage(props: NewTutorPageProps) {
  const searchParams = await props.searchParams;
  const created = searchParams.created === "1";
  const id = typeof searchParams.id === "string" ? searchParams.id : "";

  return (
    <div className="space-y-5">
      {created ? (
        <div className="glass-panel px-6 py-5">
          <span className="eyebrow">Sucesso</span>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Tutor cadastrado com sucesso{ id ? ` com id ${id}` : "" }.
          </p>
        </div>
      ) : null}

      <UserForm
        action={createTutorAction}
        initialState={initialUserFormState}
        initialValues={getEmptyUserValues()}
        title="Cadastrar novo tutor"
        description="Formulario ajustado ao minimo observavel da rota de autenticacao no back-end local."
        submitLabel="Cadastrar tutor"
      />
    </div>
  );
}
