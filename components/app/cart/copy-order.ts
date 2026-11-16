import { fullOrderId } from "@/lib/nakuru/order-ui";

export async function copyOrderText(
  text: string,
  onToast: (msg: string) => void,
  copiedMsg: string,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onToast(copiedMsg);
  } catch {
    onToast(fullOrderId(text));
  }
}