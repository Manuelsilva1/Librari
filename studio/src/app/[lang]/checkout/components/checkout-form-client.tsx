
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-provider'; // Import useAuth
import { createPedido } from '@/services/api';
import type { CreatePedidoPayload, CreatePedidoItemPayload, ApiResponseError } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ShieldCheck, Send, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Dictionary } from '@/types'; // Updated import

const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required"), 
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP code is required").regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  paymentMethod: z.string().min(1, "Payment method is required (e.g. Credit Card, PayPal)"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormClientProps {
  lang: string;
  dictionary: Dictionary;
}

export function CheckoutFormClient({ lang, dictionary }: CheckoutFormClientProps) {
  // Use the new cart structure from useCart
  const { cart, getCartTotal, clearCart: clearCartContextAction, isLoading: isCartLoadingHook, error: cartErrorHook } = useCart(); 
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed isLoading to isSubmitting for clarity
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { toast } = useToast();

  const texts = dictionary.checkoutForm || { 
    secureCheckout: "Secure Checkout",
    fillDetails: "Please fill in your details to complete the purchase. Total: UYU {total}",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "john.doe@example.com",
    addressLabel: "Street Address",
    addressPlaceholder: "123 Main St",
    cityLabel: "City",
    cityPlaceholder: "Anytown",
    stateLabel: "State / Province",
    statePlaceholder: "CA",
    zipLabel: "ZIP / Postal Code",
    zipPlaceholder: "90210",
    paymentMethodLabel: "Payment Method",
    paymentMethodPlaceholder: "e.g. Credit Card ending in 1234",
    paymentMethodDescription: "For demo purposes, any text is accepted.",
    placeOrder: "Place Order",
    orderSubmittedTitle: "Order Submitted!",
    orderSubmittedDescription: "Thank you for your purchase. Your order is being processed (simulated).",
    orderSubmittedConfirmation: "You will receive an email confirmation shortly.",
    continueShopping: "Continue Shopping",
    emptyCartTitle: "Your Cart is Empty",
    emptyCartDescription: "Please add items to your cart before proceeding to checkout.",
    returnToCart: "Return to Cart",
    orderSubmittedToast: "Order Submitted!",
    orderSubmittedToastDesc: "Your order has been successfully placed. (Simulated)",
    checkoutErrorToast: "Checkout Error",
    checkoutErrorToastDesc: "An unexpected error occurred. Please try again."
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.nombre || '', // Pre-fill from auth context if available
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      zip: '',
      paymentMethod: 'Credit Card (Simulated)', 
    },
  });
  
  // Watch for user changes to prefill form
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.nombre || '',
        email: user.email || '',
        address: form.getValues().address, 
        city: form.getValues().city,
        state: form.getValues().state,
        zip: form.getValues().zip,
        paymentMethod: form.getValues().paymentMethod,
      });
    }
  }, [user, form]);

  const onSubmit: SubmitHandler<CheckoutFormData> = async (data) => {
    setSubmissionError(null);
    if (!isAuthenticated) {
      setSubmissionError("You must be logged in to place an order.");
      toast({ title: "Authentication Error", description: "Please log in to continue.", variant: "destructive" });
      // Optionally redirect to login: router.push(`/${lang}/login`);
      return;
    }

    if (!cart || cart.items.length === 0) {
      setSubmissionError("Your cart is empty.");
      toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const items: CreatePedidoItemPayload[] = cart.items.map(item => ({
        libroId: item.libroId,
        cantidad: item.cantidad,
      }));

      const payload: CreatePedidoPayload = {
        nombre: data.name,
        email: data.email,
        direccion: data.address,
        ciudad: data.city,
        estado: data.state,
        zip: data.zip,
        items,
      };

      const created = await createPedido(payload);
      
      toast({
        title: texts.orderSubmittedToast,
        description: texts.orderSubmittedToastDesc,
      });

      await clearCartContextAction(); // Clear cart from context/API
      setIsOrderSubmitted(true); // Show success screen
      form.reset(); 
      // Redirect to a success page, possibly with the sale ID
      router.push(`/${lang}/checkout/success?orderId=${created.id}`);

    } catch (error) {
      const apiError = error as ApiResponseError;
      console.error("Checkout error:", apiError);
      setSubmissionError(apiError.message || "An unexpected error occurred during checkout.");
      toast({
        title: texts.checkoutErrorToast,
        description: apiError.message || texts.checkoutErrorToastDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrderSubmitted) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">{texts.orderSubmittedTitle}</CardTitle>
          <CardDescription>{texts.orderSubmittedDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">{texts.orderSubmittedConfirmation}</p>
          <Link href={`/${lang}/catalog`} passHref legacyBehavior>
            <Button size="lg">{texts.continueShopping}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Display message if cart is empty (and not already submitted)
  // or if cart is loading/has error from the hook itself
  if ((!cart || cart.items.length === 0) && !isOrderSubmitted) {
     return (
      <Card className="w-full max-w-lg mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <Info className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <CardTitle className="font-headline text-3xl">{cartErrorHook ? "Cart Error" : texts.emptyCartTitle}</CardTitle>
          <CardDescription>{cartErrorHook || texts.emptyCartDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href={`/${lang}/cart`} passHref legacyBehavior>
            <Button size="lg">{texts.returnToCart}</Button>
          </Link>
        </CardContent>
      </Card>
     );
  }
  
  if (isCartLoadingHook) { // Show loading if cart is still loading from the hook
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Loading cart details...</p>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{texts.secureCheckout}</CardTitle>
            <CardDescription>{texts.fillDetails.replace('{total}', getCartTotal().toFixed(2))}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {submissionError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">Error:</span> {submissionError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.fullNameLabel}</FormLabel>
                    <FormControl><Input placeholder={texts.fullNamePlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.emailLabel}</FormLabel>
                    <FormControl><Input type="email" placeholder={texts.emailPlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>{texts.addressLabel}</FormLabel>
                  <FormControl><Input placeholder={texts.addressPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.cityLabel}</FormLabel>
                    <FormControl><Input placeholder={texts.cityPlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.stateLabel}</FormLabel>
                    <FormControl><Input placeholder={texts.statePlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="zip" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.zipLabel}</FormLabel>
                    <FormControl><Input placeholder={texts.zipPlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
            </div>
             <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{texts.paymentMethodLabel}</FormLabel>
                    <FormControl><Input placeholder={texts.paymentMethodPlaceholder} {...field} /></FormControl>
                     <FormMessage />
                    <p className="text-xs text-muted-foreground">{texts.paymentMethodDescription}</p>
                  </FormItem>
              )} />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" size="lg" disabled={isSubmitting || isCartLoadingHook} className="w-full font-headline text-lg">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {texts.placeOrder}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
