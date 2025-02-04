import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function calculateUnitPrice(price: number, quantity: number) {
  if (!quantity) return 0;
  return price / quantity;
}

export function formatWhatsAppMessage(products: any[]) {
  const total = products.reduce((sum, p) => sum + Number(p.price), 0);
  
  let message = "*Orçamento*\n\n";
  products.forEach((p) => {
    message += `*${p.name}*\n`;
    message += `Quantidade: ${p.quantity}\n`;
    message += `Preço: ${formatCurrency(Number(p.price))}\n`;
    message += `Valor unitário: ${formatCurrency(calculateUnitPrice(Number(p.price), Number(p.quantity)))}\n\n`;
  });
  
  message += `\n*Total: ${formatCurrency(total)}*`;
  return encodeURIComponent(message);
}
