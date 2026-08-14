export type AdminFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const ADMIN_FORM_INITIAL_STATE: AdminFormState = {
  status: "idle",
  message: null,
};
