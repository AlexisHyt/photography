export type SubscriptionFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const SUBSCRIPTION_FORM_INITIAL_STATE: SubscriptionFormState = {
  status: "idle",
  message: null,
};
