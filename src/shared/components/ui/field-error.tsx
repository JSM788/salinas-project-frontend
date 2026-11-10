export function FieldError({ message, id }: { message?: string; id?: string }) {
  return message ? <span id={id} role="alert" className="block text-xs font-normal text-rose-700">{message}</span> : null;
}
