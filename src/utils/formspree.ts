// src/utils/formspree.ts
type FormValues = Record<string, unknown>;

interface SubmitToFormspreeParams {
  endpoint: string;
  values: FormValues;
  excludeKeys?: string[];
  formName?: string;
}

interface FormspreeResponse {
  errors?: { message: string }[];
}

export async function submitToFormspree({
  endpoint,
  values,
  excludeKeys = [],
  formName,
}: SubmitToFormspreeParams) {
  if (!endpoint) {
    throw new Error("Form configuration is missing a Formspree endpoint.");
  }

  const sanitizedEntries = Object.entries(values).filter(
    ([key]) => !excludeKeys.includes(key)
  );

  const payload: FormValues = Object.fromEntries(sanitizedEntries);

  if (formName && !payload.formName) {
    payload.formName = formName;
  }

  if (typeof window !== "undefined" && window.location?.href) {
    payload.pageUrl = payload.pageUrl ?? window.location.href;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Unable to submit the form. Please try again later.";

    try {
      const bodyText = await response.text();
      if (bodyText) {
        try {
          const data = JSON.parse(bodyText) as FormspreeResponse;
          errorMessage = data?.errors?.[0]?.message ?? errorMessage;
        } catch {
          errorMessage = bodyText;
        }
      }
    } catch {
      // Ignore parse errors
    }

    throw new Error(errorMessage);
  }
}
