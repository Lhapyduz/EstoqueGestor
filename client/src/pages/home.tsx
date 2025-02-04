import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertProductSchema, type Product } from "@shared/schema";
import { formatCurrency, calculateUnitPrice, formatWhatsAppMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Share2, FileDown, Plus } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Home() {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      quantity: "" as any,
      price: "" as any,
    },
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const addProduct = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
      });
    },
  });

  const total = products.reduce((sum, p) => sum + Number(p.price), 0);

  const onSubmit = (data: any) => {
    addProduct.mutate(data);
  };

  const handleShareWhatsApp = () => {
    if (products.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione produtos antes de compartilhar.",
        variant: "destructive",
      });
      return;
    }
    
    const message = formatWhatsAppMessage(products);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleDownloadPDF = async () => {
    if (products.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione produtos antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();

      doc.text("Orçamento", 14, 15);

      const tableColumn = ["Produto", "Quantidade", "Preço", "Valor Unitário"];
      const tableRows = products.map((p) => [
        p.name,
        p.quantity.toString(),
        formatCurrency(Number(p.price)),
        formatCurrency(calculateUnitPrice(Number(p.price), Number(p.quantity))),
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
      });

      const finalY = (doc as any).lastAutoTable.finalY || 25;
      doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 15);

      doc.save("orcamento.pdf");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addProduct.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Valor Unitário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">
                        {product.quantity.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(product.price))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateUnitPrice(
                            Number(product.price),
                            Number(product.quantity)
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Nenhum produto adicionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {products.length > 0 && (
              <div className="mt-4 text-right font-medium">
                Total: {formatCurrency(total)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}