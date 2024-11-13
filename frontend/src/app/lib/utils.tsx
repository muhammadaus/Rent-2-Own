type ClassName = string | undefined | null;

export function cn(...classes: ClassName[]): string {
  return classes.filter(Boolean).join(' ');
}