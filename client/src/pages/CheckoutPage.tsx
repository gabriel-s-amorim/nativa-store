import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthInputField from "@/components/auth/AuthInputField";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutSuccessView from "@/components/checkout/CheckoutSuccessView";
import RequireCustomerAuth from "@/components/RequireCustomerAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { fetchCustomerProfile } from "@/lib/customerApi";
import { OrderApiError, checkoutOrder } from "@/lib/orderApi";
import { checkoutSchema } from "@shared/schemas/order";
import type { CustomerProfile } from "@shared/types/customer";
import type { Order, PaymentMethod } from "@shared/types/order";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Barcode,
  Building2,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Phone,
  QrCode,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

function formatCepInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

const emptyAddress = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

function CheckoutPageContent() {
  const { session } = useCustomerAuth();
  const { items, summary, couponCode, itemCount, isLoading, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    document.title = "Checkout — Nativa Store";
    return () => {
      document.title = "Nativa Store — Artesanato com Alma";
    };
  }, []);

  useEffect(() => {
    if (!isLoading && itemCount === 0 && !completedOrder) {
      setLocation("/carrinho");
    }
  }, [isLoading, itemCount, completedOrder, setLocation]);

  useEffect(() => {
    if (!session?.access_token) return;

    let cancelled = false;
    setProfileLoading(true);

    fetchCustomerProfile(session.access_token)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível carregar seus dados");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  function updateAddress(field: keyof typeof emptyAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next[`shippingAddress.${field}`];
      return next;
    });
  }

  async function handleSubmit() {
    if (!session?.access_token) return;

    const payload = {
      shippingAddress: {
        ...address,
        complemento: address.complemento || undefined,
      },
      paymentMethod,
    };

    const parsed = checkoutSchema.safeParse(payload);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      toast.error("Revise os dados do endereço");
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await checkoutOrder(session.access_token, parsed.data);
      await clearCart();
      setCompletedOrder(response.order);
      toast.success("Pedido confirmado!", {
        description: "Obrigada por comprar na Nativa!",
      });
    } catch (error) {
      const message =
        error instanceof OrderApiError ? error.message : "Não foi possível finalizar a compra";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
        <Navbar />
        <main className="flex justify-center pt-32 pb-16">
          <Spinner className="size-10 text-[#C4522A]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (completedOrder) {
    return (
      <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
        <Navbar />
        <main className="container max-w-6xl pt-20 pb-16 md:pt-24">
          <CheckoutSuccessView order={completedOrder} />
        </main>
        <Footer />
      </div>
    );
  }

  if (itemCount === 0) return null;

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16">
        <div className="container max-w-6xl">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/carrinho"
                    className="text-[#8B6F5E] transition-colors hover:text-[#C4522A]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Carrinho
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage
                  className="font-medium text-[#3D2B1F]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Checkout
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1
              className="mb-2 text-3xl font-bold text-[#3D2B1F] md:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Finalizar compra
            </h1>
            <p className="text-[#8B6F5E]" style={{ fontFamily: "'Lora', serif" }}>
              Preencha seus dados para concluir o pedido
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              {/* Identificação */}
              <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5 md:p-6">
                <h2
                  className="mb-4 text-lg font-bold text-[#3D2B1F]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Identificação
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-[#8B6F5E]">Nome completo</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-[#E8D5C4] bg-[#FAF7F2] px-3.5 py-2.5">
                      <User size={16} className="text-[#8B6F5E]" />
                      <span
                        className="text-sm font-medium text-[#3D2B1F]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {profile?.fullName ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[#8B6F5E]">E-mail</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-[#E8D5C4] bg-[#FAF7F2] px-3.5 py-2.5">
                      <Mail size={16} className="text-[#8B6F5E]" />
                      <span
                        className="truncate text-sm text-[#3D2B1F]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {profile?.email ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[#8B6F5E]">Telefone</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-[#E8D5C4] bg-[#FAF7F2] px-3.5 py-2.5">
                      <Phone size={16} className="text-[#8B6F5E]" />
                      <span
                        className="text-sm text-[#3D2B1F]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {profile?.phone || "Não informado"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5 md:p-6">
                <h2
                  className="mb-4 text-lg font-bold text-[#3D2B1F]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Endereço de entrega
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthInputField
                    id="checkout-cep"
                    label="CEP"
                    icon={MapPin}
                    value={address.cep}
                    onChange={(e) => updateAddress("cep", formatCepInput(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                    error={fieldErrors.cep ?? fieldErrors["shippingAddress.cep"]}
                  />
                  <AuthInputField
                    id="checkout-numero"
                    label="Número"
                    icon={Hash}
                    value={address.numero}
                    onChange={(e) => updateAddress("numero", e.target.value)}
                    placeholder="123"
                    error={fieldErrors.numero ?? fieldErrors["shippingAddress.numero"]}
                  />
                  <div className="sm:col-span-2">
                    <AuthInputField
                      id="checkout-rua"
                      label="Rua"
                      icon={MapPin}
                      value={address.rua}
                      onChange={(e) => updateAddress("rua", e.target.value)}
                      placeholder="Nome da rua"
                      error={fieldErrors.rua ?? fieldErrors["shippingAddress.rua"]}
                    />
                  </div>
                  <AuthInputField
                    id="checkout-complemento"
                    label="Complemento"
                    icon={Building2}
                    value={address.complemento}
                    onChange={(e) => updateAddress("complemento", e.target.value)}
                    placeholder="Apto, bloco (opcional)"
                    error={fieldErrors.complemento ?? fieldErrors["shippingAddress.complemento"]}
                  />
                  <AuthInputField
                    id="checkout-bairro"
                    label="Bairro"
                    icon={MapPin}
                    value={address.bairro}
                    onChange={(e) => updateAddress("bairro", e.target.value)}
                    placeholder="Bairro"
                    error={fieldErrors.bairro ?? fieldErrors["shippingAddress.bairro"]}
                  />
                  <AuthInputField
                    id="checkout-cidade"
                    label="Cidade"
                    icon={MapPin}
                    value={address.cidade}
                    onChange={(e) => updateAddress("cidade", e.target.value)}
                    placeholder="Cidade"
                    error={fieldErrors.cidade ?? fieldErrors["shippingAddress.cidade"]}
                  />
                  <AuthInputField
                    id="checkout-estado"
                    label="Estado (UF)"
                    icon={MapPin}
                    value={address.estado}
                    onChange={(e) => updateAddress("estado", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    maxLength={2}
                    error={fieldErrors.estado ?? fieldErrors["shippingAddress.estado"]}
                  />
                </div>
              </section>

              {/* Pagamento */}
              <section className="rounded-2xl border border-[#E8D5C4] bg-white p-5 md:p-6">
                <h2
                  className="mb-4 text-lg font-bold text-[#3D2B1F]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Forma de pagamento
                </h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {[
                    { value: "pix", label: "Pix", icon: QrCode },
                    { value: "credit_card", label: "Cartão", icon: CreditCard },
                    { value: "boleto", label: "Boleto", icon: Barcode },
                  ].map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        paymentMethod === value
                          ? "border-[#C4522A] bg-[#C4522A]/5"
                          : "border-[#E8D5C4] hover:border-[#C4522A]/40"
                      }`}
                    >
                      <RadioGroupItem value={value} id={`payment-${value}`} />
                      <Icon size={18} className="text-[#C4522A]" />
                      <span
                        className="text-sm font-semibold text-[#3D2B1F]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>

                {paymentMethod === "credit_card" && (
                  <div className="mt-4 grid gap-4 rounded-xl border border-dashed border-[#E8D5C4] bg-[#FAF7F2]/60 p-4 sm:grid-cols-2">
                    <p
                      className="sm:col-span-2 text-xs text-[#8B6F5E]"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      Campos simulados — pagamento não será processado nesta etapa.
                    </p>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="card-number">Número do cartão</Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        className="border-[#E8D5C4] bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="card-name">Nome no cartão</Label>
                      <Input
                        id="card-name"
                        placeholder="Como impresso no cartão"
                        className="border-[#E8D5C4] bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="card-expiry">Validade</Label>
                      <Input id="card-expiry" placeholder="MM/AA" className="border-[#E8D5C4] bg-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input id="card-cvv" placeholder="123" className="border-[#E8D5C4] bg-white" />
                    </div>
                  </div>
                )}

                {paymentMethod === "pix" && (
                  <p
                    className="mt-4 rounded-xl bg-[#2D6A4F]/10 px-4 py-3 text-sm text-[#2D6A4F]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Após confirmar, você receberá um QR Code Pix simulado por e-mail.
                  </p>
                )}

                {paymentMethod === "boleto" && (
                  <p
                    className="mt-4 rounded-xl bg-[#FAF7F2] px-4 py-3 text-sm text-[#8B6F5E]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    O boleto será gerado após a confirmação (simulação).
                  </p>
                )}
              </section>
            </div>

            <CheckoutOrderSummary
              items={items}
              subtotal={summary.subtotal}
              couponCode={couponCode}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireCustomerAuth>
      <CheckoutPageContent />
    </RequireCustomerAuth>
  );
}
