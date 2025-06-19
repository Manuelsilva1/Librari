"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/use-cart';
// import { checkoutRiskAnalysis, type CheckoutRiskAnalysisInput, type CheckoutRiskAnalysisOutput } from '@/ai/flows/checkout-risk-analysis'; // AI Import Removed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // AI Alert Removed
import { Loader2, ShieldCheck, Send, Info } from 'lucide-react'; // ShieldAlert icon removed
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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

export function CheckoutFormClient() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  // const [riskAnalysisResult, setRiskAnalysisResult] = useState<CheckoutRiskAnalysisOutput | null>(null); // AI State Removed
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      paymentMethod: 'Credit Card', 
    },
  });

  const onSubmit: SubmitHandler<CheckoutFormData> = async (data) => {
    setIsLoading(true);
    // setRiskAnalysisResult(null); // AI State Reset Removed

    // const cartContentsDescription = cartItems.map(item => `${item.quantity}x ${item.book.title}`).join(', '); // Not needed without AI
    // const analysisInput: CheckoutRiskAnalysisInput = { ...data, cartContents: cartContentsDescription }; // Not needed

    try {
      // AI Risk Analysis Logic Removed
      // const analysis = await checkoutRiskAnalysis(analysisInput);
      // setRiskAnalysisResult(analysis);

      // Directly simulate order submission
      console.log("Order submitted:", data, cartItems);
      toast({
        title: "Order Submitted!",
        description: "Your order has been successfully placed. (Simulated)",
      });
      clearCart();
      setIsOrderSubmitted(true);
      form.reset();
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isOrderSubmitted) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Order Submitted!</CardTitle>
          <CardDescription>Thank you for your purchase. Your order is being processed (simulated).</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">You will receive an email confirmation shortly.</p>
          <Link href="/catalog" passHref legacyBehavior>
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (cartItems.length === 0 && !isOrderSubmitted) {
     return (
      <Card className="w-full max-w-lg mx-auto shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <Info className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Your Cart is Empty</CardTitle>
          <CardDescription>Please add items to your cart before proceeding to checkout.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/cart" passHref legacyBehavior>
            <Button size="lg">Return to Cart</Button>
          </Link>
        </CardContent>
      </Card>
     );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Secure Checkout</CardTitle>
            <CardDescription>Please fill in your details to complete the purchase. Total: ${getCartTotal().toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Anytown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="90210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Credit Card ending in 1234" {...field} />
                    </FormControl>
                     <FormMessage />
                    <p className="text-xs text-muted-foreground">For demo purposes, any text is accepted.</p>
                  </FormItem>
                )}
              />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            {/* AI Risk Analysis Alert Removed */}
            <Button type="submit" size="lg" disabled={isLoading} className="w-full font-headline text-lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Place Order
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
