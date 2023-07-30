export function signOut() {
  return fetch("/auth/sign-out", { method: "DELETE" }).then((response) =>
    response.json()
  );
}

export function signInByCode(code) {
  return fetch("/auth/sign-in-by-code", {
    method: "POST",
    body: JSON.stringify({ code: code }),
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json());
}
